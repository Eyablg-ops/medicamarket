from rest_framework.permissions import BasePermission

class IsClinic(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'clinique'

class IsClinicOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['clinique', 'admin']