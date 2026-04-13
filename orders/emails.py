from django.core.mail import send_mail
from django.conf import settings


def send_order_confirmation(order):
    """
    Envoie un email de confirmation après une commande.
    """
    # Construire le détail des articles
    items_text = ''
    for item in order.items.all():
        items_text += f'\n  • {item.product_name} × {item.quantity} — {item.subtotal} TND'

    subject = f'✅ Confirmation de votre commande #{order.id} — MedicaMarket'

    message = f"""
Bonjour {order.user.first_name or order.user.email},

Votre commande a bien été reçue et est en cours de traitement.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RÉCAPITULATIF DE VOTRE COMMANDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commande n° : #{order.id}
Date        : {order.created_at.strftime('%d/%m/%Y à %H:%M')}
Statut      : {order.get_status_display()}

Articles commandés :
{items_text}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TOTAL : {order.total_amount} TND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Adresse de livraison :
  {order.shipping_address}
  {order.shipping_city}
  Tél : {order.shipping_phone}

Merci pour votre confiance !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 MedicaMarket
La marketplace médicale de confiance en Tunisie
contact@medicamarket.tn
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.user.email],
        fail_silently=True,
    )


def send_payment_confirmation(order):
    """
    Envoie un email de confirmation de paiement.
    """
    subject = f'💳 Paiement confirmé — Commande #{order.id} — MedicaMarket'

    message = f"""
Bonjour {order.user.first_name or order.user.email},

Votre paiement a été confirmé avec succès ! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CONFIRMATION DE PAIEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commande n° : #{order.id}
Montant payé : {order.total_amount} TND
Statut       : Payé ✅

Votre commande est maintenant en cours de préparation.

Merci pour votre achat sur MedicaMarket !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏥 MedicaMarket
contact@medicamarket.tn
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.user.email],
        fail_silently=True,
    )