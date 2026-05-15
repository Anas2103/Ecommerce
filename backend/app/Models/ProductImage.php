<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'image_path', 'is_primary', 'sort_order'];

    protected $appends = ['url'];

    protected function casts(): array
    {
        return ['is_primary' => 'boolean'];
    }

    public function getUrlAttribute(): string
    {
        return url('storage/' . $this->image_path);
    }

    public function product() { return $this->belongsTo(Product::class); }
}
