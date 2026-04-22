"""URL routes for AI features."""

from django.urls import path

from .views import (
    AlertsSummaryAPIView,
    ChatAPIView,
    ProductDescriptionGenerateAPIView,
    SmartSearchSuggestionsAPIView,
)

urlpatterns = [
    path('chat/', ChatAPIView.as_view(), name='ai-chat'),
    path(
        'search/suggestions/',
        SmartSearchSuggestionsAPIView.as_view(),
        name='ai-search-suggestions',
    ),
    path('alerts/summary/', AlertsSummaryAPIView.as_view(), name='ai-alerts-summary'),
    path(
        'products/<int:product_id>/generate-description/',
        ProductDescriptionGenerateAPIView.as_view(),
        name='ai-generate-product-description',
    ),
]