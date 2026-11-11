<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;

// Used by docker-entrypoint.sh: fills a fresh production database with the demo
// data, and never touches a database that already has users.
Artisan::command('app:seed-if-empty', function () {
    if (User::query()->exists()) {
        $this->info('Database already has data — skipping demo seed.');
        return 0;
    }

    $this->info('Empty database — seeding demo data.');
    return $this->call('db:seed', ['--force' => true]);
})->purpose('Seed the demo data only if the database is empty');
