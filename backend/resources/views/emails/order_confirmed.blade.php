<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}">
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
    <h1>{{ __('Order confirmed') }}</h1>
  </div>
  <div class="body">
    <p>{{ __('Hello :name,', ['name' => $order->user->name]) }}</p>
    <p>{{ __('We have received your order and are getting it ready.') }}</p>
    <p class="order-num">{{ $order->order_number }}</p>

    <table>
      <thead>
        <tr><th>{{ __('Product') }}</th><th>{{ __('Qty') }}</th><th>{{ __('Price') }}</th></tr>
      </thead>
      <tbody>
        @foreach($order->items as $item)
        <tr>
          <td>{{ $item->product_name }}</td>
          <td>{{ $item->quantity }}</td>
          <td>{{ number_format($item->total, 2) }} MAD</td>
        </tr>
        @endforeach
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="2">{{ __('Total') }}</td>
          <td>{{ number_format($order->total, 2) }} MAD</td>
        </tr>
      </tfoot>
    </table>

    <p style="font-size:13px;color:#555;">
      {{ __('Payment method') }} : <strong>{{ strtoupper($order->payment_method) }}</strong><br>
      {{ __('Status') }} : <strong>{{ __(ucfirst($order->status)) }}</strong>
    </p>

    <p>{{ __('Thank you for your purchase!') }}</p>
  </div>
  <div class="footer">© {{ date('Y') }} E-Commerce. {{ __('All rights reserved.') }}</div>
</div>
</body>
</html>
