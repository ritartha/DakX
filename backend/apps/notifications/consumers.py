from __future__ import annotations

import json
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from apps.mail.services import MailService
from apps.users.models import User


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = parse_qs(self.scope['query_string'].decode())
        token = (query_string.get('token') or [None])[0]
        user = await self._get_user_from_token(token)
        if not user:
            await self.close(code=4401)
            return
        self.user = user
        self.group_name = f'notifications_{user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        unread_count = await self._get_unread_count(user)
        await self.send(text_data=json.dumps({'event': 'connected', 'unread_count': unread_count}))

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return
        content = json.loads(text_data)
        if content.get('type') == 'ping':
            await self.send(text_data=json.dumps({'type': 'pong'}))

    async def notification_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def _get_user_from_token(self, token: str | None):
        if not token:
            return None
        try:
            validated = JWTAuthentication().get_validated_token(token)
            return JWTAuthentication().get_user(validated)
        except InvalidToken:
            return None

    @database_sync_to_async
    def _get_unread_count(self, user: User) -> int:
        return MailService.get_unread_count(user)
