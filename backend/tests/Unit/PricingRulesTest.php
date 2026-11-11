<?php

namespace Tests\Unit;

use App\Models\Coupon;
use App\Models\Product;
use Tests\TestCase;

/** Pure business rules — no database needed. */
class PricingRulesTest extends TestCase
{
    private function coupon(array $attrs): Coupon
    {
        return (new Coupon)->forceFill(array_merge([
            'code' => 'TEST', 'type' => 'percent', 'value' => 10, 'min_order_amount' => 0,
            'max_uses' => null, 'used_count' => 0, 'expires_at' => null, 'is_active' => true,
        ], $attrs));
    }

    public function test_percent_coupon_discount_is_rounded_to_cents(): void
    {
        $this->assertSame(33.33, $this->coupon(['value' => 10])->calculateDiscount(333.33));
    }

    public function test_fixed_coupon_never_exceeds_the_order_amount(): void
    {
        $this->assertSame(50.0, $this->coupon(['type' => 'fixed', 'value' => 50])->calculateDiscount(200));
        $this->assertSame(30.0, $this->coupon(['type' => 'fixed', 'value' => 50])->calculateDiscount(30));
    }

    public function test_coupon_validity_rules(): void
    {
        $this->assertTrue($this->coupon([])->isValid(100));
        $this->assertFalse($this->coupon(['is_active' => false])->isValid(100), 'inactive');
        $this->assertFalse($this->coupon(['expires_at' => now()->subDay()])->isValid(100), 'expired');
        $this->assertTrue($this->coupon(['expires_at' => now()->addDay()])->isValid(100), 'not yet expired');
        $this->assertFalse($this->coupon(['max_uses' => 5, 'used_count' => 5])->isValid(100), 'used up');
        $this->assertFalse($this->coupon(['min_order_amount' => 500])->isValid(499.99), 'below minimum');
        $this->assertTrue($this->coupon(['min_order_amount' => 500])->isValid(500), 'at minimum');
    }

    public function test_product_final_price_applies_the_discount(): void
    {
        $this->assertSame(80.0, (new Product)->forceFill(['price' => 100, 'discount_percent' => 20])->final_price);
        $this->assertSame(2848.19, (new Product)->forceFill(['price' => 3499, 'discount_percent' => 18.6])->final_price);
        $this->assertSame(100.0, (new Product)->forceFill(['price' => 100, 'discount_percent' => 0])->final_price);
    }
}
