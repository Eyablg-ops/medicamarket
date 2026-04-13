from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'expiration_date', 'is_active']
    list_filter = ['category', 'is_active', 'requires_prescription']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}