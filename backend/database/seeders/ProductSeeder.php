<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductTag;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $seller = User::where('role', 'seller')->first();

        $products = [
            ['name' => 'Samsung Galaxy S24', 'name_fr' => 'Samsung Galaxy S24', 'category' => 'smartphones', 'price' => 8999, 'compare_price' => 10999, 'discount_percent' => 18.18, 'stock' => 25, 'is_featured' => true, 'sku' => 'SGS24-001', 'tags' => ['smartphone', 'samsung', '5G'], 'description' => 'Latest Samsung flagship with advanced AI features and stunning display.'],
            ['name' => 'iPhone 15 Pro', 'name_fr' => 'iPhone 15 Pro', 'category' => 'smartphones', 'price' => 12999, 'compare_price' => null, 'discount_percent' => 0, 'stock' => 15, 'is_featured' => true, 'sku' => 'IP15P-001', 'tags' => ['iphone', 'apple', 'premium'], 'description' => 'Apple iPhone 15 Pro with titanium design and A17 Pro chip.'],
            ['name' => 'MacBook Pro M3', 'name_fr' => 'MacBook Pro M3', 'category' => 'laptops', 'price' => 19999, 'compare_price' => 22999, 'discount_percent' => 13.04, 'stock' => 10, 'is_featured' => true, 'sku' => 'MBP-M3-001', 'tags' => ['macbook', 'apple', 'laptop'], 'description' => 'Powerful MacBook Pro with M3 chip for professionals.'],
            ['name' => 'Dell XPS 15', 'name_fr' => 'Dell XPS 15', 'category' => 'laptops', 'price' => 14999, 'compare_price' => 16999, 'discount_percent' => 11.76, 'stock' => 8, 'is_featured' => false, 'sku' => 'DXPS15-001', 'tags' => ['dell', 'laptop', 'windows'], 'description' => 'Premium Dell laptop with OLED display and 12th gen Intel.'],
            ['name' => 'AirPods Pro', 'name_fr' => 'AirPods Pro', 'category' => 'electronics-accessories', 'price' => 2999, 'compare_price' => 3499, 'discount_percent' => 14.29, 'stock' => 50, 'is_featured' => true, 'sku' => 'APP-001', 'tags' => ['apple', 'earphones', 'wireless'], 'description' => 'Active noise cancellation wireless earbuds with premium sound quality.'],
            ['name' => 'Men\'s Classic T-Shirt', 'name_fr' => 'T-Shirt Classique Homme', 'category' => 'men-clothing', 'price' => 199, 'compare_price' => 299, 'discount_percent' => 33.44, 'stock' => 100, 'is_featured' => false, 'sku' => 'MCT-001', 'tags' => ['tshirt', 'men', 'casual'], 'description' => 'Premium cotton classic fit t-shirt for men.'],
            ['name' => 'Women Summer Dress', 'name_fr' => 'Robe d\'Été Femme', 'category' => 'women-clothing', 'price' => 449, 'compare_price' => 649, 'discount_percent' => 30.82, 'stock' => 60, 'is_featured' => true, 'sku' => 'WSD-001', 'tags' => ['dress', 'women', 'summer'], 'description' => 'Beautiful floral summer dress, lightweight and comfortable.'],
            ['name' => 'Kids Dinosaur Backpack', 'name_fr' => 'Sac à Dos Dinosaure Enfant', 'category' => 'kids-clothing', 'price' => 249, 'compare_price' => 349, 'discount_percent' => 28.65, 'stock' => 45, 'is_featured' => false, 'sku' => 'KDB-001', 'tags' => ['kids', 'backpack', 'school'], 'description' => 'Fun dinosaur backpack for kids, durable and spacious.'],
            ['name' => 'Modern Coffee Table', 'name_fr' => 'Table Basse Moderne', 'category' => 'furniture', 'price' => 1899, 'compare_price' => 2499, 'discount_percent' => 24.01, 'stock' => 12, 'is_featured' => true, 'sku' => 'MCT-FUR-001', 'tags' => ['furniture', 'table', 'modern'], 'description' => 'Minimalist coffee table with tempered glass top and oak legs.'],
            ['name' => 'Non-Stick Cookware Set', 'name_fr' => 'Set de Casseroles Antiadhésives', 'category' => 'kitchen', 'price' => 899, 'compare_price' => 1299, 'discount_percent' => 30.79, 'stock' => 30, 'is_featured' => false, 'sku' => 'NSCS-001', 'tags' => ['cookware', 'kitchen', 'cooking'], 'description' => '8-piece non-stick cookware set with induction compatible base.'],
            ['name' => 'Yoga Mat Premium', 'name_fr' => 'Tapis de Yoga Premium', 'category' => 'fitness', 'price' => 399, 'compare_price' => 599, 'discount_percent' => 33.39, 'stock' => 75, 'is_featured' => true, 'sku' => 'YMP-001', 'tags' => ['yoga', 'fitness', 'sports'], 'description' => '6mm thick non-slip yoga mat with alignment lines.'],
            ['name' => 'Running Shoes Pro', 'name_fr' => 'Chaussures de Course Pro', 'category' => 'fitness', 'price' => 1299, 'compare_price' => 1699, 'discount_percent' => 23.54, 'stock' => 40, 'is_featured' => true, 'sku' => 'RSP-001', 'tags' => ['shoes', 'running', 'sports'], 'description' => 'Lightweight running shoes with superior cushioning and breathable mesh.'],
            ['name' => 'The Art of War', 'name_fr' => "L'Art de la Guerre", 'category' => 'non-fiction', 'price' => 89, 'compare_price' => null, 'discount_percent' => 0, 'stock' => 200, 'is_featured' => false, 'sku' => 'TAW-001', 'tags' => ['book', 'strategy', 'classic'], 'description' => 'Timeless classic on military strategy by Sun Tzu.'],
            ['name' => 'Vitamin C Serum', 'name_fr' => 'Sérum Vitamine C', 'category' => 'skincare', 'price' => 349, 'compare_price' => 499, 'discount_percent' => 30.06, 'stock' => 80, 'is_featured' => true, 'sku' => 'VCS-001', 'tags' => ['skincare', 'vitamin-c', 'serum'], 'description' => 'Brightening Vitamin C serum for glowing skin, 20% concentration.'],
            ['name' => 'Parfum Chanel N°5', 'name_fr' => 'Parfum Chanel N°5', 'category' => 'perfumes', 'price' => 2499, 'compare_price' => 2999, 'discount_percent' => 16.67, 'stock' => 20, 'is_featured' => true, 'sku' => 'PCN5-001', 'tags' => ['perfume', 'chanel', 'luxury'], 'description' => 'Iconic Chanel No.5 Eau de Parfum, floral-aldehyde fragrance.'],
            ['name' => 'LEGO City Police Station', 'name_fr' => 'Commissariat LEGO City', 'category' => 'toys', 'price' => 1299, 'compare_price' => 1599, 'discount_percent' => 18.76, 'stock' => 35, 'is_featured' => false, 'sku' => 'LCPS-001', 'tags' => ['lego', 'toys', 'kids'], 'description' => 'LEGO City Police Station with 668 pieces for ages 6+.'],
            ['name' => 'Moroccan Argan Oil', 'name_fr' => "Huile d'Argan Marocaine", 'category' => 'food-drinks', 'price' => 299, 'compare_price' => 399, 'discount_percent' => 25.06, 'stock' => 120, 'is_featured' => true, 'sku' => 'MAO-001', 'tags' => ['argan', 'organic', 'moroccan'], 'description' => '100% pure cold-pressed Moroccan argan oil, 250ml.'],
            ['name' => 'Wireless Gaming Mouse', 'name_fr' => 'Souris Gaming Sans Fil', 'category' => 'electronics-accessories', 'price' => 799, 'compare_price' => 999, 'discount_percent' => 20.02, 'stock' => 55, 'is_featured' => false, 'sku' => 'WGM-001', 'tags' => ['gaming', 'mouse', 'wireless'], 'description' => 'High precision wireless gaming mouse with RGB lighting and long battery.'],
            ['name' => 'Leather Jacket', 'name_fr' => 'Veste en Cuir', 'category' => 'men-clothing', 'price' => 2499, 'compare_price' => 3499, 'discount_percent' => 28.58, 'stock' => 15, 'is_featured' => true, 'sku' => 'LJ-001', 'tags' => ['jacket', 'leather', 'men'], 'description' => 'Genuine leather motorcycle jacket with quilted lining.'],
            ['name' => 'Smart Watch Series 9', 'name_fr' => 'Montre Connectée Série 9', 'category' => 'electronics-accessories', 'price' => 3999, 'compare_price' => 4999, 'discount_percent' => 20.00, 'stock' => 30, 'is_featured' => true, 'sku' => 'SW9-001', 'tags' => ['smartwatch', 'wearable', 'health'], 'description' => 'Advanced smartwatch with health monitoring, GPS and 18-hour battery.'],
        ];

        foreach ($products as $productData) {
            $categorySlug = $productData['category'];
            $tags = $productData['tags'];
            unset($productData['category'], $productData['tags']);

            $category = Category::where('slug', $categorySlug)->first();

            $product = Product::create(array_merge($productData, [
                'slug' => Str::slug($productData['name']) . '-' . Str::random(5),
                'category_id' => $category?->id,
                'seller_id' => $seller->id,
                'is_active' => true,
                'low_stock_alert' => 5,
                'weight' => rand(100, 5000) / 100,
            ]));

            foreach ($tags as $tag) {
                ProductTag::create(['product_id' => $product->id, 'tag' => $tag]);
            }

            // Create image record using the committed file (no download needed)
            $imgPath = 'products/' . $productData['sku'] . '.jpg';
            if (file_exists(storage_path('app/public/' . $imgPath))) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $imgPath,
                    'is_primary' => true,
                    'sort_order' => 0,
                ]);
            }
        }
    }
}
