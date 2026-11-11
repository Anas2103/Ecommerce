<?php

use Illuminate\Support\Facades\Route;

// This app is a JSON API; the storefront is the separate React app (frontend/).
Route::get('/', fn () => response()->json([
    'name'     => config('app.name') . ' API',
    'status'   => 'ok',
    'api'      => url('/api/v1'),
    'health'   => url('/up'),
    'frontend' => config('app.frontend_url'),
]));
