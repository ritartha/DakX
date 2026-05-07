from __future__ import annotations

from typing import Iterable

from django.db import transaction
from django.db.models import Q, QuerySet
from django.utils import timezone

from common.exceptions import MailNotFoundError, UnauthorizedAccessError
from common.utils import sanitize_html

from apps.users.models import User
from apps.users.repositories import UserRepository

from .models import Attachment, Label, MailboxEntry, Message, Thread
from .repositories import MailRepository
from .tasks import send_mail_task


class MailService:
    @staticmethod
    def _normalize_addresses(addresses: Iterable[str] | None) -> list[str]:
        return [address.strip().lower() for address in (addresses or []) if address and address.strip()]

    @classmethod
    @transaction.atomic
    def compose(
        cls,
        sender: User,
        to,
        cc,
        bcc,
        subject: str,
        body_html: str,
        body_text: str,
        attachment_ids,
        thread_id=None,
        is_draft: bool = False,
    ) -> Message:
        to_addresses = cls._normalize_addresses(to)
        cc_addresses = cls._normalize_addresses(cc)
        bcc_addresses = cls._normalize_addresses(bcc)
        thread = Thread.objects.filter(id=thread_id).first() if thread_id else None
        if thread is None:
            thread = Thread.objects.create(subject=subject)
        sanitized_html = sanitize_html(body_html)
        message = Message.objects.create(
            thread=thread,
            sender=sender,
            to_addresses=to_addresses,
            cc_addresses=cc_addresses,
            bcc_addresses=bcc_addresses,
            subject=subject,
            body_html=sanitized_html,
            body_text=body_text,
            is_draft=is_draft,
        )
        thread.participants.add(sender)
        sender_entry, _ = MailboxEntry.objects.get_or_create(
            user=sender,
            message=message,
            defaults={'thread': thread, 'folder': MailboxEntry.DRAFTS if is_draft else MailboxEntry.SENT, 'is_read': True},
        )
        if is_draft:
            sender_entry.folder = MailboxEntry.DRAFTS
            sender_entry.is_read = True
            sender_entry.save(update_fields=['folder', 'is_read', 'updated_at'])
        recipient_users = list(User.objects.filter(email__in=to_addresses + cc_addresses + bcc_addresses))
        for recipient in recipient_users:
            thread.participants.add(recipient)
            MailboxEntry.objects.get_or_create(
                user=recipient,
                message=message,
                defaults={'thread': thread, 'folder': MailboxEntry.INBOX},
            )
        if attachment_ids:
            Attachment.objects.filter(id__in=attachment_ids, message__isnull=True).update(message=message)
        if not is_draft:
            transaction.on_commit(lambda: send_mail_task.delay(str(message.id)))
        return message

    @classmethod
    def reply(cls, user: User, message_id, body_html: str, body_text: str, reply_all: bool = False) -> Message:
        original = MailRepository.get_message(message_id)
        if not original:
            raise MailNotFoundError()
        recipients = list(original.to_addresses)
        if original.sender.email.lower() not in recipients:
            recipients = [original.sender.email.lower(), *recipients]
        if not reply_all:
            recipients = [original.sender.email.lower()]
        cc = original.cc_addresses if reply_all else []
        return cls.compose(
            sender=user,
            to=[address for address in recipients if address != user.email.lower()],
            cc=[address for address in cc if address != user.email.lower()],
            bcc=[],
            subject=original.subject if original.subject.lower().startswith('re:') else f'Re: {original.subject}',
            body_html=body_html,
            body_text=body_text,
            attachment_ids=[],
            thread_id=original.thread_id,
        )

    @classmethod
    def forward(cls, user: User, message_id, to, body_html: str) -> Message:
        original = MailRepository.get_message(message_id)
        if not original:
            raise MailNotFoundError()
        return cls.compose(
            sender=user,
            to=to,
            cc=[],
            bcc=[],
            subject=original.subject if original.subject.lower().startswith('fwd:') else f'Fwd: {original.subject}',
            body_html=body_html,
            body_text=original.body_text,
            attachment_ids=list(original.attachments.values_list('id', flat=True)),
            thread_id=None,
        )

    @staticmethod
    def move_to_trash(user: User, entry_id) -> MailboxEntry:
        entry = MailRepository.get_entry(user, entry_id)
        if not entry:
            raise MailNotFoundError()
        entry.folder = MailboxEntry.TRASH
        entry.is_deleted = True
        entry.deleted_at = timezone.now()
        entry.save(update_fields=['folder', 'is_deleted', 'deleted_at', 'updated_at'])
        return entry

    @staticmethod
    def restore_from_trash(user: User, entry_id) -> MailboxEntry:
        entry = MailRepository.get_entry(user, entry_id)
        if not entry:
            raise MailNotFoundError()
        entry.folder = MailboxEntry.INBOX
        entry.is_deleted = False
        entry.deleted_at = None
        entry.save(update_fields=['folder', 'is_deleted', 'deleted_at', 'updated_at'])
        return entry

    @staticmethod
    def permanently_delete(user: User, entry_id) -> None:
        entry = MailRepository.get_entry(user, entry_id)
        if not entry:
            raise MailNotFoundError()
        entry.delete()

    @staticmethod
    def mark_read(user: User, entry_ids: list) -> int:
        return MailboxEntry.objects.filter(user=user, id__in=entry_ids).update(is_read=True, updated_at=timezone.now())

    @staticmethod
    def mark_starred(user: User, entry_id, starred: bool) -> MailboxEntry:
        entry = MailRepository.get_entry(user, entry_id)
        if not entry:
            raise MailNotFoundError()
        entry.is_starred = starred
        entry.save(update_fields=['is_starred', 'updated_at'])
        return entry

    @staticmethod
    def apply_label(user: User, entry_id, label_id) -> MailboxEntry:
        entry = MailRepository.get_entry(user, entry_id)
        label = Label.objects.filter(id=label_id, user=user).first()
        if not entry or not label:
            raise MailNotFoundError('Mailbox entry or label could not be found.')
        entry.labels.add(label)
        return entry

    @staticmethod
    def remove_label(user: User, entry_id, label_id) -> MailboxEntry:
        entry = MailRepository.get_entry(user, entry_id)
        label = Label.objects.filter(id=label_id, user=user).first()
        if not entry or not label:
            raise MailNotFoundError('Mailbox entry or label could not be found.')
        entry.labels.remove(label)
        return entry

    @staticmethod
    def search(user: User, query: str, folder: str = None) -> QuerySet[MailboxEntry]:
        return MailRepository.search_messages(user, query, folder)

    @staticmethod
    def get_thread(user: User, thread_id) -> dict:
        thread = MailRepository.get_thread_queryset(user).filter(id=thread_id).first()
        if not thread:
            raise MailNotFoundError('Thread not found.')
        messages = list(thread.messages.all())
        return {'thread': thread, 'messages': messages, 'participants': list(thread.participants.all())}

    @staticmethod
    def get_unread_count(user: User) -> int:
        return MailboxEntry.objects.filter(user=user, is_read=False, folder=MailboxEntry.INBOX).count()
