<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Auth — public
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    // Products — public
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);
    Route::get('/products/{product}/reviews', [ReviewController::class, 'productReviews']);

    // Categories — public
    Route::get('/categories', [CategoryController::class, 'index']);

    // Shipping methods — public
    Route::get('/shipping-methods', fn() => response()->json([
        'data' => \App\Models\ShippingMethod::active()->get(),
    ]));

    // Recommendations — public
    Route::get('/recommendations/trending', [RecommendationController::class, 'trending']);
    Route::get('/recommendations/also-viewed/{product}', [RecommendationController::class, 'alsoViewed']);

    // Cart — guest/auth
    Route::get('/cart', [CartController::class, 'show']);
    Route::post('/cart/add', [CartController::class, 'addItem']);
    Route::put('/cart/items/{item}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{item}', [CartController::class, 'removeItem']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    Route::post('/cart/coupon', [CartController::class, 'applyCoupon']);

    // Chatbot — public
    Route::post('/chatbot', [ChatbotController::class, 'handle']);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/change-password', [AuthController::class, 'changePassword']);

        // Recommendations — personalized
        Route::get('/recommendations', [RecommendationController::class, 'personalized']);

        // Addresses
        Route::apiResource('/addresses', AddressController::class);
        Route::post('/addresses/{address}/set-default', [AddressController::class, 'setDefault']);

        // Orders
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::get('/orders/{order}/invoice', [OrderController::class, 'downloadInvoice']);

        // Reviews
        Route::post('/reviews', [ReviewController::class, 'store']);
        Route::put('/reviews/{review}', [ReviewController::class, 'update']);
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

        // Wishlist
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);

        // Seller routes
        Route::middleware('role:seller,admin')->group(function () {
            Route::post('/products', [ProductController::class, 'store']);
            Route::put('/products/{product}', [ProductController::class, 'update']);
            Route::delete('/products/{product}', [ProductController::class, 'destroy']);
            Route::delete('/product-images/{image}', [ProductController::class, 'deleteImage']);
            Route::put('/product-images/{image}/primary', [ProductController::class, 'setPrimaryImage']);
            Route::get('/seller/products', [ProductController::class, 'sellerProducts']);
            Route::get('/seller/products/{id}', [ProductController::class, 'sellerProductDetail']);
            Route::get('/seller/orders', [OrderController::class, 'sellerOrders']);
        });

        // Admin routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);

            // Users
            Route::get('/users', [AdminController::class, 'users']);
            Route::put('/users/{user}', [AdminController::class, 'updateUser']);
            Route::delete('/users/{user}', [AdminController::class, 'destroyUser']);

            // Products
            Route::get('/products', [AdminController::class, 'products']);

            // Orders
            Route::get('/orders', [AdminController::class, 'orders']);
            Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);

            // Categories
            Route::get('/categories/all', [CategoryController::class, 'adminAll']);
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::put('/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

            // Analytics
            Route::get('/analytics/sales', [AdminController::class, 'analytics']);

            // Reviews
            Route::get('/reviews', [AdminController::class, 'reviews']);
            Route::put('/reviews/{review}/approve', [AdminController::class, 'approveReview']);
        });
    });
});
