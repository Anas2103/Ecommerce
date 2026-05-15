<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function personalized(Request $request)
    {
        $user = $request->user();
        $products = collect();

        if ($user) {
            $categoryIds = Order::where('user_id', $user->id)
                ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->pluck('products.category_id')
                ->unique()
                ->toArray();

            if (!empty($categoryIds)) {
                $ownedIds = OrderItem::whereIn('order_id', Order::where('user_id', $user->id)->pluck('id'))
                    ->pluck('product_id')->toArray();

                $products = Product::with(['images'])
                    ->active()->inStock()
                    ->whereIn('category_id', $categoryIds)
                    ->whereNotIn('id', $ownedIds)
                    ->orderByDesc('views')
                    ->limit(8)
                    ->get();
            }
        }

        if ($products->count() < 8) {
            $existing = $products->pluck('id')->toArray();
            $fill = Product::with(['images'])
                ->active()->inStock()
                ->whereNotIn('id', $existing)
                ->orderByDesc('views')
                ->limit(8 - $products->count())
                ->get();
            $products = $products->merge($fill);
        }

        return response()->json(['data' => $products]);
    }

    public function alsoViewed(Request $request, Product $product)
    {
        $orderIds = OrderItem::where('product_id', $product->id)
            ->pluck('order_id')->unique()->toArray();

        $relatedProductIds = OrderItem::whereIn('order_id', $orderIds)
            ->where('product_id', '!=', $product->id)
            ->groupBy('product_id')
            ->selectRaw('product_id, COUNT(*) as count')
            ->orderByDesc('count')
            ->limit(8)
            ->pluck('product_id')
            ->toArray();

        $products = Product::with(['images'])
            ->active()->inStock()
            ->whereIn('id', $relatedProductIds)
            ->get();

        if ($products->count() < 8) {
            $existing = $products->pluck('id')->merge([$product->id])->toArray();
            $fill = Product::with(['images'])
                ->active()->inStock()
                ->where('category_id', $product->category_id)
                ->whereNotIn('id', $existing)
                ->limit(8 - $products->count())
                ->get();
            $products = $products->merge($fill);
        }

        return response()->json(['data' => $products]);
    }

    public function trending()
    {
        $thirtyDaysAgo = now()->subDays(30);

        $productIds = OrderItem::where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy('product_id')
            ->selectRaw('product_id, SUM(quantity) as total_sold')
            ->orderByDesc('total_sold')
            ->limit(8)
            ->pluck('product_id');

        $products = Product::with(['images'])
            ->active()->inStock()
            ->whereIn('id', $productIds)
            ->get();

        if ($products->count() < 8) {
            $existing = $products->pluck('id')->toArray();
            $fill = Product::with(['images'])
                ->active()->inStock()
                ->whereNotIn('id', $existing)
                ->orderByDesc('views')
                ->limit(8 - $products->count())
                ->get();
            $products = $products->merge($fill);
        }

        return response()->json(['data' => $products]);
    }
}
