from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
import io
from django.utils import timezone


def generate_invoice(order):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    elements = []

    # === STYLE PERSONNALISÉS ===
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Normal'],
        fontSize=24,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=5,
    )
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#6b7280'),
        spaceAfter=3,
    )
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontSize=11,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#111827'),
    )
    normal_style = ParagraphStyle(
        'Normal2',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#374151'),
    )
    right_style = ParagraphStyle(
        'Right',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_RIGHT,
        textColor=colors.HexColor('#374151'),
    )

    # === EN-TÊTE ===
    header_data = [
        [
            Paragraph('🏥 MedicaMarket', title_style),
            Paragraph(f'FACTURE #{order.id:04d}', ParagraphStyle(
                'InvNum',
                parent=styles['Normal'],
                fontSize=18,
                fontName='Helvetica-Bold',
                textColor=colors.HexColor('#1e40af'),
                alignment=TA_RIGHT,
            ))
        ],
        [
            Paragraph('La marketplace médicale de confiance', subtitle_style),
            Paragraph(
                f'Date : {order.created_at.strftime("%d/%m/%Y")}',
                right_style
            )
        ],
        [
            Paragraph('Tunis, Tunisie | contact@medicamarket.tn', subtitle_style),
            Paragraph(
                f'Statut : <font color="#16a34a"><b>{"Payé" if order.status == "paid" else order.status}</b></font>',
                ParagraphStyle('Status', parent=styles['Normal'], fontSize=10, alignment=TA_RIGHT)
            )
        ],
    ]

    header_table = Table(header_data, colWidths=[10*cm, 7*cm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(header_table)

    # Ligne séparatrice
    elements.append(Spacer(1, 0.3*cm))
    line = Table([['']], colWidths=[17*cm])
    line.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 2, colors.HexColor('#1e40af')),
    ]))
    elements.append(line)
    elements.append(Spacer(1, 0.5*cm))

    # === INFOS CLIENT ===
    user = order.user
    is_clinic = user.role == 'clinique'

    client_info = f'<b>{"Clinique" if is_clinic else "Client"} :</b> '
    if is_clinic:
        client_info += f'{user.clinic_name or user.get_full_name()}'
    else:
        client_info += f'{user.get_full_name() or user.email}'

    client_data = [
        [
            Paragraph('<b>Facturer à :</b>', header_style),
            Paragraph('<b>Livraison :</b>', header_style),
        ],
        [
            Paragraph(client_info, normal_style),
            Paragraph(f'{order.shipping_address}', normal_style),
        ],
        [
            Paragraph(f'Email : {user.email}', normal_style),
            Paragraph(f'Ville : {order.shipping_city}', normal_style),
        ],
        [
            Paragraph(f'Tél : {user.phone or order.shipping_phone}', normal_style),
            Paragraph(f'Tél : {order.shipping_phone}', normal_style),
        ],
    ]

    if is_clinic and user.tax_id:
        client_data.append([
            Paragraph(f'N° TVA : {user.tax_id}', normal_style),
            Paragraph('', normal_style),
        ])

    client_table = Table(client_data, colWidths=[8.5*cm, 8.5*cm])
    client_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eff6ff')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
    ]))
    elements.append(client_table)
    elements.append(Spacer(1, 0.7*cm))

    # === TABLEAU DES PRODUITS ===
    elements.append(Paragraph('<b>Détail de la commande</b>', header_style))
    elements.append(Spacer(1, 0.3*cm))

    table_data = [
        ['#', 'Produit', 'Prix unitaire', 'Quantité', 'Sous-total']
    ]

    for i, item in enumerate(order.items.all(), 1):
        table_data.append([
            str(i),
            item.product_name,
            f'{item.product_price} TND',
            str(item.quantity),
            f'{item.subtotal} TND',
        ])

    products_table = Table(
        table_data,
        colWidths=[1*cm, 8*cm, 3*cm, 2*cm, 3*cm]
    )
    products_table.setStyle(TableStyle([
        # En-tête
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        # Données
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f9ff')]),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(products_table)
    elements.append(Spacer(1, 0.5*cm))

    # === TOTAL ===
    total_data = [
        ['', 'Sous-total HT', f'{order.total_amount} TND'],
        ['', 'TVA (0%)', '0.000 TND'],
        ['', 'TOTAL TTC', f'{order.total_amount} TND'],
    ]
    total_table = Table(total_data, colWidths=[9*cm, 5*cm, 3*cm])
    total_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('LINEABOVE', (1, 2), (-1, 2), 1.5, colors.HexColor('#1e40af')),
        ('FONTNAME', (1, 2), (-1, 2), 'Helvetica-Bold'),
        ('FONTSIZE', (1, 2), (-1, 2), 12),
        ('TEXTCOLOR', (2, 2), (2, 2), colors.HexColor('#1e40af')),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(total_table)

    # === PIED DE PAGE ===
    elements.append(Spacer(1, 1*cm))
    footer_line = Table([['']], colWidths=[17*cm])
    footer_line.setStyle(TableStyle([
        ('LINEABOVE', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
    ]))
    elements.append(footer_line)
    elements.append(Spacer(1, 0.3*cm))
    elements.append(Paragraph(
        'Merci pour votre confiance ! — MedicaMarket | Tunis, Tunisie | contact@medicamarket.tn',
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8,
                      textColor=colors.HexColor('#9ca3af'), alignment=TA_CENTER)
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer