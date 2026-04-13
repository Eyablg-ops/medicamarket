from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from .managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Modèle utilisateur personnalisé.
    On utilise l'email comme identifiant (pas username).
    """

    class Role(models.TextChoices):
        CLIENT = 'client', 'Client'
        CLINIQUE = 'clinique', 'Clinique'
        ADMIN = 'admin', 'Administrateur'

    # === Champs communs ===
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)

    # === Champs clinique (remplis seulement si role=clinique) ===
    clinic_name = models.CharField(max_length=200, blank=True)
    tax_id = models.CharField(max_length=50, blank=True,
                              verbose_name="Matricule fiscal")
    responsible_name = models.CharField(max_length=200, blank=True,
                                        verbose_name="Nom du responsable")
    clinic_address = models.TextField(blank=True)
    clinic_logo = models.ImageField(upload_to='clinic_logos/', blank=True, null=True)
    # === Champs système ===
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)   # Accès admin Django
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # === RGPD ===
    gdpr_consent = models.BooleanField(default=False,
                                        verbose_name="Consentement RGPD")
    gdpr_consent_date = models.DateTimeField(null=True, blank=True)

    # === Config ===
    USERNAME_FIELD = 'email'        # On se connecte avec l'email
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def is_client(self):
        return self.role == self.Role.CLIENT

    @property
    def is_clinique(self):
        return self.role == self.Role.CLINIQUE

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN
