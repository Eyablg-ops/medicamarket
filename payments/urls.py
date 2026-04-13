from django.urls import path
from . import views

urlpatterns = [
    path('initiate/', views.initiate_payment),
    path('verify-otp/', views.verify_otp),
    path('invoice/<int:order_id>/', views.download_invoice),
]