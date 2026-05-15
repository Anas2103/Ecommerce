<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Facture {{ $order->order_number }}</title>
<style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #333; margin: 0; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
    .invoice-title { font-size: 28px; color: #6366f1; text-align: right; }
    .invoice-info { text-align: right; color: #666; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: bold; color: #6366f1; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #6366f1; color: white; padding: 8px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #f3f4f6; }
    tr:nth-child(even) td { background: #f9fafb; }
    .totals { margin-left: auto; width: 300px; }
    .totals td { padding: 5px 8px; }
    .totals .total-row { font-weight: bold; font-size: 14px; background: #6366f1; color: white; }
    .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .badge-green { background: #d1fae5; color: #065f46; }
</style>
</head>
<body>
<div class="header">
    <div>
        <div class="logo">🛒 E-Commerce</div>
        <div style="color:#666; margin-top:5px;">Votre boutique en ligne</div>
        <div style="color:#666;">support@ecommerce.com</div>
    </div>
    <div>
        <div class="invoice-title">FACTURE</div>
        <div class="invoice-info">
            <div>N° {{ $order->order_number }}</div>
            <div>Date: {{ $order->created_at->format('d/m/Y') }}</div>
            @if($order->paid_at)
            <div>Payé le: {{ $order->paid_at->format('d/m/Y H:i') }}</div>
            @endif
            <div><span class="badge badge-green">{{ strtoupper($order->payment_status) }}</span></div>
        </div>
    </div>
</div>

<div style="display:flex; gap:40px; margin-bottom:20px;">
    <div class="section" style="flex:1;">
        <div class="section-title">Facturé à</div>
        @if($order->address)
        <div><strong>{{ $order->address->full_name }}</strong></div>
        <div>{{ $order->address->address_line1 }}</div>
        @if($order->address->address_line2)<div>{{ $order->address->address_line2 }}</div>@endif
        <div>{{ $order->address->city }}, {{ $order->address->postal_code }}</div>
        <div>{{ $order->address->country }}</div>
        <div>Tél: {{ $order->address->phone }}</div>
        @endif
    </div>
    <div class="section" style="flex:1;">
        <div class="section-title">Informations de paiement</div>
        <div><strong>Méthode:</strong> {{ ucfirst($order->payment_method ?? 'Carte') }}</div>
        @if($order->payment_reference)
        <div><strong>Référence:</strong> {{ $order->payment_reference }}</div>
        @endif
        @if($order->shippingMethod)
        <div><strong>Livraison:</strong> {{ $order->shippingMethod->name_fr ?? $order->shippingMethod->name }}</div>
        @endif
    </div>
</div>

<div class="section">
    <div class="section-title">Articles commandés</div>
    <table>
        <thead>
            <tr>
                <th>Produit</th>
                <th style="text-align:center;">Qté</th>
                <th style="text-align:right;">Prix unitaire</th>
                <th style="text-align:right;">Remise</th>
                <th style="text-align:right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product_name }}</td>
                <td style="text-align:center;">{{ $item->quantity }}</td>
                <td style="text-align:right;">{{ number_format($item->price, 2) }} MAD</td>
                <td style="text-align:right;">{{ $item->discount_percent > 0 ? $item->discount_percent.'%' : '-' }}</td>
                <td style="text-align:right;">{{ number_format($item->total, 2) }} MAD</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>

<table class="totals" style="margin-top:20px;">
    <tr>
        <td>Sous-total:</td>
        <td style="text-align:right;">{{ number_format($order->subtotal, 2) }} MAD</td>
    </tr>
    @if($order->discount_amount > 0)
    <tr>
        <td style="color:#ef4444;">Remise:</td>
        <td style="text-align:right; color:#ef4444;">-{{ number_format($order->discount_amount, 2) }} MAD</td>
    </tr>
    @endif
    <tr>
        <td>Frais de livraison:</td>
        <td style="text-align:right;">{{ number_format($order->shipping_amount, 2) }} MAD</td>
    </tr>
    <tr>
        <td>TVA (20%):</td>
        <td style="text-align:right;">{{ number_format($order->tax_amount, 2) }} MAD</td>
    </tr>
    <tr class="total-row">
        <td><strong>TOTAL:</strong></td>
        <td style="text-align:right;"><strong>{{ number_format($order->total, 2) }} MAD</strong></td>
    </tr>
</table>

<div class="footer">
    <p>Merci pour votre achat ! Pour toute question, contactez support@ecommerce.com</p>
    <p>E-Commerce • Casablanca, Maroc • www.ecommerce.com</p>
</div>
</body>
</html>
