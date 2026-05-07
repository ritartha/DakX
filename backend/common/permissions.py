from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        owner = getattr(obj, 'user', None) or getattr(obj, 'reporter', None)
        return request.user and request.user.is_authenticated and (request.user.is_staff or owner == request.user)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view) -> bool:
        return request.method in SAFE_METHODS or bool(request.user and request.user.is_staff)
