from __future__ import annotations

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification


class NotificationService:
    @staticmethod
    def create_notification(user, notification_type: str, message=None, data=None) -> Notification:
        notification = Notification.objects.create(user=user, type=notification_type, message=message, data=data or {})
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'notifications_{user.id}',
                {
                    'type': 'notification.message',
                    'event': notification_type,
                    'notification_id': str(notification.id),
                    'data': notification.data,
                },
            )
        return notification
