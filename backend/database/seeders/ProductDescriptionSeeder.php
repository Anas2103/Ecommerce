<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * Applies the English / French product descriptions (and missing French names)
 * from data/product_descriptions.json, matched by SKU.
 *
 * Safe to run on an existing database: php artisan db:seed --class=ProductDescriptionSeeder
 */
class ProductDescriptionSeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(__DIR__ . '/data/product_descriptions.json'), true, flags: JSON_THROW_ON_ERROR);

        $updated = 0;
        foreach ($data as $sku => $text) {
            $product = Product::withTrashed()->where('sku', $sku)->first();
            if (!$product) {
                continue;
            }
            $product->update(array_filter([
                'description'    => $text['en'] ?? null,
                'description_fr' => $text['fr'] ?? null,
                'name_fr'        => $product->name_fr ?: ($text['name_fr'] ?? null),
            ]));
            $updated++;
        }

        $this->command?->info("Product descriptions applied to {$updated} products.");
    }
}
