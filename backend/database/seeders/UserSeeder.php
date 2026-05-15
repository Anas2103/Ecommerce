<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@ecommerce.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '+212600000001',
            'is_active' => true,
            'preferred_language' => 'fr',
        ]);

        User::create([
            'name' => 'Seller Demo',
            'email' => 'seller@ecommerce.com',
            'password' => Hash::make('password'),
            'role' => 'seller',
            'phone' => '+212600000002',
            'is_active' => true,
            'preferred_language' => 'fr',
        ]);

        User::create([
            'name' => 'Client Demo',
            'email' => 'client@ecommerce.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'phone' => '+212600000003',
            'is_active' => true,
            'preferred_language' => 'fr',
        ]);
    }
}
