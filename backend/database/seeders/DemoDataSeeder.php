<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ReturnRequest;
use App\Models\Review;
use App\Models\SellerDocument;
use App\Models\ShippingMethod;
use App\Models\User;
use App\Models\Wishlist;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/**
 * Realistic demo data so every screen (storefront, client, seller, admin) has something to show.
 * Deterministic: the same data is produced on every fresh seed.
 */
class DemoDataSeeder extends Seeder
{
    private const SELLERS = [
        // name, email, parent category slugs they sell in
        ['Maison Fès Déco',      'maison@ecommerce.com', ['home-garden']],
        ['Marrakech Mode',       'mode@ecommerce.com',   ['clothing', 'beauty']],
        ['Rabat Sport & Livres', 'sport@ecommerce.com',  ['sports', 'books', 'food-drinks']],
    ];

    private const CLIENTS = [
        ['Youssef Benali', 'Casablanca'], ['Fatima Zahra El Idrissi', 'Rabat'], ['Omar Kettani', 'Fès'],
        ['Salma Berrada', 'Marrakech'], ['Mehdi Alaoui', 'Tanger'], ['Imane Chraibi', 'Agadir'],
        ['Hamza Tazi', 'Meknès'], ['Nadia Bennani', 'Oujda'], ['Karim Lahlou', 'Kénitra'],
        ['Sara Ouazzani', 'Tétouan'], ['Anas Fassi', 'Casablanca'],
    ];

    private const REVIEW_TEXT = [
        5 => [['Excellent !', 'Exactly as described, fast delivery. Highly recommended.'], ['Parfait', 'Très bonne qualité, je recommande vivement.'], ['Love it', 'Great value for the price, I would buy again.']],
        4 => [['Very good', 'Good product, packaging could be better.'], ['Très bien', 'Conforme à la description, livraison un peu lente.']],
        3 => [['Correct', 'Does the job, nothing special.'], ['Average', 'OK for the price but expected a bit more.']],
        2 => [['Disappointed', 'Quality is lower than in the photos.']],
        1 => [['Not good', 'Stopped working after a week, had to ask for a return.']],
    ];

    public function run(): void
    {
        mt_srand(42);
        Storage::disk('local')->makeDirectory('seller-documents');

        $this->attachMissingImages();
        $sellers = $this->createSellers();
        $this->distributeProducts($sellers);
        $clients = $this->createClients();
        $this->tuneCatalog();
        $orders = $this->createOrders($clients);
        $this->createReviews($orders);
        $this->createReturns($orders);
        $this->createWishlistsAndCart($clients);
        $this->createSellerDocuments($sellers);

        $this->command->info(sprintf(
            'Demo data: %d users, %d products, %d orders, %d reviews, %d returns.',
            User::count(), Product::count(), Order::count(), Review::count(), ReturnRequest::count()
        ));
    }

    /** Products from ProductSeeder have committed images in storage but no image rows. */
    private function attachMissingImages(): void
    {
        Product::doesntHave('images')->get()->each(function (Product $p) {
            $path = "products/{$p->sku}.jpg";
            if ($p->sku && Storage::disk('public')->exists($path)) {
                ProductImage::create(['product_id' => $p->id, 'image_path' => $path, 'is_primary' => true, 'sort_order' => 0]);
            }
        });
    }

    private function createSellers(): array
    {
        $sellers = ['electronics' => User::where('email', 'seller@ecommerce.com')->first()];
        foreach (self::SELLERS as $i => [$name, $email, $cats]) {
            $user = User::create([
                'name' => $name, 'email' => $email, 'password' => Hash::make('password'),
                'role' => 'seller', 'phone' => '+21266100000' . ($i + 1), 'is_active' => true, 'preferred_language' => 'fr',
            ]);
            $this->backdate($user, now()->subDays(200 - $i * 20));
            foreach ($cats as $cat) {
                $sellers[$cat] = $user;
            }
        }
        return $sellers;
    }

    /** Give each seller the products of their categories (Seller Demo keeps electronics, toys, the rest). */
    private function distributeProducts(array $sellers): void
    {
        Product::with('category')->get()->each(function (Product $p) use ($sellers) {
            $parent = $p->category?->parent_id ? Category::find($p->category->parent_id)?->slug : $p->category?->slug;
            if ($parent && isset($sellers[$parent])) {
                $p->update(['seller_id' => $sellers[$parent]->id]);
            }
        });
    }

    private function createClients(): array
    {
        $clients = [User::where('email', 'client@ecommerce.com')->first()];
        foreach (self::CLIENTS as $i => [$name, $city]) {
            $email = strtolower(str_replace(' ', '.', $name)) . '@example.com';
            $user = User::create([
                'name' => $name, 'email' => $email, 'password' => Hash::make('password'), 'role' => 'client',
                'phone' => '+2126' . str_pad((string) (20000000 + $i * 1234567), 8, '0'), 'is_active' => $i !== 10,
                'preferred_language' => $i % 3 === 0 ? 'en' : 'fr',
            ]);
            // Spread sign-ups over 6 months, with a few in the last 30 days for the growth chart.
            $this->backdate($user, now()->subDays($i < 4 ? mt_rand(2, 28) : mt_rand(35, 180)));
            $clients[] = $user;
        }

        foreach ($clients as $i => $client) {
            $city = self::CLIENTS[$i - 1][1] ?? 'Casablanca';
            Address::create([
                'user_id' => $client->id, 'full_name' => $client->name, 'phone' => $client->phone ?? '+212600000003',
                'address_line1' => mt_rand(1, 250) . ' ' . ['Bd Mohammed V', 'Av. Hassan II', 'Rue Ibn Battouta', 'Av. des FAR', 'Rue Allal Ben Abdellah'][$i % 5],
                'city' => $city, 'postal_code' => (string) mt_rand(10000, 90000), 'country' => 'Morocco', 'is_default' => true,
            ]);
        }
        Address::create([
            'user_id' => $clients[0]->id, 'full_name' => $clients[0]->name, 'phone' => '+212600000003',
            'address_line1' => '12 Rue de la Liberté', 'address_line2' => 'Bureau 4', 'city' => 'Rabat',
            'postal_code' => '10000', 'country' => 'Morocco', 'is_default' => false,
        ]);

        return $clients;
    }

    /** Views for the "popular" sort, plus a few low-stock / out-of-stock items for the dashboards. */
    private function tuneCatalog(): void
    {
        Product::all()->each(fn (Product $p) => $p->update(['views' => mt_rand(20, 2500)]));
        Product::inRandomOrder(7)->limit(3)->get()->each(fn (Product $p) => $p->update(['stock' => 0]));
        Product::where('stock', '>', 0)->inRandomOrder(8)->limit(4)->get()->each(fn (Product $p) => $p->update(['stock' => mt_rand(1, 4)]));
    }

    private function createOrders(array $clients): array
    {
        $products = Product::with('images')->where('is_active', true)->get();
        $shipping = ShippingMethod::all();
        $coupons = Coupon::all();
        $orders = [];

        for ($n = 0; $n < 64; $n++) {
            $client = $clients[$n % count($clients)];
            // Denser activity in recent weeks.
            $daysAgo = (int) round(180 * (mt_rand(0, 1000) / 1000) ** 1.6);
            $createdAt = now()->subDays($daysAgo)->setTime(mt_rand(8, 22), mt_rand(0, 59));
            $status = $this->statusFor($daysAgo, $n);
            $method = $shipping[$n % $shipping->count()];

            $lines = $products->random(mt_rand(1, 3));
            $subtotal = 0;
            $rows = [];
            foreach ($lines as $p) {
                $qty = $p->final_price > 3000 ? 1 : mt_rand(1, 3);
                $rows[] = [$p, $qty];
                $subtotal += $p->final_price * $qty;
            }

            $coupon = $n % 6 === 0 ? $coupons[$n % $coupons->count()] : null;
            $discount = $coupon && $coupon->isValid($subtotal) ? $coupon->calculateDiscount($subtotal) : 0;
            if (!$discount) {
                $coupon = null;
            }
            $taxable = $subtotal - $discount + (float) $method->price;
            $tax = round($taxable * 0.2, 2);
            $paid = !in_array($status, ['pending', 'cancelled'], true);
            $paymentMethod = $n % 3 === 0 ? 'paypal' : 'card';

            $order = Order::create([
                'order_number' => sprintf('ORD-%s-%03d', $createdAt->format('ymd'), $n + 1),
                'user_id' => $client->id,
                'address_id' => $client->addresses()->value('id'),
                'shipping_method_id' => $method->id,
                'status' => $status,
                'payment_status' => $status === 'refunded' ? 'refunded' : ($paid ? 'paid' : 'pending'),
                'payment_method' => $paymentMethod,
                'payment_reference' => $paid && $paymentMethod === 'paypal' ? 'DEMO-PP-' . strtoupper(substr(md5((string) $n), 0, 12)) : null,
                'subtotal' => round($subtotal, 2), 'discount_amount' => $discount, 'shipping_amount' => $method->price,
                'tax_amount' => $tax, 'total' => round($taxable + $tax, 2),
                'notes' => $n % 9 === 0 ? 'Merci de livrer après 18h.' : null,
                'paid_at' => $paid ? $createdAt->copy()->addMinutes(2) : null,
                'shipped_at' => in_array($status, ['shipped', 'delivered', 'refunded'], true) ? $createdAt->copy()->addDays(1) : null,
                'delivered_at' => in_array($status, ['delivered', 'refunded'], true) ? $createdAt->copy()->addDays(mt_rand(2, 5)) : null,
            ]);
            $this->backdate($order, $createdAt);

            foreach ($rows as [$p, $qty]) {
                $item = OrderItem::create([
                    'order_id' => $order->id, 'product_id' => $p->id, 'product_name' => $p->name,
                    'product_image' => $p->primary_image_url, 'quantity' => $qty, 'price' => $p->final_price,
                    'discount_percent' => $p->discount_percent, 'total' => round($p->final_price * $qty, 2),
                ]);
                $this->backdate($item, $createdAt);
            }
            $coupon?->increment('used_count');
            $orders[] = $order;
        }

        return $orders;
    }

    private function statusFor(int $daysAgo, int $n): string
    {
        if ($n % 11 === 5) {
            return 'cancelled';
        }
        if ($daysAgo > 14) {
            return $n % 17 === 3 ? 'refunded' : 'delivered';
        }
        return ['pending', 'confirmed', 'processing', 'shipped', 'delivered'][min(4, intdiv($daysAgo, 3))];
    }

    private function createReviews(array $orders): void
    {
        $seen = [];
        foreach ($orders as $order) {
            if (!in_array($order->status, ['delivered', 'refunded'], true)) {
                continue;
            }
            foreach ($order->items as $i => $item) {
                $key = $order->user_id . '-' . $item->product_id;
                if (isset($seen[$key]) || ($i + $order->id) % 4 === 3) {
                    continue; // not every buyer leaves a review
                }
                $seen[$key] = true;
                $rating = [5, 5, 5, 4, 4, 4, 3, 2, 5, 1][mt_rand(0, 9)];
                [$title, $comment] = self::REVIEW_TEXT[$rating][mt_rand(0, count(self::REVIEW_TEXT[$rating]) - 1)];
                $review = Review::create([
                    'user_id' => $order->user_id, 'product_id' => $item->product_id, 'order_id' => $order->id,
                    'rating' => $rating, 'title' => $title, 'comment' => $comment,
                    'is_approved' => $order->id % 7 !== 0, // a few awaiting moderation
                ]);
                $this->backdate($review, Carbon::parse($order->delivered_at ?? $order->created_at)->addDays(mt_rand(1, 6)));
            }
        }
    }

    private function createReturns(array $orders): void
    {
        $reasons = [
            ['defective', 'The item stopped working after two days.'],
            ['wrong_item', 'I received a different color than the one I ordered.'],
            ['not_as_described', 'The size does not match the description.'],
            ['changed_mind', 'Je n\'en ai finalement plus besoin, article non ouvert.'],
            ['damaged', 'Le colis est arrivé abîmé, l\'écran est rayé.'],
        ];
        $delivered = collect($orders)->whereIn('status', ['delivered', 'refunded'])->values();
        foreach ($delivered->take(7) as $i => $order) {
            [$reason, $text] = $reasons[$i % count($reasons)];
            $status = $order->status === 'refunded' ? 'approved' : ['pending', 'pending', 'approved', 'rejected'][$i % 4];
            $ret = ReturnRequest::create([
                'order_id' => $order->id, 'order_item_id' => $order->items->first()->id, 'user_id' => $order->user_id,
                'reason' => $reason, 'description' => $text, 'status' => $status,
                'admin_notes' => $status === 'rejected' ? 'Return window exceeded.' : null,
            ]);
            $this->backdate($ret, Carbon::parse($order->delivered_at ?? $order->created_at)->addDays(2));
        }
    }

    private function createWishlistsAndCart(array $clients): void
    {
        foreach ($clients as $client) {
            Product::where('is_active', true)->inRandomOrder($client->id)->limit(mt_rand(2, 6))->pluck('id')
                ->each(fn ($id) => Wishlist::create(['user_id' => $client->id, 'product_id' => $id]));
        }

        // Client Demo has something in the cart, ready to check out.
        $cart = Cart::create(['user_id' => $clients[0]->id]);
        Product::where('is_active', true)->where('stock', '>', 5)->inRandomOrder(3)->limit(2)->get()
            ->each(fn (Product $p) => $cart->items()->create(['product_id' => $p->id, 'quantity' => 1, 'price' => $p->final_price]));
    }

    private function createSellerDocuments(array $sellers): void
    {
        foreach (collect($sellers)->unique('id')->values() as $i => $seller) {
            foreach (['business_registration' => 'Registre de Commerce', 'national_id' => "Carte d'identité"] as $type => $label) {
                $path = "seller-documents/{$seller->id}-{$type}.pdf";
                $html = "<h2>{$label}</h2><p>Document de démonstration — {$seller->name}</p><p>Ce fichier a été généré pour les données de test.</p>";
                Storage::disk('local')->put($path, Pdf::loadHTML($html)->output());
                SellerDocument::create([
                    'user_id' => $seller->id, 'type' => $type, 'file_path' => $path,
                    'status' => $i === 3 ? 'pending' : ($type === 'national_id' && $i === 2 ? 'rejected' : 'approved'),
                ]);
            }
        }
    }

    private function backdate($model, Carbon $at): void
    {
        $model->timestamps = false;
        $model->forceFill(['created_at' => $at, 'updated_at' => $at])->save();
        $model->timestamps = true;
    }
}
