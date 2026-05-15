<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'order_id'   => 'nullable|exists:orders,id',
            'rating'     => 'required|integer|min:1|max:5',
            'title'      => 'nullable|string|max:100',
            'comment'    => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $existing = Review::where('user_id', $user->id)->where('product_id', $data['product_id'])->first();
        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà évalué ce produit.'], 422);
        }

        $review = Review::create(array_merge($data, [
            'user_id'     => $user->id,
            'is_approved' => false,
        ]));

        return response()->json(['data' => $review->load('user:id,name,avatar')], 201);
    }

    public function update(Request $request, Review $review)
    {
        if ($review->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'rating'  => 'sometimes|integer|min:1|max:5',
            'title'   => 'nullable|string|max:100',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review->update($data);
        return response()->json(['data' => $review]);
    }

    public function destroy(Request $request, Review $review)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $review->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $review->delete();
        return response()->json(['message' => 'Avis supprimé.']);
    }

    public function productReviews(Product $product)
    {
        $reviews = Review::where('product_id', $product->id)
            ->where('is_approved', true)
            ->with('user:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'data' => $reviews->items(),
            'meta' => ['current_page' => $reviews->currentPage(), 'last_page' => $reviews->lastPage(), 'total' => $reviews->total()],
        ]);
    }
}
