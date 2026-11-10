<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Card payments through Stripe PaymentIntents (works with test-mode keys).
 * Prices are in MAD, which Stripe supports natively — amounts are sent in centimes.
 */
class StripeGateway
{
    private const API = 'https://api.stripe.com/v1';

    public function isConfigured(): bool
    {
        return filled(config('services.stripe.secret'));
    }

    public function currency(): string
    {
        return strtolower(config('services.stripe.currency', 'mad'));
    }

    public static function toMinorUnits(float $amount): int
    {
        return (int) round($amount * 100);
    }

    /** @return array{id: string, client_secret: string} */
    public function createIntent(float $amount, int $userId): array
    {
        $intent = Http::asForm()
            ->withToken(config('services.stripe.secret'))
            ->timeout(15)
            ->post(self::API . '/payment_intents', [
                'amount'                 => self::toMinorUnits($amount),
                'currency'               => $this->currency(),
                'payment_method_types[]' => 'card',
                'metadata[user_id]'      => $userId,
            ])
            ->throw()
            ->json();

        return ['id' => $intent['id'], 'client_secret' => $intent['client_secret']];
    }

    /** True only if the intent succeeded, for this exact amount and currency, for this user. */
    public function verify(string $intentId, float $expectedAmount, int $userId): bool
    {
        if (!$this->isConfigured() || !str_starts_with($intentId, 'pi_')) {
            return false;
        }

        try {
            $intent = Http::withToken(config('services.stripe.secret'))
                ->timeout(15)
                ->get(self::API . '/payment_intents/' . rawurlencode($intentId))
                ->throw()
                ->json();
        } catch (\Throwable $e) {
            Log::warning('Stripe verification failed', ['intent' => $intentId, 'error' => $e->getMessage()]);
            return false;
        }

        return ($intent['status'] ?? null) === 'succeeded'
            && (int) ($intent['amount_received'] ?? 0) === self::toMinorUnits($expectedAmount)
            && ($intent['currency'] ?? null) === $this->currency()
            && (string) ($intent['metadata']['user_id'] ?? '') === (string) $userId;
    }
}
