<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with(['children' => fn($q) => $q->active()->orderBy('sort_order')])
            ->active()->root()->orderBy('sort_order')->get();

        return response()->json(['data' => $categories]);
    }

    public function adminAll()
    {
        $categories = Category::with(['children' => fn($q) => $q->orderBy('sort_order'), 'parent:id,name'])
            ->withCount('products')
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $categories]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'name_fr'     => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'parent_id'   => 'nullable|exists:categories,id',
            'is_active'   => 'nullable|boolean',
            'sort_order'  => 'nullable|integer',
            'image'       => 'nullable|image|max:2048',
        ]);

        $data['slug'] = Str::slug($data['name']);
        if (Category::where('slug', $data['slug'])->exists()) {
            $data['slug'] .= '-' . Str::random(4);
        }

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category = Category::create($data);
        return response()->json(['data' => $category], 201);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'name_fr'     => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'parent_id'   => 'nullable|exists:categories,id',
            'is_active'   => 'nullable|boolean',
            'sort_order'  => 'nullable|integer',
            'image'       => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($data);
        return response()->json(['data' => $category]);
    }

    public function destroy(Category $category)
    {
        Category::where('parent_id', $category->id)->update(['parent_id' => null]);
        $category->delete();
        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}
