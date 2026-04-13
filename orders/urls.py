from django.urls import path
from . import views
from . import admin_views
urlpatterns = [
    # Panier
    path('cart/', views.get_cart),
    path('cart/add/', views.add_to_cart),
    path('cart/items/<int:item_id>/', views.update_cart_item),
    path('cart/items/<int:item_id>/remove/', views.remove_cart_item),
    # Commandes
    path('checkout/', views.create_order),
    path('', views.OrderListView.as_view()),
    path('<int:pk>/', views.OrderDetailView.as_view()),
     # NOUVEAU
    path('admin/stats/', admin_views.admin_dashboard_stats),
]