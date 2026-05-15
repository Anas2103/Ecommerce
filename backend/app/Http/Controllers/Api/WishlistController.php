<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $items = Wishlist::where('user_id', $request->user()->id)
            ->with(['product' => fn($q) => $q->with('images')])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $items]);
    }

    public function toggle(Request $request)
    {
        $data = $request->validate(['product_id' => 'required|exists:products,id']);
        $user = $request->user();

        $existing = Wishlist::where('user_id', $user->id)
            ->where('product_id', $data['product_id'])
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['in_wishlist' => false, 'message' => 'Retiré de la liste de souhaits.']);
        }

        Wishlist::create(['user_id' => $user->id, 'product_id' => $data['product_id']]);
        return response()->json(['in_wishlist' => true, 'message' => 'Ajouté à la liste de souhaits.']);
    }
}
