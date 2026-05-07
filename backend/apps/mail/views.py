from __future__ import annotations

from rest_framework import generics, mixins, permissions, response, status, viewsets
from rest_framework.parsers import MultiPartParser

from common.validators import validate_attachment_size

from .filters import MailboxEntryFilter
from .models import Attachment, Folder, Label, MailboxEntry
from .repositories import MailRepository
from .serializers import (
    AttachmentSerializer,
    ComposeSerializer,
    FolderSerializer,
    ForwardSerializer,
    LabelSerializer,
    MailboxEntrySerializer,
    MessageSerializer,
    ReplySerializer,
    ThreadSerializer,
)
from .services import MailService


class MailboxEntryViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = MailboxEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_class = MailboxEntryFilter

    def get_queryset(self):
        folder = self.request.query_params.get('folder')
        if folder:
            return MailRepository.get_folder(self.request.user, folder)
        return MailRepository.get_inbox(self.request.user)

    def partial_update(self, request, *args, **kwargs):
        entry = self.get_queryset().filter(pk=kwargs['pk']).first()
        if not entry:
            return response.Response({'detail': 'Mailbox entry not found.'}, status=status.HTTP_404_NOT_FOUND)
        if 'is_read' in request.data and request.data['is_read']:
            MailService.mark_read(request.user, [entry.id])
            entry.refresh_from_db()
        if 'is_starred' in request.data:
            entry = MailService.mark_starred(request.user, entry.id, bool(request.data['is_starred']))
        return response.Response(self.get_serializer(entry).data)

    def destroy(self, request, *args, **kwargs):
        MailService.move_to_trash(request.user, kwargs['pk'])
        return response.Response(status=status.HTTP_204_NO_CONTENT)


class ThreadViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MailRepository.get_thread_queryset(self.request.user)

    def retrieve(self, request, *args, **kwargs):
        data = MailService.get_thread(request.user, kwargs['pk'])
        return response.Response({
            'thread': ThreadSerializer(data['thread']).data,
            'messages': MessageSerializer(data['messages'], many=True).data,
        })


class ComposeView(generics.CreateAPIView):
    serializer_class = ComposeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = MailService.compose(sender=request.user, **serializer.validated_data)
        return response.Response({'message_id': str(message.id)}, status=status.HTTP_201_CREATED)


class ReplyView(generics.CreateAPIView):
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = MailService.reply(request.user, **serializer.validated_data)
        return response.Response({'message_id': str(message.id)}, status=status.HTTP_201_CREATED)


class ForwardView(generics.CreateAPIView):
    serializer_class = ForwardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = MailService.forward(request.user, **serializer.validated_data)
        return response.Response({'message_id': str(message.id)}, status=status.HTTP_201_CREATED)


class LabelViewSet(viewsets.ModelViewSet):
    serializer_class = LabelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Label.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Folder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AttachmentUploadView(generics.CreateAPIView):
    serializer_class = AttachmentSerializer
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        uploaded_file = request.FILES['file']
        validate_attachment_size(uploaded_file)
        attachment = Attachment.objects.create(
            filename=uploaded_file.name,
            content_type=uploaded_file.content_type or 'application/octet-stream',
            size_bytes=uploaded_file.size,
            file=uploaded_file,
        )
        return response.Response(AttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)


class SearchView(generics.ListAPIView):
    serializer_class = MailboxEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MailService.search(self.request.user, self.request.query_params.get('q', ''), self.request.query_params.get('folder'))


class TrashRestoreView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        entry = MailService.restore_from_trash(request.user, kwargs['pk'])
        return response.Response(MailboxEntrySerializer(entry).data)
