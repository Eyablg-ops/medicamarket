from rest_framework.permissions import BasePermission


class IsClient(BasePermission):
    """Accès réservé aux clients."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'client'


class IsClinique(BasePermission):
    """Accès réservé aux cliniques."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'clinique'


class IsAdminUser(BasePermission):
    """Accès réservé aux admins."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsOwnerOrAdmin(BasePermission):
    """L'utilisateur ne peut accéder qu'à ses propres données (ou admin)."""
    def has_object_permission(self, request, view, obj):
        return obj == request.user or request.user.role == 'admin'
