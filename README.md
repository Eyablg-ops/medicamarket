# 🏥 MedicaMarket — Partie 2 : E-commerce

> **Branche** : `dev2/ecommerce`
> **Basée sur** : `dev1/auth-users` (Dev 1 — Eya)
> **Repo** : https://github.com/Eyablg-ops/medicamarket

---

## 👥 Équipe

| Dev | Branche | Responsabilité |
|-----|---------|----------------|
| **Dev 1 (Eya)** | `dev1/auth-users` | Auth, Utilisateurs, Rôles, Permissions |
| **Dev 2 (Marye)** | `dev2/ecommerce` | E-commerce, Produits, Panier, Commandes, Paiement |
| **Dev 3(Asma)** | `dev3/ai-ux` | IA, Chatbot, Recommandations |

---

## 🆕 Nouveautés Partie 2 (par rapport à la Partie 1)

### Backend — Nouvelles apps

| App | Description |
|-----|-------------|
| `products/` | Produits, Catégories, Stock, Dates expiration |
| `orders/` | Panier, Commandes, Emails |
| `payments/` | Paiement OTP simulé, Factures PDF |

### Frontend — Nouvelles pages

| Page | URL | Description |
|------|-----|-------------|
| Boutique | `/shop` | Liste produits + filtres + recherche |
| Détail produit | `/shop/:slug` | Fiche produit + ajouter au panier |
| Panier | `/cart` | Modifier quantités, supprimer |
| Checkout | `/checkout` | Adresse + paiement OTP 3 étapes |
| Commandes | `/orders` | Historique + télécharger facture PDF |
| Dashboard Client | `/dashboard` | Stats, commandes, recommandations |
| Dashboard Clinique | `/clinique/dashboard` | Stats, alertes, top produits |
| Dashboard Admin | `/admin/dashboard` | KPIs, graphiques, utilisateurs |
| Gestion Produits | `/clinique/products` | CRUD produits avec images |
| Gestion Catégories | `/clinique/categories` | CRUD catégories |

---

## 🛠️ Stack Technique & Versions

### Backend
| Package | Version |
|---------|---------|
| Python | 3.11+ |
| Django | **4.2.7** ⚠️ (ne pas upgrader — incompatible MariaDB 10.4) |
| djangorestframework | 3.14.0 |
| djangorestframework-simplejwt | 5.3.0 |
| django-cors-headers | 4.3.0 |
| django-filter | 23.3 |
| mysqlclient | 2.2.8 |
| Pillow | latest |
| reportlab | latest |

### Frontend
| Package | Version |
|---------|---------|
| React | 18+ |
| Vite | 8.0.8 |
| **Tailwind CSS** | **3.4.0** ⚠️ (ne pas upgrader vers v4) |
| React Router DOM | latest |
| Axios | latest |
| Recharts | latest |

### Base de données
| Outil | Version |
|-------|---------|
| MariaDB | **10.4.32** (via XAMPP) |
| XAMPP | latest |

---

## ⚙️ Installation complète

### Prérequis
- Python 3.11+
- Node.js 18+
- XAMPP avec MySQL démarré

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/Eyablg-ops/medicamarket.git
cd medicamarket
```

### 2️⃣ Basculer sur la branche Dev 2

```bash
git checkout dev2/ecommerce
```

### 3️⃣ Base de données — XAMPP

1. Lancer **XAMPP** → démarrer **Apache** + **MySQL**
2. Aller sur **http://localhost/phpmyadmin**
3. Créer la base : `medicamarket_db`

### 4️⃣ Backend Django

```bash
# Créer l'environnement virtuel
python -m venv venv

# Activer (Windows)
venv\Scripts\activate

# Activer (Mac/Linux)
source venv/bin/activate

# Installer les dépendances exactes
pip install django==4.2.7 djangorestframework==3.14.0 djangorestframework-simplejwt==5.3.0 django-cors-headers==4.3.0 django-filter==23.3 mysqlclient Pillow reportlab

# Migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superuser admin
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### 5️⃣ Frontend React

```bash
cd frontend
npm install
npm run dev
```

### 6️⃣ Configuration Email Mailtrap (optionnel)

Dans `config/settings.py` :

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'sandbox.smtp.mailtrap.io'
EMAIL_PORT = 2525
EMAIL_HOST_USER = 'ton_username_mailtrap'
EMAIL_HOST_PASSWORD = 'ton_password_mailtrap'
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'noreply@medicamarket.tn'
```

---

## 🔑 Configuration `settings.py`

```python
# Base de données XAMPP — MariaDB 10.4
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'medicamarket_db',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '127.0.0.1',
        'PORT': '3306',
        'OPTIONS': {
            'sql_mode': 'STRICT_TRANS_TABLES',
        },
    }
}

# Médias
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Cache (OTP paiement)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
```

---

## 🌐 URLs Importantes

### Backend API
| URL | Description |
|-----|-------------|
| http://localhost:8000/admin | Interface Admin Django |
| http://localhost:8000/api/users/ | Auth (Dev 1) |
| http://localhost:8000/api/products/ | Produits |
| http://localhost:8000/api/products/categories/ | Catégories |
| http://localhost:8000/api/orders/cart/ | Panier |
| http://localhost:8000/api/orders/checkout/ | Créer commande |
| http://localhost:8000/api/orders/ | Liste commandes |
| http://localhost:8000/api/payments/initiate/ | Initier paiement OTP |
| http://localhost:8000/api/payments/verify-otp/ | Vérifier OTP |
| http://localhost:8000/api/payments/invoice/:id/ | Télécharger facture PDF |
| http://localhost:8000/api/orders/admin/stats/ | Stats admin |
| http://localhost:8000/api/products/clinic/products/ | Produits clinique |
| http://localhost:8000/api/products/clinic/categories/ | Catégories clinique |

### Frontend
| URL | Page |
|-----|------|
| http://localhost:5173 | Accueil |
| http://localhost:5173/shop | Boutique |
| http://localhost:5173/shop/:slug | Détail produit |
| http://localhost:5173/cart | Panier |
| http://localhost:5173/checkout | Paiement |
| http://localhost:5173/orders | Commandes |
| http://localhost:5173/dashboard | Dashboard Client |
| http://localhost:5173/clinique/dashboard | Dashboard Clinique |
| http://localhost:5173/clinique/products | Gestion Produits |
| http://localhost:5173/clinique/categories | Gestion Catégories |
| http://localhost:5173/admin/dashboard | Dashboard Admin |

---

## 👤 Rôles & Accès

| Rôle | Accès |
|------|-------|
| `client` | Boutique, Panier, Commandes, Dashboard client |
| `clinique` | Tout client + Dashboard clinique + Gestion produits/catégories |
| `admin` | Tout + Dashboard admin + Interface Django Admin |

---

## 🚀 Fonctionnalités Partie 2

### E-commerce
- ✅ Catalogue produits avec catégories et filtres
- ✅ Dates d'expiration avec alertes visuelles (⚠️ expire bientôt / ❌ expiré)
- ✅ Gestion du stock avec décrément automatique
- ✅ Panier (ajouter / modifier quantité / supprimer)
- ✅ Checkout en 2 étapes (adresse + paiement)
- ✅ Paiement OTP simulé en 3 étapes (adresse → carte → OTP)
- ✅ Historique des commandes avec statuts
- ✅ Génération de factures PDF professionnelles
- ✅ Email de confirmation (Mailtrap)
- ✅ Badge panier dynamique dans la Navbar

### Dashboard Clinique
- ✅ Stats produits (total, actifs, rupture, expirant)
- ✅ Stats commandes (total, payées, chiffre d'affaires)
- ✅ Top produits vendus avec barres de progression
- ✅ Répartition catégories en donut SVG
- ✅ Commandes récentes avec statuts
- ✅ Alertes importantes (ruptures + expirations)
- ✅ Gestion produits avec upload image
- ✅ Gestion catégories avec slug auto-généré
- ✅ Logo clinique (upload lors de l'inscription)

### Dashboard Admin
- ✅ KPIs réels (stock, ventes, revenus, utilisateurs)
- ✅ Graphique barres des ventes mensuelles (Recharts)
- ✅ Liste complète des utilisateurs avec recherche
- ✅ Top produits vendus

### Dashboard Client
- ✅ Résumé commandes (total, payées, livrées, en attente)
- ✅ Total dépensé
- ✅ Historique commandes réel
- ✅ Produits déjà achetés
- ✅ Recommandations basées sur catalogue réel
- ✅ Actions rapides

---

## 📁 Structure des nouveaux fichiers (Partie 2)

```
medicamarket/
├── products/                    # NOUVEAU
│   ├── models.py                # Category, Product
│   ├── serializers.py
│   ├── views.py                 # Public + Clinique views
│   ├── urls.py
│   ├── permissions.py           # IsClinicOrAdmin
│   └── admin.py
├── orders/                      # NOUVEAU
│   ├── models.py                # Cart, CartItem, Order, OrderItem
│   ├── serializers.py
│   ├── views.py
│   ├── admin_views.py           # Stats admin
│   ├── urls.py
│   ├── emails.py                # Confirmation emails
│   └── tasks.py
├── payments/                    # NOUVEAU
│   ├── views.py                 # OTP payment + invoice
│   ├── urls.py
│   └── invoice.py               # PDF generation (reportlab)
├── users/                       # MODIFIÉ (Dev 1 base)
│   └── models.py                # + clinic_logo field
└── frontend/src/
    ├── api/
    │   ├── axiosInstance.js     # NOUVEAU (baseURL: /api)
    │   ├── products.js          # NOUVEAU
    │   ├── orders.js            # NOUVEAU
    │   └── clinic.js            # NOUVEAU
    ├── context/
    │   └── CartContext.jsx      # NOUVEAU
    ├── pages/
    │   ├── ShopPage.jsx         # NOUVEAU
    │   ├── ProductDetailPage.jsx # NOUVEAU
    │   ├── CartPage.jsx         # NOUVEAU
    │   ├── CheckoutPage.jsx     # NOUVEAU (OTP flow)
    │   ├── OrdersPage.jsx       # NOUVEAU
    │   ├── Dashboard.jsx        # MODIFIÉ (données réelles)
    │   ├── DashboardClinique.jsx # MODIFIÉ (stats réelles)
    │   ├── DashboardAdmin.jsx   # MODIFIÉ (données réelles)
    │   ├── Profile.jsx          # MODIFIÉ (logo clinique)
    │   ├── Register.jsx         # MODIFIÉ (upload logo)
    │   ├── ClinicProductsPage.jsx # NOUVEAU
    │   └── ClinicCategoriesPage.jsx # NOUVEAU
    └── components/
        ├── Navbar.jsx           # MODIFIÉ (panier badge + liens clinique)
        └── ProductCard.jsx      # NOUVEAU
```

---

## ⚠️ Points importants

| Problème connu | Solution |
|----------------|----------|
| Ne pas utiliser Django 5+ ou 6 | MariaDB 10.4 incompatible — rester sur **Django 4.2.7** |
| Ne pas utiliser Tailwind v4 | Rester sur **Tailwind 3.4.0** |
| Supprimer `import pymysql` de settings.py | Conflit avec mysqlclient |
| Stripe non disponible en Tunisie | Utiliser la simulation OTP locale |
| Images non affichées | Vérifier `MEDIA_URL` + `static()` dans `urls.py` |

---

## 🧪 Données de test

Après `migrate` et `createsuperuser`, ajoute des données via **http://localhost:8000/admin** :

1. **Categories** : Médicaments, Matériel médical, Vitamines
2. **Products** : Doliprane 1000mg (prix: 3.5, stock: 100)
3. **Users** : Créer un compte clinique via `/register`

---

## 📝 Commandes utiles

```bash
# Migrations
python manage.py makemigrations products orders payments
python manage.py migrate

# Superuser
python manage.py createsuperuser

# Lancer serveur
python manage.py runserver

# Frontend
cd frontend && npm run dev
```

---

## 🔗 Liens utiles

- Django 4.2 docs : https://docs.djangoproject.com/en/4.2/
- DRF docs : https://www.django-rest-framework.org/
- Tailwind v3 : https://v3.tailwindcss.com/
- Mailtrap : https://mailtrap.io
- Recharts : https://recharts.org

---

*Partie 2 réalisée par Marye — MedicaMarket 2026*
--- 
 Backend setup

Open a terminal in the backend root (same level as manage.py).

- Activate virtual environment

Windows PowerShell:

.\venv\Scripts\Activate.ps1

- install these manually:

pip install python-dotenv requests
2. Create .env file in backend

Create a file named:

.env at the same level as manage.py.

Example:

AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/api
OLLAMA_MODEL=llama3:8b
AI_FALLBACK_ENABLED=true
EXPIRY_ALERT_DAYS=30

3. Run Ollama



*partie 3 rélisée par Asma Letaief*