from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    RegisterSerializer, UserSerializer,
    ChangePasswordSerializer, GDPRExportSerializer,
)
from .permissions import IsAdminUser

User = get_user_model()


# === INSCRIPTION ===
class RegisterView(generics.CreateAPIView):
    """
    POST /api/users/register
    Crée un utilisateur et retourne les tokens JWT.
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # Pas besoin d'être connecté

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Générer les tokens JWT directement
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Inscription réussie',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


# === PROFIL ===
class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/users/profile → Voir son profil
    PATCH /api/users/profile → Modifier son profil
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user  # Toujours l'utilisateur connecté


# === CHANGER MOT DE PASSE ===
class ChangePasswordView(generics.UpdateAPIView):
    """
    PUT /api/users/change-password
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Mot de passe modifié avec succès'})


# === RGPD : EXPORT DONNÉES ===
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gdpr_export(request):
    """
    GET /api/users/gdpr/export
    Retourne TOUTES les données de l'utilisateur (droit d'accès RGPD).
    """
    serializer = GDPRExportSerializer(request.user)
    return Response({
        'message': 'Vos données personnelles',
        'data': serializer.data,
    })


# === RGPD : SUPPRESSION COMPTE ===
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def gdpr_delete_account(request):
    """
    DELETE /api/users/gdpr/delete
    Supprime le compte (droit à l'effacement RGPD).
    """
    password = request.data.get('password')
    if not password or not request.user.check_password(password):
        return Response(
            {'error': 'Mot de passe requis pour confirmer la suppression'},
            status=status.HTTP_400_BAD_REQUEST
        )
    request.user.delete()
    return Response({'message': 'Compte supprimé avec succès'},
                    status=status.HTTP_204_NO_CONTENT)


# === ADMIN : LISTE DES UTILISATEURS ===
class AdminUserListView(generics.ListAPIView):
    """
    GET /api/users/admin/users
    Liste tous les utilisateurs (admin seulement).
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
