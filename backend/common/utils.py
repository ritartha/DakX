from __future__ import annotations

import secrets
import uuid
from email.utils import make_msgid

import bleach
from decouple import config
from redis import Redis

ALLOWED_TAGS = list(bleach.sanitizer.ALLOWED_TAGS) + [
    'p',
    'br',
    'div',
    'span',
    'pre',
    'blockquote',
    'hr',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'img',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
]
ALLOWED_ATTRIBUTES = {
    '*': ['class'],
    'a': ['href', 'title', 'rel', 'target'],
    'img': ['src', 'alt', 'title'],
}


def sanitize_html(html: str) -> str:
    return bleach.clean(html or '', tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRIBUTES, protocols=['http', 'https', 'mailto'])


def generate_message_id(domain: str) -> str:
    return make_msgid(idstring=uuid.uuid4().hex, domain=domain)


def generate_token(length: int = 64) -> str:
    return secrets.token_urlsafe(length)[:length]


def get_redis_client() -> Redis:
    return Redis.from_url(config('REDIS_URL', default='redis://redis:6379/1'))
