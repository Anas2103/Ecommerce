<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Mail\OrderConfirmed;
use App\Mail\OrderStatusUpdated;
use App\Services\CheckoutPricing;
use App\Services\PayPalVerifier;
use App\Services\StripeGateway;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    /**
     * Creates a Stripe PaymentIntent for the current cart total. The browser confirms the
     * card with Stripe, then places the order with the intent id as payment_reference.
     */
    public function stripeIntent(Request $request, CheckoutPricing $pricing, StripeGateway $stripe)
    {
        if (!$stripe->isConfigured()) {
            return response()->json(['message' => __('Card payments are not configured.')], 503);
        }

        $data = $request->validate([
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'coupon_code'        => 'nullable|string',
        ]);

        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->with('items')->first();
        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => __('Your cart is empty.')], 422);
        }

        $quote = $pricing->quote($cart, ShippingMethod::findOrFail($data['shipping_method_id']), $data['coupon_code'] ?? null);

        try {
            $intent = $stripe->createIntent($quote['total'], $user->id);
        } catch (\Throwable $e) {
            Log::error('Stripe intent creation failed', ['user' => $user->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => __('The payment could not be started. Please try again.')], 502);
        }

        return response()->json([
            'client_secret' => $intent['client_secret'],
            'amount'        => $quote['total'],
            'currency'      => $stripe->currency(),
        ]);
    }

    public function store(Request $request, PayPalVerifier $paypal, StripeGateway $stripe, CheckoutPricing $pricing)
    {
        $data = $request->validate([
            'address_id'         => 'required|exists:addresses,id',
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'payment_method'     => 'required|in:card,paypal',
            'payment_reference'  => 'nullable|string|max:255',
            'coupon_code'        => 'nullable|string',
            'notes'              => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $address = $user->addresses()->findOrFail($data['address_id']);
        $shippingMethod = \App\Models\ShippingMethod::findOrFail($data['shipping_method_id']);

        $cart = Cart::where('user_id', $user->id)->with('items.product.images')->firstOrFail();

        if ($cart->items->isEmpty()) {
            return response()->json(['message' => __('Your cart is empty.')], 422);
        }

        foreach ($cart->items as $item) {
            if (!$item->product || $item->product->stock < $item->quantity) {
                return response()->json([
                    'message' => __('Not enough stock for: :name', ['name' => $item->product?->name]),
                ], 422);
            }
        }

        $quote = $pricing->quote($cart, $shippingMethod, $data['coupon_code'] ?? null);
        ['subtotal' => $subtotal, 'discount' => $discountAmount, 'shipping' => $shippingAmount,
         'tax' => $taxAmount, 'total' => $total, 'coupon' => $coupon] = $quote;

        // Never trust the client's claim that it paid: confirm with the payment provider.
        $reference = $data['payment_reference'] ?? null;
        if ($reference && Order::where('payment_reference', $reference)->exists()) {
            return response()->json(['message' => __('This payment has already been used.')], 422);
        }

        $isPaid = false;
        if ($data['payment_method'] === 'paypal' && $reference) {
            $isPaid = $paypal->verify($reference, $total);
            if (!$isPaid && $paypal->isConfigured()) {
                return response()->json(['message' => __('The payment could not be confirmed.')], 422);
            }
        } elseif ($data['payment_method'] === 'card' && $stripe->isConfigured()) {
            $isPaid = $reference && $stripe->verify($reference, $total, $user->id);
            if (!$isPaid) {
                return response()->json(['message' => __('The payment could not be confirmed.')], 422);
            }
        }
        // Provider not configured (demo mode): the order is kept but stays "pending".

        DB::beginTransaction();
        try {
            $order = Order::create([
                'order_number'       => Order::generateOrderNumber(),
                'user_id'            => $user->id,
                'address_id'         => $address->id,
                'shipping_method_id' => $shippingMethod->id,
                'status'             => 'confirmed',
                'payment_status'     => $isPaid ? 'paid' : 'pending',
                'payment_method'     => $data['payment_method'],
                'payment_reference'  => $data['payment_reference'] ?? null,
                'subtotal'           => $subtotal,
                'discount_amount'    => $discountAmount,
                'shipping_amount'    => $shippingAmount,
                'tax_amount'         => $taxAmount,
                'total'              => $total,
                'notes'              => $data['notes'] ?? null,
                'paid_at'            => $isPaid ? now() : null,
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id'        => $order->id,
                    'product_id'      => $item->product->id,
                    'product_name'    => $item->product->name,
                    'product_image'   => $item->product->primary_image_url,
                    'quantity'        => $item->quantity,
                    'price'           => $item->price,
                    'discount_percent'=> $item->product->discount_percent,
                    'total'           => round($item->price * $item->quantity, 2),
                ]);

                // Conditional decrement: fails instead of overselling if a concurrent order took the stock.
                $updated = Product::whereKey($item->product->id)
                    ->where('stock', '>=', $item->quantity)
                    ->decrement('stock', $item->quantity);
                if (!$updated) {
                    throw new \RuntimeException('OUT_OF_STOCK:' . $item->product->name);
                }
            }

            if ($coupon) {
                $coupon->increment('used_count');
            }

            $cart->items()->delete();

            $invoicePath = $this->generateInvoice($order);
            $order->update(['invoice_path' => $invoicePath]);

            DB::commit();

            try {
                Mail::to($user->email)->locale($user->preferred_language ?: config('app.locale'))->send(new OrderConfirmed($order->load(['items', 'user'])));
            } catch (\Exception $e) {}

            return response()->json([
                'data'    => $order->load(['items', 'address', 'shippingMethod']),
                'message' => __('Order placed successfully.'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            if (str_starts_with($e->getMessage(), 'OUT_OF_STOCK:')) {
                return response()->json(['message' => __('Not enough stock for: :name', ['name' => substr($e->getMessage(), 13)])], 422);
            }
            Log::error('Order creation failed', ['user' => $user->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => __('The order could not be created. Please try again.')], 500);
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::with(['items', 'shippingMethod'])->withTrashed(false);

        if ($user->isAdmin()) {
            $query->with('user:id,name,email');
            if ($status = $request->get('status')) {
                $query->where('status', $status);
            }
            if ($search = $request->get('search')) {
                $query->where(function ($q) use ($search) {
                    $q->whereLike('order_number', "%{$search}%")
                      ->orWhereHas('user', fn($u) => $u->whereLike('name', "%{$search}%")->orWhereLike('email', "%{$search}%"));
                });
            }
        } else {
            $query->where('user_id', $user->id);
            if ($status = $request->get('status')) {
                $query->where('status', $status);
            }
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => $orders->items(),
            'meta' => ['current_page' => $orders->currentPage(), 'last_page' => $orders->lastPage(), 'total' => $orders->total()],
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $order->user_id !== $user->id) {
            return response()->json(['message' => __('Forbidden.')], 403);
        }

        $order->load(['items.product.images', 'address', 'shippingMethod', 'user:id,name,email']);
        return response()->json(['data' => $order]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
        ]);

        // Put stock back when an admin cancels an order (only on the transition, never twice).
        if ($data['status'] === 'cancelled' && $order->status !== 'cancelled') {
            foreach ($order->items as $item) {
                $item->product?->increment('stock', $item->quantity);
            }
        }

        $updates = ['status' => $data['status']];
        if ($data['status'] === 'shipped' && !$order->shipped_at) {
            $updates['shipped_at'] = now();
        }
        if ($data['status'] === 'delivered' && !$order->delivered_at) {
            $updates['delivered_at'] = now();
        }

        $order->update($updates);

        try {
            Mail::to($order->user->email)->locale($order->user->preferred_language ?: config('app.locale'))->send(new OrderStatusUpdated($order->load('user')));
        } catch (\Exception $e) {}

        return response()->json(['data' => $order->fresh()]);
    }

    public function cancel(Request $request, Order $order)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $order->user_id !== $user->id) {
            return response()->json(['message' => __('Forbidden.')], 403);
        }

        if (!$order->canBeCancelled()) {
            return response()->json(['message' => __('This order can no longer be cancelled.')], 422);
        }

        foreach ($order->items as $item) {
            if ($item->product) {
                $item->product->increment('stock', $item->quantity);
            }
        }

        $order->update(['status' => 'cancelled']);
        return response()->json(['data' => $order->fresh(), 'message' => __('Order cancelled.')]);
    }

    public function downloadInvoice(Request $request, Order $order)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $order->user_id !== $user->id) {
            return response()->json(['message' => __('Forbidden.')], 403);
        }

        if (!$order->invoice_path || !Storage::disk('local')->exists($order->invoice_path)) {
            $path = $this->generateInvoice($order);
            $order->update(['invoice_path' => $path]);
        }

        return Storage::disk('local')->download($order->invoice_path, $order->order_number . '.pdf');
    }

    public function sellerOrders(Request $request)
    {
        $user = $request->user();

        // Only expose this seller's own line items (not other sellers' products in the same order).
        $ownItems = fn ($q) => $q->whereHas('product', fn ($p) => $p->where('seller_id', $user->id));
        $query = Order::with(['user:id,name,email', 'items' => $ownItems])
            ->whereHas('items.product', fn($q) => $q->where('seller_id', $user->id))
            ->withCount(['items' => $ownItems]);

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'total'        => $orders->total(),
            ],
        ]);
    }

    private function generateInvoice(Order $order): string
    {
        $order->load(['items', 'address', 'shippingMethod', 'user']);

        // Render in the customer's language (DomPDF can't shape Arabic, so Arabic falls back to English).
        $locale = in_array($order->user?->preferred_language, ['en', 'fr'], true) ? $order->user->preferred_language : 'en';
        $previous = app()->getLocale();
        app()->setLocale($locale);
        try {
            $pdf = Pdf::loadView('invoices.invoice', ['order' => $order]);
            $pdf->output(); // render now, while the locale is set
        } finally {
            app()->setLocale($previous);
        }
        // Private disk: invoices contain names and addresses, so they must not be publicly reachable.
        $path = 'invoices/' . $order->order_number . '.pdf';
        Storage::disk('local')->put($path, $pdf->output());
        return $path;
    }
}
