<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Coupon;
use App\Models\ShippingMethod;

/**
 * Single source of truth for order totals. Used both to create the Stripe payment
 * and to create the order, so the amount charged always equals the order total.
 */
class CheckoutPricing
{
    public const TAX_RATE = 0.20;

    /**
     * @return array{subtotal: float, discount: float, shipping: float, tax: float, total: float, coupon: ?Coupon}
     */
    public function quote(Cart $cart, ShippingMethod $shipping, ?string $couponCode = null): array
    {
        $subtotal = round((float) $cart->items->sum(fn ($i) => $i->price * $i->quantity), 2);

        $coupon = null;
        $discount = 0.0;
        if ($couponCode) {
            $candidate = Coupon::where('code', strtoupper($couponCode))->first();
            if ($candidate && $candidate->isValid($subtotal)) {
                $coupon = $candidate;
                $discount = $candidate->calculateDiscount($subtotal);
            }
        }

        $shippingAmount = (float) $shipping->price;
        $taxable = $subtotal - $discount + $shippingAmount;
        $tax = round($taxable * self::TAX_RATE, 2);

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'shipping' => $shippingAmount,
            'tax'      => $tax,
            'total'    => round($taxable + $tax, 2),
            'coupon'   => $coupon,
        ];
    }
}
