from django.urls import path,include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,   # Login → retourne access + refresh
    TokenRefreshView,       # Refresh → nouveau access token
)
from . import views

urlpatterns = [
    # Auth
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profil
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),

    # RGPD
    path('gdpr/export/', views.gdpr_export, name='gdpr_export'),
    path('gdpr/delete/', views.gdpr_delete_account, name='gdpr_delete'),

    # Admin
    path('admin/users/', views.AdminUserListView.as_view(), name='admin_users'),
]
