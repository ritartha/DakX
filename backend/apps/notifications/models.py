from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = [
        ('new_mail', 'New Mail'),
        ('mail_read', 'Mail Read'),
        ('label_applied', 'Label Applied'),
        ('system', 'System'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.ForeignKey('mail.Message', null=True, blank=True, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)
