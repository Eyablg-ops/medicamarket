import os
from datetime import timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'change-me-in-production')
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'users',
    'products',
    'orders',
    'payments',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ⚠️ DOIT être en premier
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# === BASE DE DONNÉES MySQL ===
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'medicamarket_db',
        'USER': 'root',
        'PASSWORD': '',          # mdp par défaut MAMP
        'HOST': '127.0.0.1',
        'PORT': '3306',              # port MySQL de MAMP
        'OPTIONS': {
            'sql_mode': 'STRICT_TRANS_TABLES',  # ← ajoute cette ligne
        },
    }
}


# === MODÈLE USER PERSONNALISÉ ===
AUTH_USER_MODEL = 'users.User'  # ⚠️ À définir AVANT la 1ère migration

# === DRF ===
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# === JWT ===
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),    # Token court
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),       # Refresh long
    'ROTATE_REFRESH_TOKENS': True,                      # Nouveau refresh à chaque usage
    'BLACKLIST_AFTER_ROTATION': True,                   # Invalider l'ancien
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# === CORS ===
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',   # Frontend React
    'http://localhost:5173',   # Si Vite
]
CORS_ALLOW_CREDENTIALS = True
STATIC_URL = '/static/'


# === AUTRES ===
ROOT_URLCONF = 'config.urls'
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Tunis'  # Adapte selon ton pays
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
# === MÉDIAS (images produits) ===
import os
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# === EMAIL MAILTRAP ===
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'sandbox.smtp.mailtrap.io'
EMAIL_PORT = 2525
EMAIL_HOST_USER = '3d76e1afba9b10'      # ← copie depuis Mailtrap
EMAIL_HOST_PASSWORD = '1b98cc8d7f3505'  # ← copie depuis Mailtrap
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = 'noreply@medicamarket.tn'

# === CACHE (pour OTP) ===
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
