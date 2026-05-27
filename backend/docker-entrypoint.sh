#!/bin/bash
set -e

# Create SQLite database file if it doesn't exist
touch /var/www/html/database/database.sqlite
chown www-data:www-data /var/www/html/database/database.sqlite

# Generate app key if not set
php artisan key:generate --force

# Run migrations + seeders
php artisan migrate --force
php artisan db:seed --force 2>/dev/null || true

# Cache config for performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Link storage
php artisan storage:link 2>/dev/null || true

# Start Apache
exec apache2-foreground
