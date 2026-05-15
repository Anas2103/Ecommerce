<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['data' => $request->user()->addresses()->orderByDesc('is_default')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'full_name'     => 'required|string|max:100',
            'phone'         => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city'          => 'required|string|max:100',
            'state'         => 'nullable|string|max:100',
            'postal_code'   => 'nullable|string|max:20',
            'country'       => 'nullable|string|max:100',
            'is_default'    => 'nullable|boolean',
        ]);

        $user = $request->user();

        if ($user->addresses()->count() === 0) {
            $data['is_default'] = true;
        } elseif (!empty($data['is_default'])) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create($data);
        return response()->json(['data' => $address], 201);
    }

    public function update(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'full_name'     => 'sometimes|string|max:100',
            'phone'         => 'sometimes|string|max:20',
            'address_line1' => 'sometimes|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city'          => 'sometimes|string|max:100',
            'state'         => 'nullable|string|max:100',
            'postal_code'   => 'nullable|string|max:20',
            'country'       => 'nullable|string|max:100',
        ]);

        $address->update($data);
        return response()->json(['data' => $address]);
    }

    public function destroy(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $address->delete();

        if ($address->is_default) {
            $request->user()->addresses()->first()?->update(['is_default' => true]);
        }

        return response()->json(['message' => 'Adresse supprimée.']);
    }

    public function setDefault(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->user()->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return response()->json(['data' => $address, 'message' => 'Adresse par défaut mise à jour.']);
    }
}
