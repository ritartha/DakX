from __future__ import annotations

from datetime import timedelta
from email import message_from_string
from email.utils import getaddresses, parsedate_to_datetime

from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

from apps.users.models import User

from .models import MailboxEntry, Message, Thread


@shared_task(bind=True, max_retries=3)
def send_mail_task(self, message_id: str) -> None:
    message = Message.objects.select_related('sender').filter(id=message_id).first()
    if not message:
        return
    email = EmailMultiAlternatives(
        subject=message.subject,
        body=message.body_text or message.body_html,
        from_email=message.sender.email,
        to=message.to_addresses,
        cc=message.cc_addresses,
        bcc=message.bcc_addresses,
    )
    if message.body_html:
        email.attach_alternative(message.body_html, 'text/html')
    for attachment in message.attachments.all():
        if attachment.file:
            attachment.file.open('rb')
            email.attach(attachment.filename, attachment.file.read(), attachment.content_type)
    email.send(fail_silently=False)
    message.sent_at = timezone.now()
    message.save(update_fields=['sent_at'])


@shared_task
def cleanup_trash_task() -> int:
    cutoff = timezone.now() - timedelta(days=7)
    queryset = MailboxEntry.objects.filter(is_deleted=True, deleted_at__lt=cutoff)
    count = queryset.count()
    queryset.delete()
    return count


@shared_task(bind=True, max_retries=3)
def process_incoming_mail_task(self, raw_email: str) -> None:
    parsed = message_from_string(raw_email)
    sender_email = parsed.get('From', '')
    recipients = [address for _, address in getaddresses(parsed.get_all('To', []) + parsed.get_all('Cc', []))]
    subject = parsed.get('Subject', '(no subject)')
    body = ''
    if parsed.is_multipart():
        for part in parsed.walk():
            if part.get_content_type() == 'text/plain':
                payload = part.get_payload(decode=True)
                body = payload.decode(errors='ignore') if payload else ''
                break
    else:
        payload = parsed.get_payload(decode=True)
        body = payload.decode(errors='ignore') if payload else parsed.get_payload()
    sender = User.objects.filter(email__iexact=sender_email).first() or User.objects.filter(is_superuser=True).first()
    if not sender:
        return
    in_reply_to_header = parsed.get('In-Reply-To')
    in_reply_to = Message.objects.filter(message_id=in_reply_to_header).first() if in_reply_to_header else None
    thread = in_reply_to.thread if in_reply_to else Thread.objects.create(subject=subject)
    sent_at = parsedate_to_datetime(parsed.get('Date')) if parsed.get('Date') else timezone.now()
    message = Message.objects.create(
        thread=thread,
        sender=sender,
        to_addresses=recipients,
        subject=subject,
        body_text=body,
        headers=dict(parsed.items()),
        sent_at=sent_at,
        in_reply_to=in_reply_to,
    )
    for recipient in User.objects.filter(email__in=[email.lower() for email in recipients]):
        thread.participants.add(recipient, sender)
        MailboxEntry.objects.get_or_create(
            user=recipient,
            message=message,
            defaults={'thread': thread, 'folder': MailboxEntry.INBOX},
        )


@shared_task
def notify_recipients_task(message_id: str) -> None:
    message = Message.objects.select_related('sender', 'thread').filter(id=message_id).first()
    if not message:
        return
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    for entry in MailboxEntry.objects.select_related('user').filter(message=message, folder=MailboxEntry.INBOX):
        async_to_sync(channel_layer.group_send)(
            f'notifications_{entry.user_id}',
            {
                'type': 'notification.message',
                'event': 'new_mail',
                'message_id': str(message.id),
                'subject': message.subject,
                'sender': message.sender.email,
            },
        )
