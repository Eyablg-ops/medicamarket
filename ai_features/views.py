"""Views for AI features."""

from datetime import timedelta
from django.db import models
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from products.models import Product
from products.serializers import ProductSerializer
from .permissions import IsAdminOrClinique
from .serializers import (
    ChatRequestSerializer,
    ProductDescriptionRequestSerializer,
)
from .services import AIChatService


class ChatAPIView(APIView):
    """Handle chatbot requests."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = AIChatService()
        result = service.chat(
            message=serializer.validated_data['message'],
            history=serializer.validated_data.get('history', []),
        )

        return Response(result, status=status.HTTP_200_OK)

class SmartSearchSuggestionsAPIView(APIView):
    """Return real-time product suggestions."""

    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()

        if len(query) < 2:
            return Response([], status=status.HTTP_200_OK)

        products = Product.objects.filter(
            is_active=True,
        ).select_related('category').filter(
            models.Q(name__icontains=query) |
            models.Q(description__icontains=query) |
            models.Q(category__name__icontains=query)
        )[:8]

        data = [
            {
                'id': product.id,
                'name': product.name,
                'slug': product.slug,
                'category_name': product.category.name,
                'price': product.price,
                'image': product.image.url if product.image else None,
                'is_expiring_soon': product.is_expiring_soon,
                'is_expired': product.is_expired,
                'reason': self._build_reason(product, query),
            }
            for product in products
        ]

        return Response(data, status=status.HTTP_200_OK)

    def _build_reason(self, product, query: str) -> str:
        """Build a user-friendly reason for the suggestion."""
        lowered_query = query.lower()

        if lowered_query in product.name.lower():
            return "Correspondance sur le nom du produit"

        if lowered_query in product.category.name.lower():
            return "Correspondance sur la catégorie"

        if lowered_query in product.description.lower():
            return "Correspondance sur la description"

        return "Suggestion pertinente"

class AlertsSummaryAPIView(APIView):
    """Return expiration and stock alerts summary."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        threshold = timezone.now().date() + timedelta(days=settings.EXPIRY_ALERT_DAYS)

        products = Product.objects.all()
        expired_products = products.filter(expiration_date__lt=timezone.now().date())
        expiring_soon_products = products.filter(
            expiration_date__gte=timezone.now().date(),
            expiration_date__lte=threshold,
        )
        out_of_stock_products = products.filter(stock=0)

        payload = {
            'expired_count': expired_products.count(),
            'expiring_soon_count': expiring_soon_products.count(),
            'out_of_stock_count': out_of_stock_products.count(),
            'expired_products': ProductSerializer(expired_products[:5], many=True).data,
            'expiring_soon_products': ProductSerializer(expiring_soon_products[:5], many=True).data,
            'out_of_stock_products': ProductSerializer(out_of_stock_products[:5], many=True).data,
        }

        return Response(payload, status=status.HTTP_200_OK)


class ProductDescriptionFromNameAPIView(APIView):
    """Generate product description from product name before creation."""

    permission_classes = [IsAuthenticated, IsAdminOrClinique]

    def post(self, request):
        name = request.data.get("name", "").strip()
        category = request.data.get("category", "").strip()
        tone = request.data.get("tone", "professional")

        if not name:
            return Response(
                {"detail": "Product name is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = AIChatService()
        description = service.generate_product_description(
            name=name,
            category_name=category or "Produit médical",
            requires_prescription=False,
            tone=tone,
        )

        return Response(
            {
                "generated_description": description,
                "source": "ollama" if service.is_configured() else "fallback",
            },
            status=status.HTTP_200_OK,
        )
class ProductRecommendationAPIView(APIView):
    """Return product recommendations based on user search behavior."""

    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()

        products = Product.objects.filter(
            is_active=True,
            stock__gt=0,
        ).select_related('category')

        if query:
            products = products.filter(
                models.Q(name__icontains=query)
                | models.Q(description__icontains=query)
                | models.Q(category__name__icontains=query)
            )

        products = products.order_by('-created_at')[:8]

        data = [
            {
                'id': product.id,
                'name': product.name,
                'slug': product.slug,
                'price': product.price,
                'stock': product.stock,
                'category_name': product.category.name,
                'image': product.image.url if product.image else None,
                'reason': (
                    "Recommandé selon vos recherches"
                    if query
                    else "Produit disponible recommandé"
                ),
            }
            for product in products
        ]

        return Response(data, status=status.HTTP_200_OK)