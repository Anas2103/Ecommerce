<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class ProductImageSeeder extends Seeder
{
    // Unsplash photo IDs matched to each product SKU
    private array $images = [
        'SGS24-001'   => 'photo-1610945415295-d9bbf067e59c',  // Samsung phone
        'IP15P-001'   => 'photo-1592750475338-74b7b21085ab',  // iPhone
        'MBP-M3-001'  => 'photo-1496181133206-80ce9b88a853',  // MacBook
        'DXPS15-001'  => 'photo-1593642632559-0c6d3fc62b89',  // Dell laptop
        'APP-001'     => 'photo-1600294037681-c80b4cb5b434',  // AirPods
        'MCT-001'     => 'photo-1521572163474-6864f9cf17ab',  // T-Shirt
        'WSD-001'     => 'photo-1515372039744-b8f02a3ae446',  // Summer dress
        'KDB-001'     => 'photo-1553062407-98eeb64c6a62',     // Backpack
        'MCT-FUR-001' => 'photo-1555041469-a586c61ea9bc',     // Coffee table
        'NSCS-001'    => 'photo-1584568694244-14fbdf83bd30',  // Cookware
        'YMP-001'     => 'photo-1544367567-0f2fcb009e0b',     // Yoga mat
        'RSP-001'     => 'photo-1542291026-7eec264c27ff',     // Running shoes
        'TAW-001'     => 'photo-1544947950-fa07a98d237f',     // Book
        'VCS-001'     => 'photo-1620916566398-39f1143ab7be',  // Serum
        'PCN5-001'    => 'photo-1541643600914-78b084683702',  // Perfume
        'LCPS-001'    => 'photo-1587654780291-39c9404d746b',  // LEGO
        'MAO-001'     => 'photo-1608248597279-f99d160bfcbc',  // Argan oil
        'WGM-001'     => 'photo-1527864550417-7fd91fc51a46',  // Gaming mouse
        'LJ-001'      => 'photo-1551028719-00167b16eac5',     // Leather jacket
        'SW9-001'     => 'photo-1508685096489-7aacd43bd3b1',  // Smartwatch
    ];

    public function run(): void
    {
        // Remove existing product images
        ProductImage::truncate();

        $dir = 'products';
        Storage::disk('public')->makeDirectory($dir);

        $ctx = stream_context_create([
            'http' => [
                'timeout'       => 20,
                'user_agent'    => 'Mozilla/5.0 (compatible; EcommerceSeeder/1.0)',
                'ignore_errors' => true,
            ],
            'ssl' => ['verify_peer' => false, 'verify_peer_name' => false],
        ]);

        foreach ($this->images as $sku => $photoId) {
            $product = Product::where('sku', $sku)->first();
            if (!$product) {
                $this->command->warn("Product not found: $sku");
                continue;
            }

            $url      = "https://images.unsplash.com/{$photoId}?w=600&q=80&auto=format&fit=crop";
            $filename = $dir . '/' . $sku . '.jpg';

            $this->command->info("Downloading image for {$product->name}...");

            $bytes = @file_get_contents($url, false, $ctx);

            if (!$bytes || strlen($bytes) < 5000) {
                $this->command->warn("  Failed or too small — skipping $sku");
                continue;
            }

            Storage::disk('public')->put($filename, $bytes);

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $filename,
                'is_primary'  => true,
                'sort_order'  => 0,
            ]);

            $this->command->info("  Saved: $filename (" . round(strlen($bytes) / 1024) . " KB)");
        }

        $this->command->info('ProductImageSeeder done.');
    }
}
