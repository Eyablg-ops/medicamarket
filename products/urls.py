from django.urls import path
from . import views

urlpatterns = [
    # === PUBLIQUES ===
    path('categories/', views.CategoryListView.as_view()),
    path('', views.ProductListView.as_view()),
    path('<slug:slug>/', views.ProductDetailView.as_view()),

    # === CLINIQUE/ADMIN : lecture seulement ===
    path('clinic/products/', views.ClinicProductListView.as_view()),
    path('clinic/categories/', views.ClinicCategoryListView.as_view()),

    # === ADMIN : création / modification / suppression ===
    path('admin/products/create/', views.ClinicProductCreateView.as_view()),
    path('admin/products/<int:pk>/', views.ClinicProductUpdateView.as_view()),
    path('admin/categories/create/', views.ClinicCategoryCreateView.as_view()),
    path('admin/categories/<int:pk>/', views.ClinicCategoryUpdateView.as_view()),
]