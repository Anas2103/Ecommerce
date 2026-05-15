<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'address_id'         => 'required|exists:addresses,id',
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'payment_method'     => 'required|string|max:50',
            'payment_reference'  => 'nullable|string|max:255',
            'coupon_code'        => 'nullable|string',
            'notes'              => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $address = $user->addresses()->findOrFail($data['address_id']);
        $shippingMethod = \App\Models\ShippingMethod::findOrFail($data['shipping_method_id']);

        $cart = Cart::where('user_id', $user->id)->with('items.product')->firstOrFail();

        if ($cart->items->isEmpty()) {
            return response()->json(['message' => 'Votre panier est vide.'], 422);
        }

        foreach ($cart->items as $item) {
            if (!$item->product || $item->product->stock < $item->quantity) {
                return response()->json([
                    'message' => "Stock insuffisant pour: {$item->product?->name}",
                ], 422);
            }
        }

        $subtotal = $cart->items->sum(fn($i) => $i->price * $i->quantity);
        $discountAmount = 0;
        $coupon = null;

        if (!empty($data['coupon_code'])) {
            $coupon = Coupon::where('code', strtoupper($data['coupon_code']))->first();
            if ($coupon && $coupon->isValid($subtotal)) {
                $discountAmount = $coupon->calculateDiscount($subtotal);
            }
        }

        $shippingAmount = (float) $shippingMethod->price;
        $taxableAmount = $subtotal - $discountAmount + $shippingAmount;
        $taxAmount = round($taxableAmount * 0.20, 2);
        $total = round($taxableAmount + $taxAmount, 2);

        DB::beginTransaction();
        try {
            $order = Order::create([
                'order_number'       => Order::generateOrderNumber(),
                'user_id'            => $user->id,
                'address_id'         => $address->id,
                'shipping_method_id' => $shippingMethod->id,
                'status'             => 'confirmed',
                'payment_status'     => 'paid',
                'payment_method'     => $data['payment_method'],
                'payment_reference'  => $data['payment_reference'] ?? ('SIM-' . strtoupper(substr(uniqid(), -5))),
                'subtotal'           => $subtotal,
                'discount_amount'    => $discountAmount,
                'shipping_amount'    => $shippingAmount,
                'tax_amount'         => $taxAmount,
                'total'              => $total,
                'notes'              => $data['notes'] ?? null,
                'paid_at'            => now(),
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

                $item->product->decrement('stock', $item->quantity);
            }

            if ($coupon) {
                $coupon->increment('used_count');
            }

            $cart->items()->delete();

            $invoicePath = $this->generateInvoice($order);
            $order->update(['invoice_path' => $invoicePath]);

            DB::commit();

            try {
                // Mail::to($user->email)->send(new OrderConfirmed($order));
            } catch (\Exception $e) {}

            return response()->json([
                'data'    => $order->load(['items', 'address', 'shippingMethod']),
                'message' => 'Commande passée avec succès.',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la création de la commande: ' . $e->getMessage()], 500);
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
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
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
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $order->load(['items.product.images', 'address', 'shippingMethod', 'user:id,name,email']);
        return response()->json(['data' => $order]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
        ]);

        $updates = ['status' => $data['status']];
        if ($data['status'] === 'shipped' && !$order->shipped_at) {
            $updates['shipped_at'] = now();
        }
        if ($data['status'] === 'delivered' && !$order->delivered_at) {
            $updates['delivered_at'] = now();
        }

        $order->update($updates);

        try {
            // Mail::to($order->user->email)->send(new OrderStatusUpdated($order));
        } catch (\Exception $e) {}

        return response()->json(['data' => $order->fresh()]);
    }

    public function cancel(Request $request, Order $order)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!$order->canBeCancelled()) {
            return response()->json(['message' => 'Cette commande ne peut pas être annulée.'], 422);
        }

        foreach ($order->items as $item) {
            if ($item->product) {
                $item->product->increment('stock', $item->quantity);
            }
        }

        $order->update(['status' => 'cancelled']);
        return response()->json(['data' => $order->fresh(), 'message' => 'Commande annulée.']);
    }

    public function downloadInvoice(Request $request, Order $order)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (!$order->invoice_path || !Storage::disk('public')->exists($order->invoice_path)) {
            $path = $this->generateInvoice($order);
            $order->update(['invoice_path' => $path]);
        }

        return response()->download(storage_path('app/public/' . $order->invoice_path));
    }

    public function sellerOrders(Request $request)
    {
        $user = $request->user();

        $query = Order::with(['user:id,name,email', 'items'])
            ->whereHas('items.product', fn($q) => $q->where('seller_id', $user->id))
            ->withCount('items');

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
        $pdf = Pdf::loadView('invoices.invoice', ['order' => $order]);
        $path = 'invoices/' . $order->order_number . '.pdf';
        Storage::disk('public')->makeDirectory('invoices');
        Storage::disk('public')->put($path, $pdf->output());
        return $path;
    }
}
