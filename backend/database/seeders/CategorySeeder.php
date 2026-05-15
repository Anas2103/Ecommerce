<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics', 'name_fr' => 'Électronique', 'slug' => 'electronics', 'description' => 'Electronic devices and accessories', 'sort_order' => 1,
             'children' => [
                 ['name' => 'Smartphones', 'name_fr' => 'Smartphones', 'slug' => 'smartphones', 'sort_order' => 1],
                 ['name' => 'Laptops', 'name_fr' => 'Ordinateurs Portables', 'slug' => 'laptops', 'sort_order' => 2],
                 ['name' => 'Accessories', 'name_fr' => 'Accessoires', 'slug' => 'electronics-accessories', 'sort_order' => 3],
             ]],
            ['name' => 'Clothing', 'name_fr' => 'Vêtements', 'slug' => 'clothing', 'description' => 'Fashion and apparel', 'sort_order' => 2,
             'children' => [
                 ['name' => 'Men', 'name_fr' => 'Homme', 'slug' => 'men-clothing', 'sort_order' => 1],
                 ['name' => 'Women', 'name_fr' => 'Femme', 'slug' => 'women-clothing', 'sort_order' => 2],
                 ['name' => 'Kids', 'name_fr' => 'Enfants', 'slug' => 'kids-clothing', 'sort_order' => 3],
             ]],
            ['name' => 'Home & Garden', 'name_fr' => 'Maison & Jardin', 'slug' => 'home-garden', 'description' => 'Home decor and garden', 'sort_order' => 3,
             'children' => [
                 ['name' => 'Furniture', 'name_fr' => 'Mobilier', 'slug' => 'furniture', 'sort_order' => 1],
                 ['name' => 'Kitchen', 'name_fr' => 'Cuisine', 'slug' => 'kitchen', 'sort_order' => 2],
             ]],
            ['name' => 'Sports', 'name_fr' => 'Sports', 'slug' => 'sports', 'description' => 'Sports and fitness equipment', 'sort_order' => 4,
             'children' => [
                 ['name' => 'Fitness', 'name_fr' => 'Fitness', 'slug' => 'fitness', 'sort_order' => 1],
                 ['name' => 'Outdoor', 'name_fr' => 'Plein Air', 'slug' => 'outdoor', 'sort_order' => 2],
             ]],
            ['name' => 'Books', 'name_fr' => 'Livres', 'slug' => 'books', 'description' => 'Books and educational materials', 'sort_order' => 5,
             'children' => [
                 ['name' => 'Fiction', 'name_fr' => 'Fiction', 'slug' => 'fiction', 'sort_order' => 1],
                 ['name' => 'Non-Fiction', 'name_fr' => 'Non-Fiction', 'slug' => 'non-fiction', 'sort_order' => 2],
             ]],
            ['name' => 'Beauty', 'name_fr' => 'Beauté', 'slug' => 'beauty', 'description' => 'Beauty and personal care', 'sort_order' => 6,
             'children' => [
                 ['name' => 'Skincare', 'name_fr' => 'Soins de la Peau', 'slug' => 'skincare', 'sort_order' => 1],
                 ['name' => 'Perfumes', 'name_fr' => 'Parfums', 'slug' => 'perfumes', 'sort_order' => 2],
             ]],
            ['name' => 'Toys', 'name_fr' => 'Jouets', 'slug' => 'toys', 'description' => 'Toys and games for all ages', 'sort_order' => 7],
            ['name' => 'Food & Drinks', 'name_fr' => 'Alimentation', 'slug' => 'food-drinks', 'description' => 'Food and beverage products', 'sort_order' => 8],
        ];

        foreach ($categories as $catData) {
            $children = $catData['children'] ?? [];
            unset($catData['children']);

            $parent = Category::create(array_merge($catData, ['is_active' => true]));

            foreach ($children as $childData) {
                Category::create(array_merge($childData, [
                    'parent_id' => $parent->id,
                    'is_active' => true,
                    'description' => null,
                ]));
            }
        }
    }
}
