<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductTag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['images', 'category:id,name,name_fr,slug', 'seller:id,name'])
            ->active();

        if ($search = $request->get('search')) {
            $query->search($search);
        }

        if ($categoryId = $request->get('category_id')) {
            $ids = $this->getCategoryWithChildrenIds($categoryId);
            $query->whereIn('category_id', $ids);
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->get('min_price'));
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->get('max_price'));
        }

        if ($request->boolean('in_stock')) {
            $query->inStock();
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        $sort = $request->get('sort', 'newest');
        match ($sort) {
            'price_asc'  => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'popular'    => $query->orderBy('views', 'desc'),
            'rating'     => $query->withAvg(['reviews as avg_rating' => fn($q) => $q->where('is_approved', true)], 'rating')->orderByDesc('avg_rating'),
            default      => $query->orderBy('created_at', 'desc'),
        };

        $perPage = min((int) $request->get('per_page', 12), 48);
        $products = $query->paginate($perPage);

        return response()->json([
            'data'  => $products->items(),
            'meta'  => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    public function featured()
    {
        $products = Product::with(['images', 'category:id,name,name_fr,slug'])
            ->active()->featured()->inStock()
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        return response()->json(['data' => $products]);
    }

    public function show(Request $request, string $slug)
    {
        $product = Product::with([
            'images',
            'category:id,name,name_fr,slug,parent_id',
            'seller:id,name',
            'tags',
            'reviews' => fn($q) => $q->where('is_approved', true)->with('user:id,name,avatar')->latest()->limit(10),
        ])->where('slug', $slug)->active()->firstOrFail();

        $product->increment('views');

        $related = Product::with(['images'])
            ->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->inStock()
            ->limit(8)
            ->get();

        $ratingBreakdown = [];
        for ($i = 5; $i >= 1; $i--) {
            $ratingBreakdown[$i] = $product->reviews->where('rating', $i)->count();
        }

        return response()->json([
            'data'             => array_merge($product->toArray(), [
                'final_price'      => $product->final_price,
                'average_rating'   => $product->average_rating,
                'in_stock'         => $product->in_stock,
                'primary_image_url'=> $product->primary_image_url,
                'rating_breakdown' => $ratingBreakdown,
            ]),
            'related'          => $related,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'name_fr'          => 'nullable|string|max:255',
            'description'      => 'nullable|string',
            'description_fr'   => 'nullable|string',
            'price'            => 'required|numeric|min:0',
            'compare_price'    => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'stock'            => 'required|integer|min:0',
            'low_stock_alert'  => 'nullable|integer|min:0',
            'sku'              => 'nullable|string|unique:products,sku',
            'category_id'      => 'nullable|exists:categories,id',
            'weight'           => 'nullable|numeric|min:0',
            'attributes'       => 'nullable|array',
            'is_featured'      => 'nullable|boolean',
            'images'           => 'nullable|array',
            'images.*'         => 'image|max:4096',
            'tags'             => 'nullable|array',
            'tags.*'           => 'string|max:50',
        ]);

        $user = $request->user();
        $slug = Str::slug($data['name']) . '-' . Str::random(5);

        $product = Product::create(array_merge($data, [
            'slug'      => $slug,
            'seller_id' => $user->id,
            'is_active' => true,
        ]));

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'is_primary'  => $index === 0,
                    'sort_order'  => $index,
                ]);
            }
        }

        if (!empty($data['tags'])) {
            foreach ($data['tags'] as $tag) {
                ProductTag::create(['product_id' => $product->id, 'tag' => $tag]);
            }
        }

        return response()->json(['data' => $product->load(['images', 'tags'])], 201);
    }

    public function update(Request $request, Product $product)
    {
        $user = $request->user();
        if ($user->isSeller() && $product->seller_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name'             => 'sometimes|string|max:255',
            'name_fr'          => 'nullable|string|max:255',
            'description'      => 'nullable|string',
            'description_fr'   => 'nullable|string',
            'price'            => 'sometimes|numeric|min:0',
            'compare_price'    => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'stock'            => 'sometimes|integer|min:0',
            'low_stock_alert'  => 'nullable|integer|min:0',
            'sku'              => 'nullable|string|unique:products,sku,' . $product->id,
            'category_id'      => 'nullable|exists:categories,id',
            'weight'           => 'nullable|numeric|min:0',
            'attributes'       => 'nullable|array',
            'is_featured'      => 'nullable|boolean',
            'is_active'        => 'nullable|boolean',
            'images'           => 'nullable|array',
            'images.*'         => 'image|max:4096',
            'tags'             => 'nullable|array',
            'tags.*'           => 'string|max:50',
        ]);

        $product->update($data);

        if ($request->hasFile('images')) {
            $maxOrder = $product->images()->max('sort_order') ?? -1;
            $hasPrimary = $product->images()->where('is_primary', true)->exists();
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                $makePrimary = !$hasPrimary && $index === 0;
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                    'is_primary'  => $makePrimary,
                    'sort_order'  => $maxOrder + $index + 1,
                ]);
                if ($makePrimary) {
                    $hasPrimary = true;
                }
            }
        }

        if (isset($data['tags'])) {
            $product->tags()->delete();
            foreach ($data['tags'] as $tag) {
                ProductTag::create(['product_id' => $product->id, 'tag' => $tag]);
            }
        }

        return response()->json(['data' => $product->load(['images', 'tags'])]);
    }

    public function destroy(Request $request, Product $product)
    {
        $user = $request->user();
        if ($user->isSeller() && $product->seller_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $product->delete();
        return response()->json(['message' => 'Produit supprimé.']);
    }

    public function deleteImage(Request $request, ProductImage $image)
    {
        $product = $image->product;
        $user = $request->user();
        if ($user->isSeller() && $product->seller_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        Storage::disk('public')->delete($image->image_path);

        if ($image->is_primary) {
            $product->images()->where('id', '!=', $image->id)->orderBy('sort_order')->first()?->update(['is_primary' => true]);
        }

        $image->delete();
        return response()->json(['message' => 'Image supprimée.']);
    }

    public function sellerProductDetail(Request $request, int $id)
    {
        $user = $request->user();
        $product = Product::with(['images', 'category:id,name,name_fr,slug', 'tags'])
            ->findOrFail($id);

        if ($user->isSeller() && $product->seller_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(['data' => $product]);
    }

    public function sellerProducts(Request $request)
    {
        $query = Product::with(['images', 'category:id,name,name_fr,slug'])
            ->where('seller_id', $request->user()->id);

        if ($search = $request->get('search')) {
            $query->search($search);
        }

        $status = $request->get('status');
        match ($status) {
            'active'     => $query->where('is_active', true)->where('stock', '>', 0),
            'inactive'   => $query->where('is_active', false),
            'low_stock'  => $query->where('is_active', true)->whereColumn('stock', '<=', 'low_stock_alert')->where('stock', '>', 0),
            'out_of_stock' => $query->where('stock', 0),
            default      => null,
        };

        $products = $query->withCount('orderItems')->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    public function setPrimaryImage(Request $request, ProductImage $image)
    {
        $product = $image->product;
        $user = $request->user();
        if ($user->isSeller() && $product->seller_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return response()->json(['message' => 'Image principale mise à jour.']);
    }

    private function getCategoryWithChildrenIds(int $categoryId): array
    {
        $ids = [$categoryId];
        $children = Category::where('parent_id', $categoryId)->pluck('id')->toArray();
        foreach ($children as $childId) {
            $ids = array_merge($ids, $this->getCategoryWithChildrenIds($childId));
        }
        return $ids;
    }
}
