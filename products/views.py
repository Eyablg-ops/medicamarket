from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from rest_framework import generics, filters
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from .permissions import IsClinicOrAdmin

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'requires_prescription']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
# === VUES CLINIQUE/ADMIN ===

class ClinicProductListView(generics.ListAPIView):
    """Liste tous les produits pour la clinique (actifs + inactifs)"""
    serializer_class = ProductSerializer
    permission_classes = [IsClinicOrAdmin]

    def get_queryset(self):
        return Product.objects.all().order_by('-created_at')


class ClinicProductCreateView(generics.CreateAPIView):
    """Créer un nouveau produit"""
    serializer_class = ProductSerializer
    permission_classes = [IsClinicOrAdmin]


class ClinicProductUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """Modifier ou supprimer un produit"""
    serializer_class = ProductSerializer
    permission_classes = [IsClinicOrAdmin]
    queryset = Product.objects.all()


class ClinicCategoryListView(generics.ListAPIView):
    """Liste toutes les catégories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsClinicOrAdmin]
    pagination_class = None


class ClinicCategoryCreateView(generics.CreateAPIView):
    """Créer une nouvelle catégorie"""
    serializer_class = CategorySerializer
    permission_classes = [IsClinicOrAdmin]


class ClinicCategoryUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """Modifier ou supprimer une catégorie"""
    serializer_class = CategorySerializer
    permission_classes = [IsClinicOrAdmin]
    queryset = Category.objects.all()