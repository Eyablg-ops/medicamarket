from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Inscription — valide et crée un utilisateur.
    Le mot de passe est en write_only (jamais retourné).
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'role',
            # Champs clinique (optionnels)
            'clinic_name', 'tax_id', 'responsible_name', 'clinic_address',
            'gdpr_consent',
        ]

    def validate(self, data):
        # Vérifier que les mots de passe correspondent
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Les mots de passe ne correspondent pas.'
            })

        # Si rôle clinique, les champs clinique sont obligatoires
        if data.get('role') == 'clinique':
            required = ['clinic_name', 'tax_id', 'responsible_name']
            for field in required:
                if not data.get(field):
                    raise serializers.ValidationError({
                        field: f'Ce champ est obligatoire pour une clinique.'
                    })

        # RGPD : consentement obligatoire
        if not data.get('gdpr_consent'):
            raise serializers.ValidationError({
                'gdpr_consent': 'Vous devez accepter la politique de confidentialité.'
            })

        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data['gdpr_consent_date'] = timezone.now()
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Sérialisation pour lecture/mise à jour du profil.
    """
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 'role',
            'clinic_name', 'tax_id', 'responsible_name', 'clinic_address',
            'date_joined', 'gdpr_consent', 'gdpr_consent_date',
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined',
                            'gdpr_consent_date']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Mot de passe actuel incorrect.')
        return value


class GDPRExportSerializer(serializers.ModelSerializer):
    """Toutes les données de l'utilisateur pour export RGPD."""
    class Meta:
        model = User
        exclude = ['password']  # Tout sauf le mdp hashé

