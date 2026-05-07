from __future__ import annotations

from typing import Optional

from .models import Profile, User


class UserRepository:
    @staticmethod
    def get_by_email(email: str) -> Optional[User]:
        return User.objects.filter(email__iexact=email).select_related('profile').first()

    @staticmethod
    def get_by_id(user_id) -> Optional[User]:
        return User.objects.filter(id=user_id).select_related('profile').first()

    @staticmethod
    def create(email: str, password: str, display_name: str) -> User:
        return User.objects.create_user(email=email, password=password, display_name=display_name)

    @staticmethod
    def update_profile(user: User, **kwargs) -> Profile:
        profile, _ = Profile.objects.get_or_create(user=user)
        for key, value in kwargs.items():
            setattr(profile, key, value)
        profile.save(update_fields=list(kwargs.keys()) or None)
        return profile
