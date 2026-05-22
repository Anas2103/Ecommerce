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
  .status-badge { display:inline-block; padding:6px 16px; border-radius:20px; font-weight:bold; font-size:14px;
    background:{{ match($order->status) {
      'shipped'   => '#f3e8ff',
      'delivered' => '#dcfce7',
      'cancelled' => '#fee2e2',
      default     => '#dbeafe',
    } }};
    color:{{ match($order->status) {
      'shipped'   => '#7c3aed',
      'delivered' => '#16a34a',
      'cancelled' => '#dc2626',
      default     => '#1d4ed8',
    } }};
  }
  .footer { padding:20px 32px; background:#f9f9f9; font-size:12px; color:#888; text-align:center; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>Mise à jour de commande</h1>
  </div>
  <div class="body">
    <p>Bonjour <strong>{{ $order->user->name }}</strong>,</p>
    <p>Le statut de votre commande <strong>{{ $order->order_number }}</strong> a été mis à jour :</p>

    <p style="margin:24px 0;">
      <span class="status-badge">{{ ucfirst($order->status) }}</span>
    </p>

    @if($order->status === 'shipped')
      <p>Votre commande est en route. Vous la recevrez sous peu.</p>
    @elseif($order->status === 'delivered')
      <p>Votre commande a été livrée. Nous espérons que vous êtes satisfait(e) !</p>
    @elseif($order->status === 'cancelled')
      <p>Votre commande a été annulée. Si vous pensez qu'il s'agit d'une erreur, contactez-nous.</p>
    @endif

    <p style="font-size:13px;color:#666;margin-top:24px;">Référence : {{ $order->order_number }}</p>
  </div>
  <div class="footer">© {{ date('Y') }} E-Commerce. Tous droits réservés.</div>
</div>
</body>
</html>
