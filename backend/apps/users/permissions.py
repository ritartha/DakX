from rest_framework.permissions import BasePermission


class IsSelf(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        user = getattr(obj, 'user', obj)
        return bool(request.user and request.user.is_authenticated and user == request.user)
