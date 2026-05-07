from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.users.models import User

from .models import MailboxEntry, Message
from .tasks import notify_recipients_task


@receiver(post_save, sender=Message)
def create_mailbox_entries_for_message(sender, instance: Message, created: bool, **kwargs) -> None:
    if not created or instance.is_draft:
        return
    MailboxEntry.objects.get_or_create(
        user=instance.sender,
        message=instance,
        defaults={'thread': instance.thread, 'folder': MailboxEntry.SENT, 'is_read': True},
    )
    addresses = list({*instance.to_addresses, *instance.cc_addresses, *instance.bcc_addresses})
    for recipient in User.objects.filter(email__in=addresses):
        instance.thread.participants.add(recipient, instance.sender)
        MailboxEntry.objects.get_or_create(
            user=recipient,
            message=instance,
            defaults={'thread': instance.thread, 'folder': MailboxEntry.INBOX},
        )
    notify_recipients_task.delay(str(instance.id))
