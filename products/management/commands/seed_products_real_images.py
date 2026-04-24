"""Seed database with demo medical products using real online images."""

from datetime import timedelta
from decimal import Decimal
from pathlib import Path
from urllib.parse import quote

import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from products.models import Category, Product


class Command(BaseCommand):
    """Create demo categories and products with downloaded images."""

    help = "Seed database with medical products and real product-like images."

    def handle(self, *args, **options):
        """Run the seed command."""
        categories_data = [
            {
                "name": "Antalgiques",
                "slug": "antalgiques",
                "description": "Produits utilisés pour soulager la douleur.",
            },
            {
                "name": "Antibiotiques",
                "slug": "antibiotiques",
                "description": "Médicaments soumis à prescription médicale.",
            },
            {
                "name": "Vitamines & Compléments",
                "slug": "vitamines-complements",
                "description": "Compléments et produits de bien-être.",
            },
            {
                "name": "Matériel Médical",
                "slug": "materiel-medical",
                "description": "Dispositifs et équipements médicaux.",
            },
            {
                "name": "Hygiène & Soins",
                "slug": "hygiene-soins",
                "description": "Produits d’hygiène et de soins.",
            },
        ]

        categories = {}
        for category_data in categories_data:
            category, _ = Category.objects.get_or_create(
                slug=category_data["slug"],
                defaults={
                    "name": category_data["name"],
                    "description": category_data["description"],
                },
            )
            categories[category_data["slug"]] = category

        products_data = [
            {
                "category": "antalgiques",
                "name": "Paracétamol 500 mg",
                "description": (
                    "Médicament utilisé pour soulager les douleurs légères à "
                    "modérées et la fièvre."
                ),
                "price": "4.500",
                "stock": 120,
                "expiration_days": 180,
                "requires_prescription": False,
                "image_url": self._commons_file_url(
                    "Paracetamol_acetaminophen_500_mg_pills.jpg"
                ),
            },
            {
                "category": "antalgiques",
                "name": "Ibuprofène 200 mg",
                "description": (
                    "Anti-inflammatoire non stéroïdien utilisé contre la douleur "
                    "et l’inflammation."
                ),
                "price": "6.800",
                "stock": 80,
                "expiration_days": 90,
                "requires_prescription": False,
                "image_url": self._commons_file_url("200mg_ibuprofen_tablets.jpg"),
            },
            {
                "category": "antalgiques",
                "name": "Ibuprofène Générique",
                "description": "Comprimés génériques d’ibuprofène 200 mg.",
                "price": "5.900",
                "stock": 60,
                "expiration_days": 70,
                "requires_prescription": False,
                "image_url": self._commons_file_url(
                    "Pile_of_200mg_generic_Ibuprofen_tablets.jpg"
                ),
            },
            {
                "category": "vitamines-complements",
                "name": "Vitamine C",
                "description": (
                    "Complément alimentaire utilisé pour soutenir les apports "
                    "quotidiens en vitamine C."
                ),
                "price": "9.900",
                "stock": 100,
                "expiration_days": 300,
                "requires_prescription": False,
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/9/99/Vitamin_C.jpg",
            },
            {
                "category": "materiel-medical",
                "name": "Thermomètre Digital",
                "description": "Thermomètre électronique pour mesurer la température corporelle.",
                "price": "22.000",
                "stock": 35,
                "expiration_days": None,
                "requires_prescription": False,
                "image_url": self._commons_file_url("Digital_thermometer.jpg"),
            },
            {
                "category": "materiel-medical",
                "name": "Thermomètre Médical",
                "description": "Thermomètre clinique utilisé pour le suivi de la température.",
                "price": "18.000",
                "stock": 45,
                "expiration_days": None,
                "requires_prescription": False,
                "image_url": self._commons_file_url("Clinical_thermometer_38.7.JPG"),
            },
            {
                "category": "materiel-medical",
                "name": "Tensiomètre Électronique",
                "description": "Appareil de mesure de la tension artérielle.",
                "price": "95.000",
                "stock": 15,
                "expiration_days": None,
                "requires_prescription": False,
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/6/65/Blood_pressure_monitor.jpg",
            },
            {
                "category": "hygiene-soins",
                "name": "Compresses Stériles",
                "description": "Compresses médicales stériles pour soins et pansements.",
                "price": "7.500",
                "stock": 150,
                "expiration_days": 150,
                "requires_prescription": False,
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/6/66/Gauze_pads.jpg",
            },
            {
                "category": "hygiene-soins",
                "name": "Pansements Adhésifs",
                "description": "Pansements utilisés pour protéger les petites plaies.",
                "price": "6.000",
                "stock": 130,
                "expiration_days": 250,
                "requires_prescription": False,
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/7/70/Adhesive_bandages.jpg",
            },
            {
                "category": "hygiene-soins",
                "name": "Gel Hydroalcoolique",
                "description": "Gel désinfectant pour l’hygiène des mains.",
                "price": "8.900",
                "stock": 200,
                "expiration_days": 220,
                "requires_prescription": False,
                "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Hand_sanitizer.jpg",
            },
        ]

        for product_data in products_data:
            self._create_or_update_product(product_data, categories)

        self.stdout.write(self.style.SUCCESS("Products with images seeded successfully."))

    def _commons_file_url(self, filename: str) -> str:
        """Build a Wikimedia Commons Special:FilePath URL.

        Args:
            filename: Commons filename.

        Returns:
            str: Direct file path URL.
        """
        return f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(filename)}"

    def _create_or_update_product(self, product_data: dict, categories: dict) -> None:
        """Create or update one product and attach its image.

        Args:
            product_data: Product data dictionary.
            categories: Existing categories indexed by slug.

        Raises:
            requests.RequestException: If image download fails.
        """
        slug = slugify(product_data["name"])
        expiration_date = None

        if product_data["expiration_days"] is not None:
            expiration_date = timezone.now().date() + timedelta(
                days=product_data["expiration_days"]
            )

        product, _ = Product.objects.update_or_create(
            slug=slug,
            defaults={
                "category": categories[product_data["category"]],
                "name": product_data["name"],
                "description": product_data["description"],
                "price": Decimal(product_data["price"]),
                "stock": product_data["stock"],
                "expiration_date": expiration_date,
                "requires_prescription": product_data["requires_prescription"],
                "is_active": True,
            },
        )

        try:
            image_content = self._download_image(product_data["image_url"])
            extension = self._guess_extension(product_data["image_url"])
            filename = f"{slug}{extension}"
            product.image.save(filename, ContentFile(image_content), save=True)
        except requests.RequestException as exc:
            self.stdout.write(
                self.style.WARNING(
                    f"Image download failed for {product.name}: {exc}"
                )
            )
    def _download_image(self, image_url: str) -> bytes:
        """Download image bytes from a URL.

        Args:
            image_url: Online image URL.

        Returns:
            bytes: Downloaded image content.

        Raises:
            requests.RequestException: If the request fails.
        """
        headers = {
            "User-Agent": (
                "MedicaMarketStudentProject/1.0 "
                "(educational demo; contact: admin@medicamarket.local)"
            )
        }

        response = requests.get(
            image_url,
            headers=headers,
            timeout=30,
            allow_redirects=True,
        )
        response.raise_for_status()
        return response.content

    def _guess_extension(self, image_url: str) -> str:
        """Guess file extension from URL.

        Args:
            image_url: Online image URL.

        Returns:
            str: File extension.
        """
        path = Path(image_url.split("?")[0])
        suffix = path.suffix.lower()

        if suffix in [".jpg", ".jpeg", ".png", ".webp"]:
            return suffix

        return ".jpg"