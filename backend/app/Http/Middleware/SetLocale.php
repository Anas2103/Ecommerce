<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $lang = $request->header('Accept-Language', 'en');
        $lang = strtolower(substr($lang, 0, 2));
        $supported = ['en', 'fr', 'ar'];

        App::setLocale(in_array($lang, $supported) ? $lang : 'en');

        return $next($request);
    }
}
