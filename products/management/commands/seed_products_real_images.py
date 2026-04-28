"""Seed database with real medicine product names and online images.

This command creates demo medical products for a marketplace project.
Images are searched online using DuckDuckGo and downloaded from multiple
websites instead of depending on one source only.
"""

from __future__ import annotations

import logging
import shutil
import time
import uuid
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path

import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from icrawler.builtin import BingImageCrawler

from products.models import Category, Product

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class CategorySeed:
    """Represent one category to create.

    Args:
        name: Displayed category name.
        slug: Unique category slug.
        description: Category description.
    """

    name: str
    slug: str
    description: str


@dataclass(frozen=True)
class ProductSeed:
    """Represent one product to create.

    Args:
        category_slug: Slug of the category that owns the product.
        name: Real commercial or generic medicine/product name.
        description: Short product description for the marketplace.
        price: Product price as a string to preserve Decimal precision.
        stock: Available stock quantity.
        expiration_state: One of expired, expiring, valid, or none.
        requires_prescription: Whether the product requires prescription.
        image_query: Search query used to find a real online image.
    """

    category_slug: str
    name: str
    description: str
    price: str
    stock: int
    expiration_state: str
    requires_prescription: bool
    image_query: str


class Command(BaseCommand):
    """Create demo categories and around 50 real medical products."""

    help = "Seed database with 50 real medical products and online images."

    def handle(self, *args, **options) -> None:
        """Run the seed command.

        Args:
            *args: Positional command arguments.
            **options: Django command options.
        """
        categories = self._seed_categories()
        products = self._get_products_data()

        created_count = 0
        image_count = 0

        for index, product_seed in enumerate(products):
            product = self._create_or_update_product(
                product_seed=product_seed,
                categories=categories,
                index=index,
            )
            created_count += 1

            if self._attach_product_image(product, product_seed.image_query):
                image_count += 1

            time.sleep(1)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed completed: {created_count} products, "
                f"{image_count} images downloaded."
            )
        )

    def _seed_categories(self) -> dict[str, Category]:
        """Create or retrieve product categories.

        Returns:
            dict[str, Category]: Categories indexed by slug.
        """
        categories_data = [
            CategorySeed(
                name="Antalgiques & Anti-inflammatoires",
                slug="antalgiques-anti-inflammatoires",
                description="Médicaments contre la douleur, la fièvre et l'inflammation.",
            ),
            CategorySeed(
                name="Antibiotiques",
                slug="antibiotiques",
                description="Médicaments anti-infectieux soumis à prescription.",
            ),
            CategorySeed(
                name="Digestion & Estomac",
                slug="digestion-estomac",
                description="Produits pour troubles digestifs, reflux et douleurs abdominales.",
            ),
            CategorySeed(
                name="Allergie & ORL",
                slug="allergie-orl",
                description="Produits pour allergies, gorge, nez et voies respiratoires.",
            ),
            CategorySeed(
                name="Dermatologie & Soins",
                slug="dermatologie-soins",
                description="Produits antiseptiques, réparateurs et soins de la peau.",
            ),
            CategorySeed(
                name="Vitamines & Compléments",
                slug="vitamines-complements",
                description="Vitamines, minéraux et compléments alimentaires.",
            ),
            CategorySeed(
                name="Cardio-Diabète",
                slug="cardio-diabete",
                description="Médicaments et produits liés au diabète et au système cardiovasculaire.",
            ),
            CategorySeed(
                name="Matériel Médical",
                slug="materiel-medical",
                description="Dispositifs et équipements médicaux.",
            ),
            CategorySeed(
                name="Hygiène & Protection",
                slug="hygiene-protection",
                description="Produits d'hygiène, protection et premiers soins.",
            ),
        ]

        categories: dict[str, Category] = {}
        for category_seed in categories_data:
            category, _ = Category.objects.get_or_create(
                slug=category_seed.slug,
                defaults={
                    "name": category_seed.name,
                    "description": category_seed.description,
                },
            )
            categories[category_seed.slug] = category

        return categories

    def _get_products_data(self) -> list[ProductSeed]:
        """Return real product names to seed.

        Returns:
            list[ProductSeed]: Products prepared for database insertion.
        """
        return [
            ProductSeed("antalgiques-anti-inflammatoires", "Doliprane 1000 mg", "Paracétamol utilisé contre la douleur et la fièvre.", "7.500", 120, "valid", False, "Doliprane 1000 mg boite médicament image"),
            ProductSeed("antalgiques-anti-inflammatoires", "Doliprane 500 mg", "Paracétamol en comprimés pour douleurs légères à modérées.", "5.900", 140, "expiring", False, "Doliprane 500 mg boite médicament image"),
            ProductSeed("antalgiques-anti-inflammatoires", "Efferalgan 1000 mg", "Paracétamol effervescent contre douleur et fièvre.", "8.200", 90, "valid", False, "Efferalgan 1000 mg boite médicament image"),
            ProductSeed("antalgiques-anti-inflammatoires", "Dafalgan 500 mg", "Paracétamol utilisé pour le traitement symptomatique de la douleur.", "6.400", 80, "expired", False, "Dafalgan 500 mg boite médicament image"),
            ProductSeed("antalgiques-anti-inflammatoires", "Advil 200 mg", "Ibuprofène pour douleurs, fièvre et inflammation.", "9.800", 75, "valid", False, "Advil 200 mg boite médicament image"),
            ProductSeed("antalgiques-anti-inflammatoires", "Nurofen 200 mg", "Ibuprofène indiqué pour douleurs et fièvre.", "10.500", 65, "expiring", False, "Nurofen 200 mg boite médicament image"),
            ProductSeed("antalgiques-anti-inflammatoires", "Spedifen 400 mg", "Ibuprofène arginine pour douleurs inflammatoires.", "12.900", 50, "valid", False, "Spedifen 400 mg boite médicament image"),
            ProductSeed("antalgiques-anti-inflammatoires", "Aspirine UPSA 500 mg", "Acide acétylsalicylique contre douleur et fièvre.", "7.900", 70, "expired", False, "Aspirine UPSA 500 mg boite médicament image"),
            ProductSeed("digestion-estomac", "Smecta", "Diosmectite utilisée dans certains troubles digestifs.", "11.500", 95, "valid", False, "Smecta boite médicament image"),
            ProductSeed("digestion-estomac", "Gaviscon Menthe", "Suspension buvable contre reflux gastro-œsophagien.", "13.500", 85, "expiring", False, "Gaviscon Menthe flacon boite image"),
            ProductSeed("digestion-estomac", "Maalox", "Anti-acide utilisé en cas de brûlures d'estomac.", "10.900", 60, "valid", False, "Maalox boite médicament image"),
            ProductSeed("digestion-estomac", "Imodium 2 mg", "Lopéramide utilisé contre la diarrhée aiguë.", "14.200", 55, "expired", False, "Imodium 2 mg boite médicament image"),
            ProductSeed("digestion-estomac", "Vogalib", "Médicament utilisé contre les nausées et vomissements.", "12.600", 48, "valid", False, "Vogalib boite médicament image"),
            ProductSeed("digestion-estomac", "Forlax 10 g", "Macrogol utilisé en cas de constipation.", "16.000", 45, "expiring", False, "Forlax 10g boite médicament image"),
            ProductSeed("digestion-estomac", "Spasfon", "Phloroglucinol utilisé contre les douleurs spasmodiques.", "9.500", 100, "valid", False, "Spasfon boite médicament image"),
            ProductSeed("digestion-estomac", "Buscopan", "Antispasmodique utilisé pour douleurs abdominales.", "12.300", 40, "expired", False, "Buscopan boite médicament image"),
            ProductSeed("allergie-orl", "Cetirizine 10 mg", "Antihistaminique pour symptômes allergiques.", "6.900", 110, "valid", False, "Cetirizine 10 mg boite médicament image"),
            ProductSeed("allergie-orl", "Clarityne 10 mg", "Loratadine utilisée contre rhinite allergique.", "13.800", 70, "expiring", False, "Clarityne 10 mg boite médicament image"),
            ProductSeed("allergie-orl", "Aerius 5 mg", "Desloratadine utilisée dans les allergies.", "18.500", 55, "valid", False, "Aerius 5 mg boite médicament image"),
            ProductSeed("allergie-orl", "Humex Rhume", "Produit utilisé dans les symptômes du rhume.", "15.200", 50, "expired", False, "Humex Rhume boite médicament image"),
            ProductSeed("allergie-orl", "Strepsils Miel Citron", "Pastilles pour gorge irritée.", "8.700", 130, "valid", False, "Strepsils miel citron boite image"),
            ProductSeed("allergie-orl", "Lysopaïne", "Pastilles pour maux de gorge.", "9.400", 120, "expiring", False, "Lysopaine boite médicament image"),
            ProductSeed("allergie-orl", "Stérimar Nez Bouché", "Spray nasal à base d'eau de mer.", "17.900", 60, "valid", False, "Sterimar nez bouche spray image"),
            ProductSeed("allergie-orl", "Physiomer Spray Nasal", "Solution d'eau de mer pour hygiène nasale.", "16.500", 58, "valid", False, "Physiomer spray nasal image"),
            ProductSeed("dermatologie-soins", "Biseptine", "Solution antiseptique pour désinfection cutanée.", "10.500", 75, "expiring", False, "Biseptine flacon image"),
            ProductSeed("dermatologie-soins", "Bétadine Dermique", "Antiseptique à base de povidone iodée.", "11.900", 65, "valid", False, "Betadine dermique flacon image"),
            ProductSeed("dermatologie-soins", "Hexomédine", "Antiseptique local pour la peau.", "8.900", 45, "expired", False, "Hexomedine flacon image"),
            ProductSeed("dermatologie-soins", "Biafine", "Émulsion utilisée pour brûlures superficielles et irritations.", "14.900", 80, "valid", False, "Biafine tube image"),
            ProductSeed("dermatologie-soins", "Cicatryl", "Pommade utilisée pour soins cutanés superficiels.", "12.000", 40, "valid", False, "Cicatryl pommade boite image"),
            ProductSeed("dermatologie-soins", "Avène Cicalfate+", "Crème réparatrice protectrice pour peaux irritées.", "25.000", 55, "expiring", False, "Avene Cicalfate plus creme image"),
            ProductSeed("dermatologie-soins", "La Roche-Posay Cicaplast Baume B5", "Baume réparateur multi-usages.", "28.000", 50, "valid", False, "La Roche Posay Cicaplast Baume B5 image"),
            ProductSeed("dermatologie-soins", "Daktarin Gel Buccal", "Miconazole utilisé contre certaines mycoses buccales.", "18.000", 35, "expired", True, "Daktarin gel buccal boite image"),
            ProductSeed("antibiotiques", "Amoxicilline 500 mg", "Antibiotique de la famille des pénicillines.", "18.500", 45, "valid", True, "Amoxicilline 500 mg boite médicament image"),
            ProductSeed("antibiotiques", "Augmentin 1 g", "Association amoxicilline et acide clavulanique.", "28.000", 35, "expiring", True, "Augmentin 1g boite médicament image"),
            ProductSeed("antibiotiques", "Clamoxyl 500 mg", "Amoxicilline utilisée dans certaines infections bactériennes.", "21.000", 30, "expired", True, "Clamoxyl 500 mg boite médicament image"),
            ProductSeed("antibiotiques", "Zithromax 250 mg", "Azithromycine utilisée dans certaines infections bactériennes.", "32.000", 25, "valid", True, "Zithromax 250 mg boite médicament image"),
            ProductSeed("antibiotiques", "Oroken 200 mg", "Céfixime utilisé dans certaines infections bactériennes.", "30.000", 20, "expiring", True, "Oroken 200 mg boite médicament image"),
            ProductSeed("cardio-diabete", "Glucophage 500 mg", "Metformine utilisée dans le diabète de type 2.", "13.000", 70, "valid", True, "Glucophage 500 mg boite médicament image"),
            ProductSeed("cardio-diabete", "Metformine 850 mg", "Antidiabétique oral à base de metformine.", "11.500", 90, "expired", True, "Metformine 850 mg boite médicament image"),
            ProductSeed("cardio-diabete", "Kardégic 75 mg", "Acide acétylsalicylique à faible dose.", "16.500", 55, "expiring", True, "Kardegic 75 mg boite médicament image"),
            ProductSeed("cardio-diabete", "Lovenox 4000 UI", "Énoxaparine injectable anticoagulante.", "55.000", 18, "valid", True, "Lovenox 4000 UI boite seringue image"),
            ProductSeed("digestion-estomac", "Mopral 20 mg", "Oméprazole utilisé contre reflux et acidité gastrique.", "22.000", 40, "valid", True, "Mopral 20 mg boite médicament image"),
            ProductSeed("digestion-estomac", "Oméprazole 20 mg", "Inhibiteur de la pompe à protons.", "15.000", 65, "expired", True, "Omeprazole 20 mg boite médicament image"),
            ProductSeed("vitamines-complements", "Vitamine C UPSA", "Complément en vitamine C.", "11.000", 100, "valid", False, "Vitamine C UPSA boite image"),
            ProductSeed("vitamines-complements", "Berocca", "Complément multivitaminé avec minéraux.", "24.000", 80, "expiring", False, "Berocca boite comprimés image"),
            ProductSeed("vitamines-complements", "Magné B6", "Complément associant magnésium et vitamine B6.", "18.500", 90, "valid", False, "Magne B6 boite image"),
            ProductSeed("vitamines-complements", "D-Cure Vitamine D", "Vitamine D en ampoules buvables.", "20.000", 60, "expired", False, "D-Cure vitamine D ampoule boite image"),
            ProductSeed("materiel-medical", "Tensiomètre Omron M3", "Tensiomètre électronique bras pour suivi de la tension.", "185.000", 15, "none", False, "Omron M3 tensiometre image"),
            ProductSeed("materiel-medical", "Thermomètre Braun ThermoScan", "Thermomètre auriculaire digital.", "145.000", 20, "none", False, "Braun ThermoScan thermometre image"),
            ProductSeed("hygiene-protection", "Masques Chirurgicaux Type IIR", "Boîte de masques chirurgicaux jetables.", "18.000", 250, "expiring", False, "masques chirurgicaux type IIR boite image"),
            ProductSeed("hygiene-protection", "Gants Nitrile Jetables", "Boîte de gants nitrile non poudrés.", "32.000", 180, "valid", False, "gants nitrile boite medical image"),
        ]

    def _create_or_update_product(
        self,
        product_seed: ProductSeed,
        categories: dict[str, Category],
        index: int,
    ) -> Product:
        """Create or update one product.

        Args:
            product_seed: Product seed data.
            categories: Existing categories indexed by slug.
            index: Product index used to generate deterministic dates.

        Returns:
            Product: Created or updated product instance.
        """
        slug = slugify(product_seed.name)
        expiration_date = self._build_expiration_date(
            product_seed.expiration_state,
            index,
        )

        product, _ = Product.objects.update_or_create(
            slug=slug,
            defaults={
                "category": categories[product_seed.category_slug],
                "name": product_seed.name,
                "description": product_seed.description,
                "price": Decimal(product_seed.price),
                "stock": product_seed.stock,
                "expiration_date": expiration_date,
                "requires_prescription": product_seed.requires_prescription,
                "is_active": True,
            },
        )
        return product

    def _build_expiration_date(self, expiration_state: str, index: int) -> date | None:
        """Build an expiration date from a state.

        Args:
            expiration_state: Expiration state: expired, expiring, valid, or none.
            index: Product index used to avoid identical dates.

        Returns:
            date | None: Generated expiration date or None.

        Raises:
            ValueError: If expiration_state is unsupported.
        """
        today = timezone.now().date()

        if expiration_state == "expired":
            return today - timedelta(days=5 + (index % 25))
        if expiration_state == "expiring":
            return today + timedelta(days=3 + (index % 12))
        if expiration_state == "valid":
            return today + timedelta(days=90 + (index % 270))
        if expiration_state == "none":
            return None

        raise ValueError(f"Unsupported expiration state: {expiration_state}")

    def _attach_product_image(self, product: Product, image_query: str) -> bool:
        """Search, download and attach an online image to a product.

        Args:
            product: Product instance to update.
            image_query: Search query used to find product image.

        Returns:
            bool: True if an image was downloaded and saved, False otherwise.
        """
        if product.image and product.image.name:
            self.stdout.write(
                self.style.NOTICE(f"Image already exists for: {product.name}")
            )
            return False

        download_dir = Path("media") / "seed_downloads" / str(uuid.uuid4())
        download_dir.mkdir(parents=True, exist_ok=True)

        try:
            crawler = BingImageCrawler(
                storage={"root_dir": str(download_dir)}
            )
            crawler.crawl(
                keyword=image_query,
                max_num=3,
                min_size=(250, 250),
                file_idx_offset=0,
            )

            image_path = self._get_first_downloaded_image(download_dir)
            if image_path is None:
                self.stdout.write(
                    self.style.WARNING(f"No image found for product: {product.name}")
                )
                return False

            image_content = image_path.read_bytes()
            extension = image_path.suffix.lower()

            if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
                extension = ".jpg"

            filename = f"{product.slug}{extension}"
            product.image.save(filename, ContentFile(image_content), save=True)

            self.stdout.write(
                self.style.SUCCESS(f"Image saved for product: {product.name}")
            )
            return True

        except Exception as exc:
            logger.warning("Image crawling failed for %s: %s", product.name, exc)
            self.stdout.write(
                self.style.WARNING(
                    f"Image crawling failed for product: {product.name}: {exc}"
                )
            )
            return False

        finally:
            shutil.rmtree(download_dir, ignore_errors=True)

    def _get_first_downloaded_image(self, directory: Path) -> Path | None:
        """Return the first valid downloaded image path.

        Args:
            directory: Directory where crawler downloaded images.

        Returns:
            Path | None: First valid image path, or None when no image exists.
        """
        allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}

        for image_path in directory.iterdir():
            if (
                image_path.is_file()
                and image_path.suffix.lower() in allowed_extensions
                and image_path.stat().st_size > 5_000
            ):
                return image_path

        return None

    def _download_image(self, image_url: str) -> bytes:
        """Download and validate an image.

        Args:
            image_url: Direct online image URL.

        Returns:
            bytes: Downloaded image content.

        Raises:
            requests.RequestException: If the request fails.
            ValueError: If the response is not an image.
        """
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (compatible; MedicaMarketStudentProject/1.0)"
            )
        }
        response = requests.get(
            image_url,
            headers=headers,
            timeout=20,
            allow_redirects=True,
        )
        response.raise_for_status()

        content_type = response.headers.get("Content-Type", "").lower()
        if "image" not in content_type:
            raise ValueError(f"URL does not return an image: {image_url}")

        if len(response.content) < 5_000:
            raise ValueError("Downloaded image is too small")

        return response.content

    def _guess_extension(self, image_url: str) -> str:
        """Guess image extension from URL.

        Args:
            image_url: Image URL.

        Returns:
            str: File extension.
        """
        suffix = Path(image_url.split("?")[0]).suffix.lower()
        allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}

        if suffix in allowed_extensions:
            return suffix

        return ".jpg"

    def _looks_like_image_url(self, image_url: str) -> bool:
        """Check whether a URL looks suitable for image download.

        Args:
            image_url: URL returned by image search.

        Returns:
            bool: True if the URL can be tested as an image candidate.
        """
        blocked_parts = ["base64", "data:image", "svg"]
        lowered_url = image_url.lower()
        return not any(part in lowered_url for part in blocked_parts)
