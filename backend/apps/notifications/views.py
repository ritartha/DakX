from rest_framework import decorators, mixins, permissions, response, status, viewsets

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @decorators.action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_queryset().filter(pk=pk).first()
        if not notification:
            return response.Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return response.Response(self.get_serializer(notification).data)
