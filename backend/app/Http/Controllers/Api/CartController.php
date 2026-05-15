<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private function getOrCreateCart(Request $request): Cart
    {
        $user = $request->user();
        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id]);
        }

        $sessionId = $request->header('X-Session-ID');
        if (!$sessionId) {
            abort(400, 'X-Session-ID header required for guest cart.');
        }
        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    public function show(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->load(['items.product' => fn($q) => $q->with('images')]);

        $items = $cart->items->map(fn($item) => [
            'id'              => $item->id,
            'quantity'        => $item->quantity,
            'price'           => $item->price,
            'subtotal'        => round($item->price * $item->quantity, 2),
            'product'         => $item->product ? [
                'id'               => $item->product->id,
                'name'             => $item->product->name,
                'name_fr'          => $item->product->name_fr,
                'slug'             => $item->product->slug,
                'price'            => $item->product->price,
                'final_price'      => $item->product->final_price,
                'discount_percent' => $item->product->discount_percent,
                'stock'            => $item->product->stock,
                'primary_image_url'=> $item->product->primary_image_url,
            ] : null,
        ]);

        return response()->json([
            'data' => [
                'id'         => $cart->id,
                'items'      => $items,
                'item_count' => $cart->items->sum('quantity'),
                'subtotal'   => round($cart->items->sum(fn($i) => $i->price * $i->quantity), 2),
            ],
        ]);
    }

    public function addItem(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($data['product_id']);

        if (!$product->is_active) {
            return response()->json(['message' => 'Produit non disponible.'], 422);
        }

        if ($product->stock < $data['quantity']) {
            return response()->json(['message' => "Stock insuffisant. Disponible: {$product->stock}"], 422);
        }

        $cart = $this->getOrCreateCart($request);
        $existing = $cart->items()->where('product_id', $product->id)->first();

        if ($existing) {
            $newQty = $existing->quantity + $data['quantity'];
            if ($product->stock < $newQty) {
                return response()->json(['message' => "Stock insuffisant. Disponible: {$product->stock}"], 422);
            }
            $existing->update(['quantity' => $newQty]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity'   => $data['quantity'],
                'price'      => $product->final_price,
            ]);
        }

        return $this->show($request);
    }

    public function updateItem(Request $request, CartItem $item)
    {
        $data = $request->validate(['quantity' => 'required|integer|min:1']);

        if ($item->product->stock < $data['quantity']) {
            return response()->json(['message' => "Stock insuffisant. Disponible: {$item->product->stock}"], 422);
        }

        $item->update(['quantity' => $data['quantity']]);
        return $this->show($request);
    }

    public function removeItem(Request $request, CartItem $item)
    {
        $item->delete();
        return $this->show($request);
    }

    public function clear(Request $request)
    {
        $cart = $this->getOrCreateCart($request);
        $cart->items()->delete();
        return $this->show($request);
    }

    public function applyCoupon(Request $request)
    {
        $data = $request->validate(['code' => 'required|string']);

        $coupon = Coupon::where('code', strtoupper($data['code']))->first();
        if (!$coupon) {
            return response()->json(['message' => 'Code coupon invalide.'], 422);
        }

        $cart = $this->getOrCreateCart($request);
        $subtotal = $cart->items->sum(fn($i) => $i->price * $i->quantity);

        if (!$coupon->isValid($subtotal)) {
            return response()->json(['message' => 'Ce coupon n\'est pas applicable à votre commande.'], 422);
        }

        $discount = $coupon->calculateDiscount($subtotal);

        return response()->json([
            'message'   => 'Coupon appliqué avec succès.',
            'coupon'    => $coupon,
            'discount'  => $discount,
            'subtotal'  => $subtotal,
            'total'     => max(0, $subtotal - $discount),
        ]);
    }
}
