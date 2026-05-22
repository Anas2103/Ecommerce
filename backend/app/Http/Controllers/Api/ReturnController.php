<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ReturnRequest;
use Illuminate\Http\Request;

class ReturnController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = ReturnRequest::with(['order:id,order_number', 'orderItem:id,product_name', 'user:id,name,email']);

        if ($user->isAdmin()) {
            // admin sees all
        } elseif ($user->isSeller()) {
            $query->whereHas('order.items.product', fn($q) => $q->where('seller_id', $user->id));
        } else {
            $query->where('user_id', $user->id);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        return response()->json(['data' => $query->latest()->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'order_id'      => 'required|exists:orders,id',
            'order_item_id' => 'nullable|exists:order_items,id',
            'reason'        => 'required|string|max:100',
            'description'   => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $order = Order::where('id', $data['order_id'])->where('user_id', $user->id)->firstOrFail();

        if ($order->status !== 'delivered') {
            return response()->json(['message' => 'Seules les commandes livrées peuvent faire l\'objet d\'un retour.'], 422);
        }

        $existing = ReturnRequest::where('order_id', $order->id)
            ->where('order_item_id', $data['order_item_id'] ?? null)
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Une demande de retour existe déjà pour cet article.'], 422);
        }

        $return = ReturnRequest::create([
            'order_id'      => $order->id,
            'order_item_id' => $data['order_item_id'] ?? null,
            'user_id'       => $user->id,
            'reason'        => $data['reason'],
            'description'   => $data['description'] ?? null,
            'status'        => 'pending',
        ]);

        return response()->json(['data' => $return, 'message' => 'Demande de retour soumise.'], 201);
    }

    public function update(Request $request, ReturnRequest $returnRequest)
    {
        $user = $request->user();

        if (!$user->isAdmin() && !$user->isSeller()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'status'      => 'required|in:approved,rejected',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $returnRequest->update($data);

        return response()->json(['data' => $returnRequest->fresh(), 'message' => 'Statut mis à jour.']);
    }
}
