from __future__ import annotations

from rest_framework import serializers

from apps.users.serializers import UserSerializer

from .models import Attachment, Folder, Label, MailboxEntry, Message, Thread


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ('id', 'filename', 'content_type', 'size_bytes', 'file', 'uploaded_at')
        read_only_fields = ('id', 'uploaded_at', 'size_bytes')


class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ('id', 'name', 'color', 'slug', 'created_at')
        read_only_fields = ('id', 'created_at')


class FolderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Folder
        fields = ('id', 'name', 'slug', 'color', 'icon', 'created_at')
        read_only_fields = ('id', 'created_at')


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    attachments = AttachmentSerializer(read_only=True, many=True)

    class Meta:
        model = Message
        fields = (
            'id',
            'thread',
            'sender',
            'to_addresses',
            'cc_addresses',
            'bcc_addresses',
            'subject',
            'body_text',
            'body_html',
            'in_reply_to',
            'message_id',
            'headers',
            'sent_at',
            'created_at',
            'is_draft',
            'attachments',
        )
        read_only_fields = ('id', 'message_id', 'sent_at', 'created_at', 'attachments')


class MailboxEntrySerializer(serializers.ModelSerializer):
    message = MessageSerializer(read_only=True)
    labels = LabelSerializer(read_only=True, many=True)

    class Meta:
        model = MailboxEntry
        fields = (
            'id',
            'folder',
            'custom_folder',
            'is_read',
            'is_starred',
            'is_deleted',
            'deleted_at',
            'message',
            'thread',
            'labels',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'deleted_at', 'created_at', 'updated_at')


class ThreadSerializer(serializers.ModelSerializer):
    latest_message_preview = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = ('id', 'subject', 'message_count', 'last_message_at', 'created_at', 'updated_at', 'latest_message_preview')

    def get_latest_message_preview(self, obj) -> str:
        latest = obj.messages.first()
        if not latest:
            return ''
        source = latest.body_text or latest.body_html
        return source[:140]


class ComposeSerializer(serializers.Serializer):
    to = serializers.ListField(child=serializers.EmailField(), allow_empty=False)
    cc = serializers.ListField(child=serializers.EmailField(), required=False, default=list)
    bcc = serializers.ListField(child=serializers.EmailField(), required=False, default=list)
    subject = serializers.CharField(max_length=255)
    body_html = serializers.CharField(required=False, allow_blank=True, default='')
    body_text = serializers.CharField(required=False, allow_blank=True, default='')
    attachment_ids = serializers.ListField(child=serializers.UUIDField(), required=False, default=list)
    thread_id = serializers.UUIDField(required=False, allow_null=True)
    is_draft = serializers.BooleanField(required=False, default=False)


class ReplySerializer(serializers.Serializer):
    message_id = serializers.UUIDField()
    body_html = serializers.CharField(required=False, allow_blank=True, default='')
    body_text = serializers.CharField(required=False, allow_blank=True, default='')
    reply_all = serializers.BooleanField(required=False, default=False)


class ForwardSerializer(serializers.Serializer):
    message_id = serializers.UUIDField()
    to = serializers.ListField(child=serializers.EmailField(), allow_empty=False)
    body_html = serializers.CharField(required=False, allow_blank=True, default='')
