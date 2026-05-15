<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::create(['code' => 'WELCOME10', 'type' => 'percent', 'value' => 10, 'min_order_amount' => 0, 'max_uses' => null, 'is_active' => true, 'expires_at' => now()->addYear()]);
        Coupon::create(['code' => 'SAVE50', 'type' => 'fixed', 'value' => 50, 'min_order_amount' => 200, 'max_uses' => 100, 'is_active' => true, 'expires_at' => now()->addYear()]);
        Coupon::create(['code' => 'SUMMER20', 'type' => 'percent', 'value' => 20, 'min_order_amount' => 100, 'max_uses' => 500, 'is_active' => true, 'expires_at' => now()->addMonths(6)]);
    }
}
