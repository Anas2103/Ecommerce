<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role'     => 'nullable|in:client,seller',
            'phone'    => 'nullable|string|max:20',
        ]);

        $data['role'] = $data['role'] ?? 'client';
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        Cart::create(['user_id' => $user->id]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $this->userResponse($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'      => 'required|email',
            'password'   => 'required|string',
            'session_id' => 'nullable|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Votre compte a été désactivé.'], 403);
        }

        // Merge guest cart
        if (!empty($data['session_id'])) {
            $guestCart = Cart::where('session_id', $data['session_id'])->with('items')->first();
            if ($guestCart && $guestCart->items->count() > 0) {
                $userCart = $user->cart ?? Cart::create(['user_id' => $user->id]);
                foreach ($guestCart->items as $item) {
                    $existing = $userCart->items()->where('product_id', $item->product_id)->first();
                    if ($existing) {
                        $existing->increment('quantity', $item->quantity);
                    } else {
                        $userCart->items()->create([
                            'product_id' => $item->product_id,
                            'quantity'   => $item->quantity,
                            'price'      => $item->price,
                        ]);
                    }
                }
                $guestCart->delete();
            }
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => $this->userResponse($user->load(['addresses', 'cart.items'])),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['addresses', 'cart.items.product.images']);
        return response()->json(['user' => $this->userResponse($user)]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name'               => 'sometimes|string|max:255',
            'phone'              => 'nullable|string|max:20',
            'preferred_language' => 'nullable|in:fr,en',
            'avatar'             => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        $user->update($data);

        return response()->json(['user' => $this->userResponse($user->fresh())]);
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($data['password'])]);
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['message' => 'Mot de passe modifié avec succès.', 'token' => $token]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        Password::sendResetLink($request->only('email'));
        return response()->json(['message' => 'Lien de réinitialisation envoyé si l\'email existe.']);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill(['password' => Hash::make($password)])->save();
            $user->tokens()->delete();
        });

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
        }

        return response()->json(['message' => 'Lien invalide ou expiré.'], 400);
    }

    private function userResponse(User $user): array
    {
        return [
            'id'                 => $user->id,
            'name'               => $user->name,
            'email'              => $user->email,
            'role'               => $user->role,
            'phone'              => $user->phone,
            'avatar_url'         => $user->avatar_url,
            'is_active'          => $user->is_active,
            'preferred_language' => $user->preferred_language,
            'addresses'          => $user->relationLoaded('addresses') ? $user->addresses : null,
            'cart'               => $user->relationLoaded('cart') ? $user->cart : null,
        ];
    }
}
