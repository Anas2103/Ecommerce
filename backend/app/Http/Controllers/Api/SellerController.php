<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Review;
use App\Models\User;

class SellerController extends Controller
{
    /** Public storefront profile for a seller (no private contact details). */
    public function show(int $id)
    {
        $seller = User::where('role', 'seller')->where('is_active', true)->findOrFail($id);

        $productIds = $seller->products()->where('is_active', true)->pluck('id');

        $rating = Review::whereIn('product_id', $productIds)->where('is_approved', true)->avg('rating');

        return response()->json(['data' => [
            'id'             => $seller->id,
            'name'           => $seller->name,
            'created_at'     => $seller->created_at,
            'products_count' => $productIds->count(),
            'orders_count'   => OrderItem::whereIn('product_id', $productIds)->distinct('order_id')->count('order_id'),
            'average_rating' => $rating ? round($rating, 1) : 0,
        ]]);
    }
}
