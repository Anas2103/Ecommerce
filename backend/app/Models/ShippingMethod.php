<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    protected $fillable = [
        'name', 'name_fr', 'price', 'estimated_days_min', 'estimated_days_max', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function orders() { return $this->hasMany(Order::class); }
    public function scopeActive($query) { return $query->where('is_active', true); }
}
