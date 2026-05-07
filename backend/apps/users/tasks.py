from __future__ import annotations

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task(bind=True, max_retries=3)
def send_verification_email_task(self, email: str, token: str) -> None:
    verification_url = f'https://{settings.DOMAIN}/verify-email?token={token}'
    send_mail(
        'Verify your DakX account',
        f'Welcome to DakX. Verify your account by visiting {verification_url}',
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )


@shared_task(bind=True, max_retries=3)
def send_password_reset_email_task(self, email: str, token: str) -> None:
    reset_url = f'https://{settings.DOMAIN}/reset-password?token={token}'
    send_mail(
        'DakX password reset',
        f'Reset your password by visiting {reset_url}',
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )
