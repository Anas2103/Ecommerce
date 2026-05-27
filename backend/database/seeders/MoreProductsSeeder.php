<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductTag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MoreProductsSeeder extends Seeder
{
    private array $products = [
        // ── Smartphones ────────────────────────────────────────────────────────
        ['sku'=>'GP8P-001',  'name'=>'Google Pixel 8 Pro',        'category'=>'smartphones',           'price'=>9999,  'compare_price'=>11999, 'discount_percent'=>16.67, 'stock'=>18, 'is_featured'=>true,  'tags'=>['google','pixel','android'],   'photo'=>'photo-1598327105666-5b89351aff97'],
        ['sku'=>'XI14-001',  'name'=>'Xiaomi 14 Ultra',            'category'=>'smartphones',           'price'=>7499,  'compare_price'=>8999,  'discount_percent'=>16.68, 'stock'=>22, 'is_featured'=>false, 'tags'=>['xiaomi','android','camera'],  'photo'=>'photo-1574944985070-8f3ebc6b79d2'],
        ['sku'=>'SGA55-001', 'name'=>'Samsung Galaxy A55',         'category'=>'smartphones',           'price'=>4299,  'compare_price'=>4999,  'discount_percent'=>14.00, 'stock'=>40, 'is_featured'=>false, 'tags'=>['samsung','android','midrange'],'photo'=>'photo-1565849904461-04a58ad377e0'],

        // ── Laptops ────────────────────────────────────────────────────────────
        ['sku'=>'HPX360-001','name'=>'HP Spectre x360',            'category'=>'laptops',               'price'=>13999, 'compare_price'=>15999, 'discount_percent'=>12.50, 'stock'=>7,  'is_featured'=>true,  'tags'=>['hp','laptop','2in1'],         'photo'=>'photo-1588872657578-7efd1f1555ed'],
        ['sku'=>'LTX1-001',  'name'=>'Lenovo ThinkPad X1 Carbon',  'category'=>'laptops',               'price'=>15499, 'compare_price'=>17999, 'discount_percent'=>13.89, 'stock'=>5,  'is_featured'=>false, 'tags'=>['lenovo','thinkpad','business'],'photo'=>'photo-1516321318423-f06f85e504b3'],
        ['sku'=>'AROG-001',  'name'=>'ASUS ROG Zephyrus G14',      'category'=>'laptops',               'price'=>16999, 'compare_price'=>19999, 'discount_percent'=>15.00, 'stock'=>6,  'is_featured'=>true,  'tags'=>['asus','gaming','laptop'],     'photo'=>'photo-1603302576837-37561b2e2302'],

        // ── Electronics Accessories ────────────────────────────────────────────
        ['sku'=>'SWH-001',   'name'=>'Sony WH-1000XM5',            'category'=>'electronics-accessories','price'=>3499, 'compare_price'=>4299,  'discount_percent'=>18.60, 'stock'=>35, 'is_featured'=>true,  'tags'=>['sony','headphones','noise-cancelling'],'photo'=>'photo-1505740420928-5e560c06d30e'],
        ['sku'=>'LGMX-001',  'name'=>'Logitech MX Keys Keyboard',  'category'=>'electronics-accessories','price'=>1299, 'compare_price'=>1599,  'discount_percent'=>18.76, 'stock'=>45, 'is_featured'=>false, 'tags'=>['logitech','keyboard','wireless'],    'photo'=>'photo-1561040604-a3c5cba56c5e'],
        ['sku'=>'SAM27-001', 'name'=>'Samsung 27" 4K Monitor',     'category'=>'electronics-accessories','price'=>5999, 'compare_price'=>7499,  'discount_percent'=>20.00, 'stock'=>12, 'is_featured'=>true,  'tags'=>['samsung','monitor','4k'],           'photo'=>'photo-1527443224154-c4a3942d3acf'],

        // ── Men Clothing ───────────────────────────────────────────────────────
        ['sku'=>'MCP-001',   'name'=>'Men\'s Slim Chino Pants',    'category'=>'men-clothing',          'price'=>449,   'compare_price'=>599,   'discount_percent'=>25.04, 'stock'=>70, 'is_featured'=>false, 'tags'=>['pants','men','chino'],        'photo'=>'photo-1548883354-94bcfe321cbb'],
        ['sku'=>'MFS-001',   'name'=>'Men\'s Oxford Dress Shirt',  'category'=>'men-clothing',          'price'=>349,   'compare_price'=>499,   'discount_percent'=>30.06, 'stock'=>80, 'is_featured'=>false, 'tags'=>['shirt','men','formal'],       'photo'=>'photo-1603252109303-2751441dd157'],
        ['sku'=>'MWJ-001',   'name'=>'Men\'s Puffer Winter Jacket','category'=>'men-clothing',          'price'=>1299,  'compare_price'=>1799,  'discount_percent'=>27.79, 'stock'=>30, 'is_featured'=>true,  'tags'=>['jacket','men','winter'],      'photo'=>'photo-1591047139829-d91aecb6caea'],

        // ── Women Clothing ─────────────────────────────────────────────────────
        ['sku'=>'WBL-001',   'name'=>'Women\'s Tailored Blazer',   'category'=>'women-clothing',        'price'=>899,   'compare_price'=>1299,  'discount_percent'=>30.79, 'stock'=>45, 'is_featured'=>true,  'tags'=>['blazer','women','formal'],    'photo'=>'photo-1594938298603-c8148c4b4dd7'],
        ['sku'=>'WJN-001',   'name'=>'Women\'s Skinny Jeans',      'category'=>'women-clothing',        'price'=>549,   'compare_price'=>749,   'discount_percent'=>26.70, 'stock'=>65, 'is_featured'=>false, 'tags'=>['jeans','women','denim'],      'photo'=>'photo-1541099649105-f69ad21f3246'],
        ['sku'=>'WHB-001',   'name'=>'Women\'s Leather Handbag',   'category'=>'women-clothing',        'price'=>1499,  'compare_price'=>1999,  'discount_percent'=>25.01, 'stock'=>25, 'is_featured'=>true,  'tags'=>['handbag','women','leather'],  'photo'=>'photo-1548036328-c9fa89d128fa'],

        // ── Kids Clothing ──────────────────────────────────────────────────────
        ['sku'=>'KSN-001',   'name'=>'Kids\' Light-Up Sneakers',   'category'=>'kids-clothing',         'price'=>299,   'compare_price'=>399,   'discount_percent'=>25.06, 'stock'=>55, 'is_featured'=>false, 'tags'=>['kids','sneakers','shoes'],    'photo'=>'photo-1543508282-6319a3e2621f'],
        ['sku'=>'KWC-001',   'name'=>'Kids\' Hooded Winter Coat',  'category'=>'kids-clothing',         'price'=>499,   'compare_price'=>699,   'discount_percent'=>28.61, 'stock'=>35, 'is_featured'=>false, 'tags'=>['kids','coat','winter'],       'photo'=>'photo-1611312449408-fcece27cdbb7'],
        ['sku'=>'KSS-001',   'name'=>'Kids\' Summer Shorts Set',   'category'=>'kids-clothing',         'price'=>199,   'compare_price'=>299,   'discount_percent'=>33.44, 'stock'=>80, 'is_featured'=>false, 'tags'=>['kids','shorts','summer'],     'photo'=>'photo-1622290291468-a28f7a7dc6a8'],

        // ── Furniture ──────────────────────────────────────────────────────────
        ['sku'=>'EOC-001',   'name'=>'Ergonomic Office Chair',      'category'=>'furniture',             'price'=>2999,  'compare_price'=>3999,  'discount_percent'=>25.01, 'stock'=>14, 'is_featured'=>true,  'tags'=>['chair','office','ergonomic'], 'photo'=>'photo-1505843490538-5133c6c7d0e1'],
        ['sku'=>'OBS-001',   'name'=>'Oak Bookshelf 5 Tiers',       'category'=>'furniture',             'price'=>1599,  'compare_price'=>2199,  'discount_percent'=>27.28, 'stock'=>10, 'is_featured'=>false, 'tags'=>['bookshelf','furniture','oak'],'photo'=>'photo-1507003211169-0a1dd7228f2d'],
        ['sku'=>'FLL-001',   'name'=>'Floor Standing LED Lamp',     'category'=>'furniture',             'price'=>799,   'compare_price'=>999,   'discount_percent'=>20.02, 'stock'=>20, 'is_featured'=>false, 'tags'=>['lamp','lighting','modern'],   'photo'=>'photo-1507473885765-e6ed057f782c'],

        // ── Kitchen ────────────────────────────────────────────────────────────
        ['sku'=>'NCM-001',   'name'=>'Nespresso Vertuo Coffee Machine','category'=>'kitchen',            'price'=>1999,  'compare_price'=>2499,  'discount_percent'=>20.01, 'stock'=>18, 'is_featured'=>true,  'tags'=>['nespresso','coffee','machine'],'photo'=>'photo-1495474472287-4d71bcdd2085'],
        ['sku'=>'KAB-001',   'name'=>'KitchenAid Stand Mixer',      'category'=>'kitchen',               'price'=>3499,  'compare_price'=>4299,  'discount_percent'=>18.60, 'stock'=>8,  'is_featured'=>true,  'tags'=>['kitchenaid','mixer','baking'], 'photo'=>'photo-1585837575589-d5d3e0fc16f3'],
        ['sku'=>'DAF-001',   'name'=>'Digital Air Fryer 5.5L',      'category'=>'kitchen',               'price'=>899,   'compare_price'=>1299,  'discount_percent'=>30.79, 'stock'=>28, 'is_featured'=>false, 'tags'=>['airfryer','cooking','healthy'],'photo'=>'photo-1585951237318-9ea5e175b891'],

        // ── Fitness ────────────────────────────────────────────────────────────
        ['sku'=>'RBS-001',   'name'=>'Resistance Bands Set (5 pcs)','category'=>'fitness',               'price'=>249,   'compare_price'=>349,   'discount_percent'=>28.65, 'stock'=>90, 'is_featured'=>false, 'tags'=>['resistance','bands','fitness'],'photo'=>'photo-1598289431512-b97b0917affc'],
        ['sku'=>'ADW-001',   'name'=>'Adjustable Dumbbells 20kg',   'category'=>'fitness',               'price'=>1199,  'compare_price'=>1599,  'discount_percent'=>25.02, 'stock'=>22, 'is_featured'=>true,  'tags'=>['dumbbells','weights','gym'],   'photo'=>'photo-1583454110551-21f2fa2afe61'],
        ['sku'=>'JRS-001',   'name'=>'Professional Jump Rope',      'category'=>'fitness',               'price'=>149,   'compare_price'=>199,   'discount_percent'=>25.13, 'stock'=>120,'is_featured'=>false, 'tags'=>['jumprope','cardio','fitness'], 'photo'=>'photo-1599058945522-28d584b6f0ff'],

        // ── Fiction ────────────────────────────────────────────────────────────
        ['sku'=>'HP7-001',   'name'=>'Harry Potter Box Set (7 Books)','category'=>'fiction',             'price'=>599,   'compare_price'=>799,   'discount_percent'=>25.03, 'stock'=>50, 'is_featured'=>true,  'tags'=>['harry-potter','fantasy','books'],'photo'=>'photo-1589998059171-988d887df646'],
        ['sku'=>'ALC-001',   'name'=>'The Alchemist — Paulo Coelho','category'=>'fiction',               'price'=>89,    'compare_price'=>null,  'discount_percent'=>0,     'stock'=>150,'is_featured'=>false, 'tags'=>['book','fiction','coelho'],    'photo'=>'photo-1544947950-fa07a98d237f'],
        ['sku'=>'1984-001',  'name'=>'1984 — George Orwell',         'category'=>'fiction',              'price'=>79,    'compare_price'=>null,  'discount_percent'=>0,     'stock'=>180,'is_featured'=>false, 'tags'=>['orwell','dystopia','classic'], 'photo'=>'photo-1541963463532-d68292c34b19'],

        // ── Non-Fiction ────────────────────────────────────────────────────────
        ['sku'=>'AH-001',    'name'=>'Atomic Habits — James Clear',  'category'=>'non-fiction',          'price'=>129,   'compare_price'=>169,   'discount_percent'=>23.67, 'stock'=>200,'is_featured'=>true,  'tags'=>['habits','productivity','book'],'photo'=>'photo-1592496431122-2349e0fbc666'],
        ['sku'=>'TFS-001',   'name'=>'Thinking Fast and Slow',       'category'=>'non-fiction',          'price'=>119,   'compare_price'=>null,  'discount_percent'=>0,     'stock'=>130,'is_featured'=>false, 'tags'=>['psychology','kahneman','book'],'photo'=>'photo-1512820790803-83ca734da794'],

        // ── Skincare ───────────────────────────────────────────────────────────
        ['sku'=>'HAM-001',   'name'=>'Hyaluronic Acid Moisturizer', 'category'=>'skincare',              'price'=>299,   'compare_price'=>399,   'discount_percent'=>25.06, 'stock'=>70, 'is_featured'=>false, 'tags'=>['moisturizer','hyaluronic','skincare'],'photo'=>'photo-1556228578-8c89e6adf883'],
        ['sku'=>'RNC-001',   'name'=>'Retinol Night Cream',         'category'=>'skincare',              'price'=>449,   'compare_price'=>599,   'discount_percent'=>25.04, 'stock'=>55, 'is_featured'=>true,  'tags'=>['retinol','anti-aging','cream'], 'photo'=>'photo-1571781926291-c477ebfd024b'],
        ['sku'=>'SPF-001',   'name'=>'SPF 50+ Sunscreen Fluid',     'category'=>'skincare',              'price'=>199,   'compare_price'=>269,   'discount_percent'=>26.02, 'stock'=>95, 'is_featured'=>false, 'tags'=>['sunscreen','spf','protection'], 'photo'=>'photo-1556228720-195a672e8a03'],

        // ── Perfumes ───────────────────────────────────────────────────────────
        ['sku'=>'DSVG-001',  'name'=>'Dior Sauvage EDP 100ml',      'category'=>'perfumes',              'price'=>2299,  'compare_price'=>2799,  'discount_percent'=>17.86, 'stock'=>18, 'is_featured'=>true,  'tags'=>['dior','sauvage','men-perfume'], 'photo'=>'photo-1594035910387-fea47794261f'],
        ['sku'=>'YSLBO-001', 'name'=>'YSL Black Opium EDP 90ml',    'category'=>'perfumes',              'price'=>1999,  'compare_price'=>2499,  'discount_percent'=>20.01, 'stock'=>15, 'is_featured'=>true,  'tags'=>['ysl','blackopium','women-perfume'],'photo'=>'photo-1588776814546-1ffcf47267a5'],
        ['sku'=>'VERS-001',  'name'=>'Versace Eros EDT 100ml',       'category'=>'perfumes',              'price'=>1699,  'compare_price'=>1999,  'discount_percent'=>15.01, 'stock'=>20, 'is_featured'=>false, 'tags'=>['versace','eros','men-perfume'], 'photo'=>'photo-1619994121345-b61cd610c5a6'],

        // ── Toys ───────────────────────────────────────────────────────────────
        ['sku'=>'PS5C-001',  'name'=>'PS5 DualSense Controller',     'category'=>'toys',                 'price'=>699,   'compare_price'=>799,   'discount_percent'=>12.52, 'stock'=>40, 'is_featured'=>true,  'tags'=>['ps5','playstation','gaming'],  'photo'=>'photo-1606144042614-b2417e99c4e3'],
        ['sku'=>'RCC-001',   'name'=>'Remote Control Racing Car',    'category'=>'toys',                 'price'=>399,   'compare_price'=>549,   'discount_percent'=>27.32, 'stock'=>50, 'is_featured'=>false, 'tags'=>['rccar','kids','toy'],          'photo'=>'photo-1558618666-fcd25c85cd64'],
        ['sku'=>'UNO-001',   'name'=>'UNO Card Game Family Pack',    'category'=>'toys',                 'price'=>99,    'compare_price'=>null,  'discount_percent'=>0,     'stock'=>200,'is_featured'=>false, 'tags'=>['uno','cards','family'],        'photo'=>'photo-1606092195730-5d7b9af1efc5'],

        // ── Food & Drinks ──────────────────────────────────────────────────────
        ['sku'=>'JGT-001',   'name'=>'Japanese Matcha Green Tea',    'category'=>'food-drinks',          'price'=>249,   'compare_price'=>349,   'discount_percent'=>28.65, 'stock'=>100,'is_featured'=>false, 'tags'=>['matcha','tea','japanese'],     'photo'=>'photo-1556679343-c7306c1976bc'],
        ['sku'=>'HJS-001',   'name'=>'Organic Honey Jar Set',        'category'=>'food-drinks',          'price'=>199,   'compare_price'=>null,  'discount_percent'=>0,     'stock'=>80, 'is_featured'=>false, 'tags'=>['honey','organic','natural'],   'photo'=>'photo-1558642452-9d2a7deb7f62'],
        ['sku'=>'WPP-001',   'name'=>'Whey Protein Powder 1kg',      'category'=>'food-drinks',          'price'=>499,   'compare_price'=>649,   'discount_percent'=>23.11, 'stock'=>60, 'is_featured'=>true,  'tags'=>['protein','whey','fitness'],    'photo'=>'photo-1593095948071-474c5cc2989d'],

        // ── Outdoor ────────────────────────────────────────────────────────────
        ['sku'=>'CPT-001',   'name'=>'4-Person Camping Tent',        'category'=>'outdoor',              'price'=>1499,  'compare_price'=>1999,  'discount_percent'=>25.01, 'stock'=>16, 'is_featured'=>true,  'tags'=>['tent','camping','outdoor'],    'photo'=>'photo-1537225228614-56cc3556d7ed'],
        ['sku'=>'HBP-001',   'name'=>'65L Hiking Backpack',          'category'=>'outdoor',              'price'=>899,   'compare_price'=>1199,  'discount_percent'=>25.02, 'stock'=>25, 'is_featured'=>false, 'tags'=>['backpack','hiking','outdoor'], 'photo'=>'photo-1501554728187-ce583db33af7'],
        ['sku'=>'TRP-001',   'name'=>'Trekking Poles Carbon',        'category'=>'outdoor',              'price'=>549,   'compare_price'=>749,   'discount_percent'=>26.70, 'stock'=>30, 'is_featured'=>false, 'tags'=>['trekking','poles','hiking'],   'photo'=>'photo-1486915309851-b0cc1f8a0084'],
    ];

    public function run(): void
    {
        $seller = User::where('role', 'seller')->first();

        foreach ($this->products as $data) {
            if (Product::where('sku', $data['sku'])->exists()) {
                continue;
            }

            $category = Category::where('slug', $data['category'])->first();
            $sku      = $data['sku'];
            $tags     = $data['tags'];

            unset($data['category'], $data['photo'], $data['tags']);

            $product = Product::create(array_merge($data, [
                'slug'            => Str::slug($data['name']) . '-' . Str::random(5),
                'description'     => $data['name'] . ' — premium quality product.',
                'category_id'     => $category?->id,
                'seller_id'       => $seller->id,
                'is_active'       => true,
                'low_stock_alert' => 5,
                'weight'          => rand(100, 5000) / 100,
            ]));

            foreach ($tags as $tag) {
                ProductTag::create(['product_id' => $product->id, 'tag' => $tag]);
            }

            // Use committed image file — no download needed
            $imgPath = 'products/' . $sku . '.jpg';
            if (file_exists(storage_path('app/public/' . $imgPath))) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $imgPath,
                    'is_primary' => true,
                    'sort_order' => 0,
                ]);
            }
        }

        $this->command->info('Done. Total products: ' . Product::count());
    }
}
