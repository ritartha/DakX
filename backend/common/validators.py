from __future__ import annotations

import re
from typing import Iterable

from django.core.exceptions import ValidationError

HEX_COLOR_RE = re.compile(r'^#(?:[0-9a-fA-F]{3}){1,2}$')


def validate_hex_color(value: str) -> None:
    if value and not HEX_COLOR_RE.match(value):
        raise ValidationError('Enter a valid hex color.')


def validate_email_list(value: Iterable[str]) -> None:
    from django.core.validators import validate_email

    for email in value or []:
        validate_email(email)


def validate_attachment_size(file_obj, max_size: int = 25 * 1024 * 1024) -> None:
    if file_obj.size > max_size:
        raise ValidationError(f'Attachment exceeds {max_size // (1024 * 1024)}MB limit.')
