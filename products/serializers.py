from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    is_in_stock = serializers.ReadOnlyField()
    is_expiring_soon = serializers.ReadOnlyField()
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price',
            'stock', 'image', 'category', 'category_name',
            'expiration_date', 'requires_prescription',
            'is_active', 'is_in_stock', 'is_expiring_soon',
            'is_expired', 'created_at',
        ]
        # ← category_name et les propriétés sont read_only
        # category (id) reste writable pour la création
        extra_kwargs = {
            'slug': {'required': True},
            'image': {'required': False},
            'expiration_date': {'required': False},
            'category': {'required': False},
        }