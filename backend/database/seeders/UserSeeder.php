<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => env('ADMIN_EMAIL', 'admin@ecommerce.com'),
            'password' => Hash::make($this->adminPassword()),
            'role' => 'admin',
            'phone' => '+212600000001',
            'is_active' => true,
            'preferred_language' => 'fr',
        ]);

        // Demo accounts (password: "password") so visitors can try the seller and client areas.
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

    /**
     * The admin password is public in this repository's README for local use only.
     * Outside local/testing it must come from ADMIN_PASSWORD; otherwise a random one is generated.
     */
    private function adminPassword(): string
    {
        if ($password = env('ADMIN_PASSWORD')) {
            return $password;
        }
        if (app()->environment('local', 'testing')) {
            return 'password';
        }

        $password = Str::password(20);
        $this->command?->warn("ADMIN_PASSWORD not set — generated admin password: {$password}");
        return $password;
    }
}
