<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Review;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ShopTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function product(array $attrs = []): Product
    {
        static $n = 0;
        $n++;
        return Product::create(array_merge([
            'name' => "Product $n", 'slug' => "product-$n", 'price' => 100, 'stock' => 10, 'is_active' => true,
        ], $attrs));
    }

    /** Creates a client with one cart item (100 MAD), an address and free shipping. */
    private function checkoutReady(): array
    {
        $user = User::factory()->create(['role' => 'client']);
        $product = $this->product();
        Cart::create(['user_id' => $user->id])->items()->create([
            'product_id' => $product->id, 'quantity' => 1, 'price' => 100,
        ]);
        $address = Address::create([
            'user_id' => $user->id, 'full_name' => 'Test', 'phone' => '0600000000',
            'address_line1' => '1 rue Test', 'city' => 'Rabat', 'country' => 'Morocco',
        ]);
        $shipping = ShippingMethod::create(['name' => 'Free', 'price' => 0]);
        Sanctum::actingAs($user);

        return [$user, $product, ['address_id' => $address->id, 'shipping_method_id' => $shipping->id]];
    }

    public function test_guest_cannot_modify_another_guests_cart_item(): void
    {
        $product = $this->product();
        $itemId = $this->withHeader('X-Session-ID', 'guest-a')
            ->postJson('/api/v1/cart/add', ['product_id' => $product->id, 'quantity' => 1])
            ->assertOk()->json('data.items.0.id');

        $this->withHeader('X-Session-ID', 'guest-b')
            ->putJson("/api/v1/cart/items/$itemId", ['quantity' => 3])->assertNotFound();
        $this->withHeader('X-Session-ID', 'guest-b')
            ->deleteJson("/api/v1/cart/items/$itemId")->assertNotFound();

        $this->withHeader('X-Session-ID', 'guest-a')
            ->putJson("/api/v1/cart/items/$itemId", ['quantity' => 2])
            ->assertOk()->assertJsonPath('data.items.0.quantity', 2);
    }

    public function test_paypal_reference_alone_does_not_mark_order_paid(): void
    {
        config(['services.paypal.client_id' => null, 'services.paypal.secret' => null]);
        [, , $ids] = $this->checkoutReady();

        $this->postJson('/api/v1/orders', $ids + ['payment_method' => 'paypal', 'payment_reference' => 'FAKE-123'])
            ->assertCreated()->assertJsonPath('data.payment_status', 'pending');
    }

    public function test_verified_paypal_capture_marks_order_paid(): void
    {
        config(['services.paypal.client_id' => 'id', 'services.paypal.secret' => 'secret', 'services.paypal.mad_to_usd' => 10]);
        Http::fake([
            '*/v1/oauth2/token' => Http::response(['access_token' => 'tok']),
            // 100 MAD + 20% tax = 120 MAD = 12.00 USD
            '*/v2/checkout/orders/*' => Http::response([
                'status' => 'COMPLETED',
                'purchase_units' => [['amount' => ['currency_code' => 'USD', 'value' => '12.00']]],
            ]),
        ]);
        [, , $ids] = $this->checkoutReady();

        $this->postJson('/api/v1/orders', $ids + ['payment_method' => 'paypal', 'payment_reference' => 'PP-OK'])
            ->assertCreated()->assertJsonPath('data.payment_status', 'paid');
    }

    public function test_stripe_card_payment_is_verified_before_order_is_paid(): void
    {
        config(['services.stripe.secret' => 'sk_test_x', 'services.stripe.currency' => 'mad']);
        [$user, , $ids] = $this->checkoutReady();

        Http::fake([
            'api.stripe.com/v1/payment_intents' => Http::response(['id' => 'pi_123', 'client_secret' => 'pi_123_secret']),
            // 100 MAD + 20% tax = 120 MAD = 12000 centimes
            'api.stripe.com/v1/payment_intents/pi_123' => Http::response([
                'id' => 'pi_123', 'status' => 'succeeded', 'amount_received' => 12000, 'currency' => 'mad',
                'metadata' => ['user_id' => (string) $user->id],
            ]),
        ]);

        $this->postJson('/api/v1/checkout/stripe-intent', ['shipping_method_id' => $ids['shipping_method_id']])
            ->assertOk()->assertJsonPath('client_secret', 'pi_123_secret')->assertJsonPath('amount', 120);
        Http::assertSent(fn ($r) => $r->url() === 'https://api.stripe.com/v1/payment_intents' && $r['amount'] == 12000 && $r['currency'] === 'mad');

        $this->postJson('/api/v1/orders', $ids + ['payment_method' => 'card', 'payment_reference' => 'pi_123'])
            ->assertCreated()->assertJsonPath('data.payment_status', 'paid');
    }

    public function test_stripe_rejects_unpaid_or_wrong_amount_or_foreign_intents(): void
    {
        config(['services.stripe.secret' => 'sk_test_x']);
        [$user, $product, $ids] = $this->checkoutReady();
        Http::fake([
            'api.stripe.com/v1/payment_intents/pi_cheap' => Http::response(['status' => 'succeeded', 'amount_received' => 100, 'currency' => 'mad', 'metadata' => ['user_id' => (string) $user->id]]),
            'api.stripe.com/v1/payment_intents/pi_other' => Http::response(['status' => 'succeeded', 'amount_received' => 12000, 'currency' => 'mad', 'metadata' => ['user_id' => '999']]),
            'api.stripe.com/v1/payment_intents/pi_unpaid' => Http::response(['status' => 'requires_payment_method', 'amount_received' => 0, 'currency' => 'mad', 'metadata' => ['user_id' => (string) $user->id]]),
        ]);

        foreach (['pi_cheap', 'pi_other', 'pi_unpaid', null] as $ref) {
            $this->postJson('/api/v1/orders', $ids + ['payment_method' => 'card', 'payment_reference' => $ref])->assertStatus(422);
        }
        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_card_checkout_runs_in_demo_mode_without_stripe(): void
    {
        config(['services.stripe.secret' => null]);
        [, , $ids] = $this->checkoutReady();

        $this->postJson('/api/v1/checkout/stripe-intent', ['shipping_method_id' => $ids['shipping_method_id']])->assertStatus(503);
        $this->postJson('/api/v1/orders', $ids + ['payment_method' => 'card'])
            ->assertCreated()->assertJsonPath('data.payment_status', 'pending');
    }

    public function test_api_messages_follow_the_request_language(): void
    {
        $this->withHeader('X-Session-ID', 's')->withHeader('Accept-Language', 'fr')
            ->postJson('/api/v1/cart/coupon', ['code' => 'NOPE'])->assertJsonPath('message', 'Code coupon invalide.');
        $this->withHeader('X-Session-ID', 's')->withHeader('Accept-Language', 'en')
            ->postJson('/api/v1/cart/coupon', ['code' => 'NOPE'])->assertJsonPath('message', 'Invalid coupon code.');
    }

    public function test_paypal_amount_mismatch_is_rejected(): void
    {
        config(['services.paypal.client_id' => 'id', 'services.paypal.secret' => 'secret']);
        Http::fake([
            '*/v1/oauth2/token' => Http::response(['access_token' => 'tok']),
            '*/v2/checkout/orders/*' => Http::response([
                'status' => 'COMPLETED',
                'purchase_units' => [['amount' => ['currency_code' => 'USD', 'value' => '0.01']]],
            ]),
        ]);
        [, $product, $ids] = $this->checkoutReady();

        $this->postJson('/api/v1/orders', $ids + ['payment_method' => 'paypal', 'payment_reference' => 'PP-CHEAP'])
            ->assertStatus(422);
        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_paypal_reference_cannot_be_reused(): void
    {
        [$user, , $ids] = $this->checkoutReady();
        Order::create([
            'order_number' => 'ORD-OLD', 'user_id' => $user->id, 'status' => 'confirmed', 'payment_status' => 'paid',
            'payment_method' => 'paypal', 'payment_reference' => 'PP-USED',
            'subtotal' => 100, 'discount_amount' => 0, 'shipping_amount' => 0, 'tax_amount' => 20, 'total' => 120,
        ]);

        $this->postJson('/api/v1/orders', $ids + ['payment_method' => 'paypal', 'payment_reference' => 'PP-USED'])
            ->assertStatus(422);
    }

    public function test_coupon_preview_matches_order_discount(): void
    {
        Coupon::create(['code' => 'WELCOME10', 'type' => 'percent', 'value' => 10]);
        [, , $ids] = $this->checkoutReady();

        $this->postJson('/api/v1/cart/coupon', ['code' => 'welcome10'])->assertOk()->assertJsonPath('discount', 10);

        // (100 - 10) * 1.2 = 108
        $order = $this->postJson('/api/v1/orders', $ids + ['payment_method' => 'card', 'coupon_code' => 'WELCOME10'])
            ->assertCreated();
        $this->assertEquals(10, $order->json('data.discount_amount'));
        $this->assertEquals(108, $order->json('data.total'));
    }

    public function test_rating_breakdown_counts_all_reviews(): void
    {
        $product = $this->product();
        foreach (range(1, 12) as $i) {
            Review::create([
                'user_id' => User::factory()->create()->id, 'product_id' => $product->id,
                'rating' => $i <= 11 ? 5 : 1, 'comment' => 'ok', 'is_approved' => true,
            ]);
        }

        $this->getJson("/api/v1/products/{$product->slug}")
            ->assertOk()
            ->assertJsonPath('data.rating_breakdown.5', 11)
            ->assertJsonPath('data.rating_breakdown.1', 1)
            ->assertJsonPath('data.average_rating', 4.7);
    }

    public function test_password_reset_flow_links_to_frontend_and_resets(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/v1/forgot-password', ['email' => $user->email])->assertOk();

        $token = null;
        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $n) use ($user, &$token) {
            $token = $n->token;
            $url = $n->toMail($user)->actionUrl;
            return str_starts_with($url, config('app.frontend_url') . '/reset-password?token=');
        });

        $this->postJson('/api/v1/reset-password', [
            'token' => $token, 'email' => $user->email, 'password' => 'new-password', 'password_confirmation' => 'new-password',
        ])->assertOk();
        $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'new-password'])->assertOk();
    }

    public function test_public_seller_profile_hides_private_details(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $this->product(['seller_id' => $seller->id]);

        $this->getJson("/api/v1/sellers/{$seller->id}")
            ->assertOk()
            ->assertJsonPath('data.name', $seller->name)
            ->assertJsonPath('data.products_count', 1)
            ->assertJsonMissingPath('data.email');

        $client = User::factory()->create(['role' => 'client']);
        $this->getJson("/api/v1/sellers/{$client->id}")->assertNotFound();
    }

    public function test_seller_cannot_handle_returns_for_other_sellers_products(): void
    {
        $owner = User::factory()->create(['role' => 'seller']);
        $other = User::factory()->create(['role' => 'seller']);
        $client = User::factory()->create(['role' => 'client']);
        $product = $this->product(['seller_id' => $owner->id]);
        $order = Order::create([
            'order_number' => 'ORD-RET', 'user_id' => $client->id, 'status' => 'delivered', 'payment_status' => 'paid',
            'subtotal' => 100, 'discount_amount' => 0, 'shipping_amount' => 0, 'tax_amount' => 20, 'total' => 120,
        ]);
        $order->items()->create(['product_id' => $product->id, 'product_name' => $product->name, 'quantity' => 1, 'price' => 100, 'total' => 100]);
        $return = \App\Models\ReturnRequest::create(['order_id' => $order->id, 'user_id' => $client->id, 'reason' => 'defective', 'status' => 'pending']);

        Sanctum::actingAs($other);
        $this->patchJson("/api/v1/seller/returns/{$return->id}", ['status' => 'approved'])->assertForbidden();

        Sanctum::actingAs($owner);
        $this->patchJson("/api/v1/seller/returns/{$return->id}", ['status' => 'approved'])->assertOk();
    }

    public function test_invoices_are_private_and_only_for_the_owner(): void
    {
        Storage::fake('local');
        [$user, , $ids] = $this->checkoutReady();
        $orderId = $this->postJson('/api/v1/orders', $ids + ['payment_method' => 'card'])->assertCreated()->json('data.id');
        $order = Order::find($orderId);

        Storage::disk('local')->assertExists($order->invoice_path);
        Storage::disk('public')->assertMissing($order->invoice_path);
        $this->get("/api/v1/orders/{$orderId}/invoice")->assertOk();

        Sanctum::actingAs(User::factory()->create(['role' => 'client']));
        $this->getJson("/api/v1/orders/{$orderId}/invoice")->assertForbidden();
    }

    public function test_deactivating_a_user_revokes_their_tokens_and_admin_cannot_lock_self_out(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $client = User::factory()->create(['role' => 'client']);
        $client->createToken('t');

        Sanctum::actingAs($admin);
        $this->putJson("/api/v1/admin/users/{$client->id}", ['is_active' => false])->assertOk();
        $this->assertSame(0, $client->tokens()->count());

        $this->putJson("/api/v1/admin/users/{$admin->id}", ['is_active' => false])->assertStatus(422);
        $this->putJson("/api/v1/admin/users/{$admin->id}", ['role' => 'client'])->assertStatus(422);
    }

    public function test_review_edits_need_re_approval_and_order_must_belong_to_reviewer(): void
    {
        $user = User::factory()->create();
        $stranger = User::factory()->create();
        $product = $this->product();
        $foreignOrder = Order::create([
            'order_number' => 'ORD-X', 'user_id' => $stranger->id, 'status' => 'delivered', 'payment_status' => 'paid',
            'subtotal' => 1, 'discount_amount' => 0, 'shipping_amount' => 0, 'tax_amount' => 0, 'total' => 1,
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/reviews', ['product_id' => $product->id, 'order_id' => $foreignOrder->id, 'rating' => 5])
            ->assertStatus(422);

        $review = Review::create(['user_id' => $user->id, 'product_id' => $product->id, 'rating' => 5, 'is_approved' => true]);
        $this->putJson("/api/v1/reviews/{$review->id}", ['comment' => 'edited'])->assertOk();
        $this->assertFalse($review->fresh()->is_approved);
    }

    public function test_seller_orders_only_show_the_sellers_own_items(): void
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $otherSeller = User::factory()->create(['role' => 'seller']);
        $client = User::factory()->create(['role' => 'client']);
        $mine = $this->product(['seller_id' => $seller->id]);
        $theirs = $this->product(['seller_id' => $otherSeller->id]);
        $order = Order::create([
            'order_number' => 'ORD-MIX', 'user_id' => $client->id, 'status' => 'confirmed', 'payment_status' => 'paid',
            'subtotal' => 200, 'discount_amount' => 0, 'shipping_amount' => 0, 'tax_amount' => 40, 'total' => 240,
        ]);
        foreach ([$mine, $theirs] as $p) {
            $order->items()->create(['product_id' => $p->id, 'product_name' => $p->name, 'quantity' => 1, 'price' => 100, 'total' => 100]);
        }

        Sanctum::actingAs($seller);
        $this->getJson('/api/v1/seller/orders')
            ->assertOk()
            ->assertJsonCount(1, 'data.0.items')
            ->assertJsonPath('data.0.items.0.product_id', $mine->id);
    }

    public function test_api_responses_include_security_headers(): void
    {
        $this->getJson('/api/v1/categories')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY');
    }

    public function test_product_listing_query_count_does_not_grow_with_page_size(): void
    {
        foreach (range(1, 20) as $i) {
            $p = $this->product();
            ProductImage::create(['product_id' => $p->id, 'image_path' => "products/$i.jpg", 'is_primary' => true, 'sort_order' => 0]);
        }

        DB::enableQueryLog();
        $res = $this->getJson('/api/v1/products?per_page=20')->assertOk();
        $this->assertCount(20, $res->json('data'));
        // Every product resolves its own image (none fall back to the placeholder).
        $urls = collect($res->json('data'))->pluck('primary_image_url');
        $this->assertCount(20, $urls->unique());
        $this->assertFalse($urls->contains(fn ($u) => str_contains($u, 'placeholder')));
        $this->assertLessThan(10, count(DB::getQueryLog()), 'Product listing should not issue per-product queries');
    }
}
