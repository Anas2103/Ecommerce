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
    <h1>{{ __('Order update') }}</h1>
  </div>
  <div class="body">
    <p>{{ __('Hello :name,', ['name' => $order->user->name]) }}</p>
    <p>{{ __('The status of your order :number has been updated:', ['number' => $order->order_number]) }}</p>

    <p style="margin:24px 0;">
      <span class="status-badge">{{ __(ucfirst($order->status)) }}</span>
    </p>

    @if($order->status === 'shipped')
      <p>{{ __('Your order is on its way. It will arrive soon.') }}</p>
    @elseif($order->status === 'delivered')
      <p>{{ __('Your order has been delivered. We hope you enjoy it!') }}</p>
    @elseif($order->status === 'cancelled')
      <p>{{ __('Your order has been cancelled. If you think this is a mistake, please contact us.') }}</p>
    @endif

    <p style="font-size:13px;color:#666;margin-top:24px;">{{ __('Reference') }} : {{ $order->order_number }}</p>
  </div>
  <div class="footer">© {{ date('Y') }} E-Commerce. {{ __('All rights reserved.') }}</div>
</div>
</body>
</html>
