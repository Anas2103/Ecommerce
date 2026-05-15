<?php

namespace Database\Seeders;

use App\Models\ShippingMethod;
use Illuminate\Database\Seeder;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        ShippingMethod::create(['name' => 'Standard Delivery', 'name_fr' => 'Livraison Standard', 'price' => 29.00, 'estimated_days_min' => 3, 'estimated_days_max' => 5, 'is_active' => true]);
        ShippingMethod::create(['name' => 'Express Delivery', 'name_fr' => 'Livraison Express', 'price' => 59.00, 'estimated_days_min' => 1, 'estimated_days_max' => 2, 'is_active' => true]);
        ShippingMethod::create(['name' => 'Free Store Pickup', 'name_fr' => 'Retrait en Magasin', 'price' => 0.00, 'estimated_days_min' => 1, 'estimated_days_max' => 1, 'is_active' => true]);
    }
}
