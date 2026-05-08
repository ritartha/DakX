from __future__ import annotations

from django.core.cache import cache
from django.db import transaction
from django.utils import timezone
import pyotp

from common.exceptions import InvalidTokenError, UserAlreadyExistsError
from common.utils import generate_token

from .models import User
from .repositories import UserRepository
from .tasks import send_password_reset_email_task, send_verification_email_task


class UserService:
    verification_prefix = 'user_verification:'
    password_reset_prefix = 'password_reset:'

    @classmethod
    @transaction.atomic
    def register(cls, email: str, password: str, display_name: str) -> User:
        if UserRepository.get_by_email(email):
            raise UserAlreadyExistsError()
        user = UserRepository.create(email=email, password=password, display_name=display_name)
        token = generate_token()
        cache.set(f'{cls.verification_prefix}{token}', str(user.id), timeout=60 * 60 * 24)
        transaction.on_commit(lambda: send_verification_email_task.delay(user.email, token))
        return user

    @classmethod
    def verify_email(cls, token: str) -> bool:
        user_id = cache.get(f'{cls.verification_prefix}{token}')
        if not user_id:
            raise InvalidTokenError('Verification token is invalid or expired.')
        user = UserRepository.get_by_id(user_id)
        if not user:
            raise InvalidTokenError('Verification token references an unknown user.')
        user.is_verified = True
        user.save(update_fields=['is_verified'])
        cache.delete(f'{cls.verification_prefix}{token}')
        return True

    @classmethod
    def send_password_reset(cls, email: str) -> None:
        user = UserRepository.get_by_email(email)
        if not user:
            return
        token = generate_token()
        cache.set(f'{cls.password_reset_prefix}{token}', str(user.id), timeout=60 * 60)
        send_password_reset_email_task.delay(user.email, token)

    @classmethod
    def reset_password(cls, token: str, new_password: str) -> bool:
        user_id = cache.get(f'{cls.password_reset_prefix}{token}')
        if not user_id:
            raise InvalidTokenError('Password reset token is invalid or expired.')
        user = UserRepository.get_by_id(user_id)
        if not user:
            raise InvalidTokenError('Password reset token references an unknown user.')
        user.set_password(new_password)
        user.last_login = timezone.now()
        user.save(update_fields=['password', 'last_login'])
        cache.delete(f'{cls.password_reset_prefix}{token}')
        return True

    @staticmethod
    def enable_2fa(user: User) -> str:
        secret = pyotp.random_base32()
        user.totp_secret = secret
        # Only persist the new secret. is_2fa_enabled remains unchanged until
        # the user confirms the code via Verify2FAView — do NOT set it False here,
        # as that would disable 2FA for a user who already had it active.
        user.save(update_fields=['totp_secret'])
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(name=user.email, issuer_name='DakX')
