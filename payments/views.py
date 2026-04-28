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

    otp = str(random.randint(100000, 999999))
    cache.set(f'otp_{order_id}_{request.user.id}', otp, timeout=300)

    return Response({
        'message': 'OTP envoyé',
        'otp_demo': otp,
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

    stored_otp = cache.get(f'otp_{order_id}_{request.user.id}')

    if not stored_otp:
        return Response({'error': 'OTP expiré. Réessayez.'}, status=400)

    if otp_entered != stored_otp:
        return Response({'error': 'Code OTP incorrect'}, status=400)

    order.status = 'paid'
    order.save()

    cache.delete(f'otp_{order_id}_{request.user.id}')
    send_payment_confirmation(order)

    return Response({
        'message': 'Paiement confirmé !',
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

    try:
        buffer = generate_invoice(order)
        pdf_bytes = buffer.getvalue()

        if len(pdf_bytes) == 0:
            return Response({'error': 'Erreur génération PDF : buffer vide'}, status=500)

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="facture_{order.id:04d}.pdf"'
        response['Content-Length'] = len(pdf_bytes)
        return response

    except Exception as e:
        import traceback
        traceback.print_exc()  # ← visible dans les logs Django
        return Response({'error': f'Erreur génération facture : {str(e)}'}, status=500)