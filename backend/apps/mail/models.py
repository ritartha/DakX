from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from common.utils import generate_message_id
from common.validators import validate_hex_color


class Label(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='labels')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7, validators=[validate_hex_color])
    slug = models.SlugField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'slug')
        ordering = ('name',)

    def __str__(self) -> str:
        return self.name


class Thread(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.CharField(max_length=255)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='threads', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    message_count = models.PositiveIntegerField(default=0)
    last_message_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ('-updated_at',)

    def __str__(self) -> str:
        return self.subject


class Folder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='folders')
    name = models.CharField(max_length=100)
    slug = models.SlugField()
    color = models.CharField(max_length=7, validators=[validate_hex_color])
    icon = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'slug')
        ordering = ('name',)

    def __str__(self) -> str:
        return self.name


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    to_addresses = models.JSONField(default=list)
    cc_addresses = models.JSONField(default=list)
    bcc_addresses = models.JSONField(default=list)
    subject = models.CharField(max_length=255)
    body_text = models.TextField(blank=True)
    body_html = models.TextField(blank=True)
    in_reply_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='replies')
    message_id = models.CharField(max_length=255, unique=True, blank=True)
    headers = models.JSONField(default=dict, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_draft = models.BooleanField(default=False)

    class Meta:
        ordering = ('-created_at',)

    def save(self, *args, **kwargs):
        if not self.message_id:
            self.message_id = generate_message_id(getattr(settings, 'DOMAIN', 'dakx.local'))
        super().save(*args, **kwargs)
        if self.thread_id:
            self.thread.subject = self.subject
            self.thread.message_count = self.thread.messages.count()
            self.thread.last_message_at = self.sent_at or timezone.now()
            self.thread.save(update_fields=['subject', 'message_count', 'last_message_at', 'updated_at'])

    def __str__(self) -> str:
        return self.subject


class MailboxEntry(models.Model):
    INBOX = 'INBOX'
    SENT = 'SENT'
    DRAFTS = 'DRAFTS'
    TRASH = 'TRASH'
    SPAM = 'SPAM'
    ARCHIVE = 'ARCHIVE'
    FOLDER_CHOICES = [
        (INBOX, 'Inbox'),
        (SENT, 'Sent'),
        (DRAFTS, 'Drafts'),
        (TRASH, 'Trash'),
        (SPAM, 'Spam'),
        (ARCHIVE, 'Archive'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mailbox_entries')
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='mailbox_entries')
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, related_name='mailbox_entries')
    folder = models.CharField(max_length=20, choices=FOLDER_CHOICES, default=INBOX)
    custom_folder = models.ForeignKey(Folder, null=True, blank=True, on_delete=models.SET_NULL, related_name='entries')
    is_read = models.BooleanField(default=False)
    is_starred = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    labels = models.ManyToManyField(Label, blank=True, related_name='entries')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'message')
        ordering = ('-created_at',)

    def __str__(self) -> str:
        return f'{self.user} - {self.message.subject}'


class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments', null=True, blank=True)
    filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    size_bytes = models.PositiveIntegerField()
    file = models.FileField(upload_to='attachments/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-uploaded_at',)

    def __str__(self) -> str:
        return self.filename
