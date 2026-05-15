<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'name_fr', 'slug', 'description', 'description_fr',
        'price', 'compare_price', 'discount_percent', 'stock', 'low_stock_alert',
        'sku', 'category_id', 'seller_id', 'is_active', 'is_featured',
        'weight', 'attributes', 'views',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_price' => 'decimal:2',
            'discount_percent' => 'decimal:2',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'attributes' => 'array',
        ];
    }

    public function getFinalPriceAttribute(): float
    {
        if ($this->discount_percent > 0) {
            return round($this->price * (1 - $this->discount_percent / 100), 2);
        }
        return (float) $this->price;
    }

    public function getPrimaryImageUrlAttribute(): string
    {
        $primary = $this->images()->where('is_primary', true)->first()
            ?? $this->images()->orderBy('sort_order')->first();

        return $primary
            ? url('storage/' . $primary->image_path)
            : url('storage/products/placeholder.jpg');
    }

    public function getAverageRatingAttribute(): float
    {
        return round($this->reviews()->where('is_approved', true)->avg('rating') ?? 0, 1);
    }

    public function getInStockAttribute(): bool
    {
        return $this->stock > 0;
    }

    public function scopeActive($query) { return $query->where('is_active', true); }
    public function scopeFeatured($query) { return $query->where('is_featured', true); }
    public function scopeInStock($query) { return $query->where('stock', '>', 0); }
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('name_fr', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%")
              ->orWhere('sku', 'like', "%{$term}%");
        });
    }

    public function category() { return $this->belongsTo(Category::class); }
    public function seller() { return $this->belongsTo(User::class, 'seller_id'); }
    public function images() { return $this->hasMany(ProductImage::class)->orderBy('sort_order'); }
    public function tags() { return $this->hasMany(ProductTag::class); }
    public function reviews() { return $this->hasMany(Review::class); }
    public function wishlists() { return $this->hasMany(Wishlist::class); }
    public function orderItems() { return $this->hasMany(OrderItem::class); }
    public function cartItems() { return $this->hasMany(CartItem::class); }
}
