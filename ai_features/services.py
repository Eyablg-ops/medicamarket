"""Services for AI features with Ollama integration and fallback mode."""

from __future__ import annotations

import logging
from typing import Dict, List

import requests
from django.conf import settings

from products.models import Product

logger = logging.getLogger(__name__)


class AIChatService:
    """Handle chatbot and AI generation using Ollama with fallback support."""

    def __init__(self) -> None:
        self.provider = settings.AI_PROVIDER
        self.ollama_base_url = settings.OLLAMA_BASE_URL
        self.ollama_model = settings.OLLAMA_MODEL
        self.fallback_enabled = settings.AI_FALLBACK_ENABLED

    def is_configured(self) -> bool:
        """Check whether Ollama is configured as the provider."""
        return self.provider == 'ollama' and bool(self.ollama_base_url)

    def build_medical_system_prompt(self) -> str:
        """Build the system prompt for MedicaMarket assistant."""
        return (
        "You are MedicaMarket assistant. "
        "Help users find products and navigate the platform. "
        "Do not diagnose. Keep answers short and safe."
    )

    def chat(
        self,
        message: str,
        history: List[Dict[str, str]] | None = None,
    ) -> Dict[str, object]:
        """Generate a chatbot reply using Ollama or fallback mode."""
        history = history or []

        if self.is_configured():
            try:
                messages = [
                    {
                        'role': 'system',
                        'content': self.build_medical_system_prompt(),
                    },
                    *history,
                    {
                        'role': 'user',
                        'content': message,
                    },
                ]

                response = requests.post(
                    f'{self.ollama_base_url}/chat',
                    json={
                    'model': self.ollama_model,
                    'messages': messages,
                    'stream': False,
                    'keep_alive': '10m',
                    'options': {
                        'num_predict': 120,
                        'temperature': 0.3,
                    },
                    },
                    timeout=60,
                )
                response.raise_for_status()
                payload = response.json()

                reply_text = payload.get('message', {}).get('content', '').strip()
                suggestions = self._extract_product_suggestions(message)

                return {
                    'reply': reply_text or "Je suis prêt à vous aider.",
                    'source': 'ollama',
                    'suggestions': suggestions,
                }
            except requests.RequestException as exc:
                logger.exception("Ollama request failed: %s", exc)

        if self.fallback_enabled:
            return self._fallback_chat(message)

        return {
            'reply': (
                "Le service IA est temporairement indisponible. "
                "Merci de réessayer plus tard."
            ),
            'source': 'unavailable',
            'suggestions': [],
        }

    def generate_product_description(
        self,
        *,
        name: str,
        category_name: str,
        requires_prescription: bool,
        tone: str,
    ) -> str:
        """Generate a safe product description using Ollama or fallback."""
        if self.is_configured():
            try:
                prompt = (
                    "Write a concise and safe product description for a medical marketplace.\n"
                    f"Product name: {name}\n"
                    f"Category: {category_name}\n"
                    f"Prescription required: {'yes' if requires_prescription else 'no'}\n"
                    f"Tone: {tone}\n"
                    "Do not claim diagnosis. "
                    "Do not promise healing. "
                    "Keep it professional and factual."
                )

                response = requests.post(
                    f'{self.ollama_base_url}/generate',
                    json={
                        'model': self.ollama_model,
                        'prompt': prompt,
                        'system': (
                            "You write safe, compliant, concise descriptions "
                            "for a medical e-commerce catalog."
                        ),
                        'stream': False,
                        'keep_alive': '10m',
                    },
                    timeout=60,
                )
                response.raise_for_status()
                payload = response.json()

                description = payload.get('response', '').strip()
                if description:
                    return description
            except requests.RequestException as exc:
                logger.exception("Ollama description generation failed: %s", exc)

        return (
            f"{name} appartient à la catégorie {category_name}. "
            "Produit présenté avec une description claire et professionnelle. "
            + (
                "Une ordonnance peut être requise pour son achat."
                if requires_prescription
                else "Disponible selon les conditions habituelles de vente."
            )
        )

    def _fallback_chat(self, message: str) -> Dict[str, object]:
        """Return a deterministic local answer when AI provider is unavailable."""
        lowered = message.lower()
        suggestions = self._extract_product_suggestions(message)

        if 'douleur' in lowered or 'fièvre' in lowered:
            reply = (
                "Je peux vous aider à trouver des produits du catalogue liés à la douleur "
                "ou à la fièvre. Vérifiez toujours la notice et demandez conseil à un "
                "professionnel de santé en cas de doute."
            )
        elif 'ordonnance' in lowered:
            reply = (
                "Certains produits nécessitent une ordonnance. "
                "Vous pouvez vérifier la fiche produit pour plus de détails."
            )
        elif 'expiration' in lowered:
            reply = (
                "Les produits proches de leur expiration peuvent être surveillés "
                "depuis les alertes du dashboard."
            )
        else:
            reply = (
                "Je peux vous aider à rechercher un produit, comprendre une catégorie, "
                "ou naviguer dans MedicaMarket."
            )

        return {
            'reply': reply,
            'source': 'fallback',
            'suggestions': suggestions,
        }

    def _extract_product_suggestions(self, query: str) -> List[str]:
        """Return up to three matching product names from the catalog."""
        products = Product.objects.filter(
            is_active=True,
            name__icontains=query,
        )[:3]

        if products.exists():
            return [product.name for product in products]

        words = [word.strip() for word in query.split() if len(word.strip()) >= 3]
        for word in words:
            products = Product.objects.filter(
                is_active=True,
                name__icontains=word,
            )[:3]
            if products.exists():
                return [product.name for product in products]

        return []