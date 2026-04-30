from rest_framework.permissions import BasePermission

class IsClinic(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'clinique'

class IsClinicOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['clinique', 'admin']

class IsAdminRole(BasePermission):
    """Allow access only to admin users."""

    def has_permission(self, request, view):
        """Check if user is authenticated and has admin role."""
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )