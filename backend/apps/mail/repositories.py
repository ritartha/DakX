from __future__ import annotations

from typing import Optional

from django.db.models import Prefetch, Q, QuerySet

from .models import Attachment, Folder, Label, MailboxEntry, Message, Thread


class MailRepository:
    entry_related = ('message__sender', 'thread', 'custom_folder')

    @classmethod
    def _entry_queryset(cls, user) -> QuerySet[MailboxEntry]:
        return MailboxEntry.objects.filter(user=user).select_related(*cls.entry_related).prefetch_related(
            'labels',
            Prefetch('message__attachments', queryset=Attachment.objects.all()),
        )

    @classmethod
    def get_inbox(cls, user, page=None) -> QuerySet[MailboxEntry]:
        return cls._entry_queryset(user).filter(folder=MailboxEntry.INBOX)

    @classmethod
    def get_folder(cls, user, folder: str, page=None) -> QuerySet[MailboxEntry]:
        return cls._entry_queryset(user).filter(folder=folder)

    @staticmethod
    def get_message(message_id) -> Optional[Message]:
        return Message.objects.filter(id=message_id).select_related('sender', 'thread', 'in_reply_to').prefetch_related('attachments').first()

    @classmethod
    def get_entry(cls, user, entry_id) -> Optional[MailboxEntry]:
        return cls._entry_queryset(user).filter(id=entry_id).first()

    @classmethod
    def get_thread_messages(cls, user, thread_id) -> QuerySet[Message]:
        return Message.objects.filter(thread_id=thread_id, mailbox_entries__user=user).select_related('sender', 'thread', 'in_reply_to').prefetch_related('attachments').distinct()

    @classmethod
    def search_messages(cls, user, query: str, folder: str | None = None) -> QuerySet[MailboxEntry]:
        queryset = cls._entry_queryset(user).filter(
            Q(message__subject__icontains=query)
            | Q(message__body_text__icontains=query)
            | Q(message__body_html__icontains=query)
            | Q(message__sender__email__icontains=query)
        )
        if folder:
            queryset = queryset.filter(folder=folder)
        return queryset.distinct()

    @classmethod
    def get_thread_queryset(cls, user) -> QuerySet[Thread]:
        return Thread.objects.filter(mailbox_entries__user=user).prefetch_related(
            'participants',
            Prefetch('messages', queryset=Message.objects.select_related('sender').prefetch_related('attachments')),
        ).distinct()
