<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $yearAgo = $now->copy()->subYear();

        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');
        $revenueMonth = Order::where('payment_status', 'paid')->where('created_at', '>=', $startOfMonth)->sum('total');
        $totalOrders = Order::count();
        $ordersToday = Order::whereDate('created_at', today())->count();
        $ordersPending = Order::where('status', 'pending')->count();
        $totalUsers = User::count();
        $newUsersMonth = User::where('created_at', '>=', $startOfMonth)->count();
        $totalProducts = Product::count();
        $outOfStock = Product::where('stock', 0)->count();
        $totalSellers = User::where('role', 'seller')->count();

        $revenueChart = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $revenueMonthly = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $yearAgo)
            ->selectRaw("strftime('%Y-%m', created_at) as month, SUM(total) as revenue, COUNT(*) as orders")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $topProducts = OrderItem::selectRaw('product_id, product_name, SUM(quantity) as total_sold, SUM(total) as revenue')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get();

        $recentOrders = Order::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $ordersByStatus = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $userGrowth = User::where('role', 'client')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'stats' => compact(
                'totalRevenue', 'revenueMonth', 'totalOrders', 'ordersToday',
                'ordersPending', 'totalUsers', 'newUsersMonth', 'totalProducts',
                'outOfStock', 'totalSellers'
            ),
            'revenue_chart'    => $revenueChart,
            'revenue_monthly'  => $revenueMonthly,
            'top_products'     => $topProducts,
            'recent_orders'    => $recentOrders,
            'orders_by_status' => $ordersByStatus,
            'user_growth'      => $userGrowth,
        ]);
    }

    public function users(Request $request)
    {
        $query = User::withCount(['orders', 'products']);

        if ($role = $request->get('role')) {
            $query->where('role', $role);
        }

        if ($search = $request->get('search')) {
            $query->where(fn($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'data' => $users->items(),
            'meta' => ['current_page' => $users->currentPage(), 'last_page' => $users->lastPage(), 'total' => $users->total()],
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'is_active' => 'sometimes|boolean',
            'role'      => 'sometimes|in:admin,seller,client',
        ]);

        $user->update($data);
        return response()->json(['data' => $user]);
    }

    public function destroyUser(User $user)
    {
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Impossible de supprimer un administrateur.'], 422);
        }
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    public function products(Request $request)
    {
        $query = Product::with(['category:id,name', 'seller:id,name'])->withCount('orderItems');

        if ($search = $request->get('search')) {
            $query->search($search);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'data' => $products->items(),
            'meta' => ['current_page' => $products->currentPage(), 'last_page' => $products->lastPage(), 'total' => $products->total()],
        ]);
    }

    public function orders(Request $request)
    {
        $query = Order::with(['user:id,name,email', 'shippingMethod:id,name']);

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'data' => $orders->items(),
            'meta' => ['current_page' => $orders->currentPage(), 'last_page' => $orders->lastPage(), 'total' => $orders->total()],
        ]);
    }

    public function analytics(Request $request)
    {
        $period = $request->get('period', 'month');
        $from = match ($period) {
            'day'   => now()->subDay(),
            'week'  => now()->subWeek(),
            'year'  => now()->subYear(),
            default => now()->subMonth(),
        };

        $salesData = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', $from)
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json(['data' => $salesData, 'period' => $period]);
    }

    public function reviews(Request $request)
    {
        $query = Review::with(['user:id,name', 'product:id,name']);

        if ($request->has('is_approved')) {
            $query->where('is_approved', $request->boolean('is_approved'));
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'data' => $reviews->items(),
            'meta' => ['current_page' => $reviews->currentPage(), 'last_page' => $reviews->lastPage(), 'total' => $reviews->total()],
        ]);
    }

    public function approveReview(Review $review)
    {
        $review->update(['is_approved' => !$review->is_approved]);
        return response()->json(['data' => $review, 'message' => 'Statut de l\'avis mis à jour.']);
    }
}
