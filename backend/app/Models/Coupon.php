<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'min_order_amount', 'max_uses',
        'used_count', 'expires_at', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    public function isValid(float $amount): bool
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses && $this->used_count >= $this->max_uses) return false;
        if ($amount < $this->min_order_amount) return false;
        return true;
    }

    public function calculateDiscount(float $amount): float
    {
        if ($this->type === 'percent') {
            return round($amount * $this->value / 100, 2);
        }
        return min((float) $this->value, $amount);
    }
}
