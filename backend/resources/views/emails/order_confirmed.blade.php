<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background:#f5f5f5; margin:0; padding:20px; color:#333; }
  .card { background:#fff; max-width:560px; margin:0 auto; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .header { background:#111; padding:28px 32px; }
  .header h1 { color:#fff; margin:0; font-size:20px; }
  .body { padding:32px; }
  .order-num { font-size:22px; font-weight:bold; color:#111; }
  table { width:100%; border-collapse:collapse; margin:20px 0; }
  th { text-align:left; padding:8px 10px; background:#f5f5f5; font-size:12px; color:#666; text-transform:uppercase; }
  td { padding:10px; border-bottom:1px solid #eee; font-size:14px; }
  .total-row td { font-weight:bold; font-size:15px; border-top:2px solid #111; border-bottom:none; }
  .footer { padding:20px 32px; background:#f9f9f9; font-size:12px; color:#888; text-align:center; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>Commande confirmée</h1>
  </div>
  <div class="body">
    <p>Bonjour <strong>{{ $order->user->name }}</strong>,</p>
    <p>Votre commande a bien été reçue et est en cours de traitement.</p>
    <p class="order-num">{{ $order->order_number }}</p>

    <table>
      <thead>
        <tr><th>Produit</th><th>Qté</th><th>Prix</th></tr>
      </thead>
      <tbody>
        @foreach($order->items as $item)
        <tr>
          <td>{{ $item->product_name }}</td>
          <td>{{ $item->quantity }}</td>
          <td>{{ number_format($item->total, 2) }} €</td>
        </tr>
        @endforeach
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="2">Total</td>
          <td>{{ number_format($order->total, 2) }} €</td>
        </tr>
      </tfoot>
    </table>

    <p style="font-size:13px;color:#555;">
      Méthode de paiement : <strong>{{ strtoupper($order->payment_method) }}</strong><br>
      Statut : <strong>{{ ucfirst($order->status) }}</strong>
    </p>

    <p>Merci pour votre achat !</p>
  </div>
  <div class="footer">© {{ date('Y') }} E-Commerce. Tous droits réservés.</div>
</div>
</body>
</html>
