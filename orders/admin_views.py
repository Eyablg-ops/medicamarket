from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Order, OrderItem
from products.models import Product

User = get_user_model()


def is_admin(user):
    return user.role == 'admin'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    if not is_admin(request.user):
        return Response({'error': 'Accès refusé'}, status=403)

    # === UTILISATEURS ===
    users = User.objects.all().order_by('-date_joined')
    users_data = [
        {
            'id': u.id,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'role': u.role,
            'is_active': u.is_active,
            'date_joined': u.date_joined.strftime('%Y-%m-%dT%H:%M:%S'),
            'clinic_name': u.clinic_name if u.role == 'clinique' else '',
        }
        for u in users
    ]

    # === PRODUITS ===
    products = Product.objects.all()
    total_stock = sum(p.stock for p in products)

    # === COMMANDES ===
    orders = Order.objects.all()
    paid_orders = orders.filter(status='paid')
    total_revenue = sum(float(o.total_amount) for o in paid_orders)
    quantity_sold = sum(
        item.quantity
        for order in paid_orders
        for item in order.items.all()
    )
    remaining_stock = total_stock

    # === TOP PRODUITS ===
    from collections import Counter
    product_sales = Counter()
    product_revenue = {}

    for order in paid_orders:
        for item in order.items.all():
            product_sales[item.product_name] += item.quantity
            product_revenue[item.product_name] = (
                product_revenue.get(item.product_name, 0) +
                float(item.product_price) * item.quantity
            )

    top_products = [
        {
            'name': name,
            'sales': count,
            'revenue': f"{product_revenue.get(name, 0):.3f} TND",
        }
        for name, count in product_sales.most_common(10)
    ]

    # === HISTORIQUE VENTES PAR MOIS ===
    from django.db.models import Sum
    from django.db.models.functions import TruncMonth
    from datetime import datetime

    monthly = (
        Order.objects
        .filter(status='paid')
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(total=Sum('total_amount'))
        .order_by('month')
    )

    MONTHS_FR = {
        1: 'Jan', 2: 'Fév', 3: 'Mar', 4: 'Avr',
        5: 'Mai', 6: 'Juin', 7: 'Juil', 8: 'Août',
        9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Déc'
    }

    sales_history = [
        {
            'period': MONTHS_FR.get(entry['month'].month, ''),
            'sales': float(entry['total']),
        }
        for entry in monthly
    ]

    # Si pas de données, générer des mois vides
    if not sales_history:
        sales_history = [
            {'period': m, 'sales': 0}
            for m in ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
        ]

    return Response({
        'stats': {
            'total_stock': total_stock,
            'remaining_stock': remaining_stock,
            'quantity_sold': quantity_sold,
            'total_revenue': round(total_revenue, 2),
            'total_users': users.count(),
            'total_clinics': users.filter(role='clinique').count(),
            'total_orders': orders.count(),
            'paid_orders': paid_orders.count(),
            'total_products': products.count(),
            'active_products': products.filter(is_active=True).count(),
        },
        'users': users_data,
        'top_products': top_products,
        'sales_history': sales_history,
    })