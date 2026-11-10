<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Confirms server-side that a PayPal order was really captured for the expected amount.
 * The client only sends us an order id, which on its own proves nothing.
 */
class PayPalVerifier
{
    public function isConfigured(): bool
    {
        return filled(config('services.paypal.client_id')) && filled(config('services.paypal.secret'));
    }

    /** Amount (in USD) the frontend charges for a MAD total — must match CheckoutPage's conversion. */
    public function expectedUsd(float $totalMad): float
    {
        return round($totalMad / (float) config('services.paypal.mad_to_usd', 10), 2);
    }

    public function verify(string $paypalOrderId, float $totalMad): bool
    {
        if (!$this->isConfigured()) {
            return false;
        }

        $base = config('services.paypal.mode') === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        try {
            $token = Http::asForm()
                ->withBasicAuth(config('services.paypal.client_id'), config('services.paypal.secret'))
                ->timeout(10)
                ->post("$base/v1/oauth2/token", ['grant_type' => 'client_credentials'])
                ->throw()
                ->json('access_token');

            $order = Http::withToken($token)->timeout(10)
                ->get("$base/v2/checkout/orders/" . rawurlencode($paypalOrderId))
                ->throw()
                ->json();
        } catch (\Throwable $e) {
            Log::warning('PayPal verification failed', ['order' => $paypalOrderId, 'error' => $e->getMessage()]);
            return false;
        }

        $amount = data_get($order, 'purchase_units.0.amount');

        return data_get($order, 'status') === 'COMPLETED'
            && data_get($amount, 'currency_code') === 'USD'
            && abs((float) data_get($amount, 'value') - $this->expectedUsd($totalMad)) < 0.01;
    }
}
