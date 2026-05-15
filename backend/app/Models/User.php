<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'phone', 'avatar',
        'is_active', 'preferred_language',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return url('storage/' . $this->avatar);
        }
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=6366f1&color=fff';
    }

    public function isAdmin(): bool { return $this->role === 'admin'; }
    public function isSeller(): bool { return $this->role === 'seller'; }
    public function isClient(): bool { return $this->role === 'client'; }

    public function orders() { return $this->hasMany(Order::class); }
    public function products() { return $this->hasMany(Product::class, 'seller_id'); }
    public function reviews() { return $this->hasMany(Review::class); }
    public function addresses() { return $this->hasMany(Address::class); }
    public function wishlists() { return $this->hasMany(Wishlist::class); }
    public function cart() { return $this->hasOne(Cart::class); }
    public function sellerDocuments() { return $this->hasMany(SellerDocument::class); }
}
