from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.core.cache import cache
from orders.models import Order
from orders.emails import send_payment_confirmation
from .invoice import generate_invoice
import random


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """
    Initie le paiement et génère un OTP simulé.
    """
    order_id = request.data.get('order_id')

    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Commande introuvable'}, status=404)

    if order.status != 'pending':
        return Response({'error': 'Commande déjà traitée'}, status=400)

    # Générer un OTP à 6 chiffres
    otp = str(random.randint(100000, 999999))

    # Stocker l'OTP en cache pendant 5 minutes
    cache.set(f'otp_{order_id}_{request.user.id}', otp, timeout=300)

    # En dev : afficher l'OTP dans la réponse
    # En prod : envoyer par SMS
    return Response({
        'message': 'OTP envoyé',
        'otp_demo': otp,  # ← à supprimer en production
        'order_id': order_id,
        'phone_hint': f'****{request.user.phone[-2:] if request.user.phone else "XX"}',
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_otp(request):
    """
    Vérifie l'OTP et confirme le paiement.
    """
    order_id = request.data.get('order_id')
    otp_entered = request.data.get('otp')

    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Commande introuvable'}, status=404)

    # Récupérer l'OTP stocké
    stored_otp = cache.get(f'otp_{order_id}_{request.user.id}')

    if not stored_otp:
        return Response({'error': 'OTP expiré. Réessayez.'}, status=400)

    if otp_entered != stored_otp:
        return Response({'error': 'Code OTP incorrect'}, status=400)

    # OTP correct → confirmer le paiement
    order.status = 'paid'
    order.save()

    # Supprimer l'OTP du cache
    cache.delete(f'otp_{order_id}_{request.user.id}')

    # Envoyer email confirmation
    send_payment_confirmation(order)

    return Response({
        'message': '✅ Paiement confirmé !',
        'order_id': order.id,
        'status': 'paid',
        'total': str(order.total_amount),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Commande introuvable'}, status=404)

    if order.status != 'paid':
        return Response({
            'error': 'Facture disponible uniquement pour les commandes payées'
        }, status=400)

    buffer = generate_invoice(order)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="facture_{order.id:04d}.pdf"'
    return response