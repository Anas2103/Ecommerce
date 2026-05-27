#!/bin/bash
set -e

# Ensure database directory + SQLite file exist with correct ownership
mkdir -p /var/www/html/database
touch /var/www/html/database/database.sqlite
chown -R www-data:www-data /var/www/html/database
chmod 664 /var/www/html/database/database.sqlite

# Fix storage / bootstrap permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Helper to run artisan as www-data
artisan() {
    su -s /bin/bash www-data -c "cd /var/www/html && php artisan $*"
}

# Run migrations (required)
artisan "migrate --force"

# Seed (optional — don't fail if seeders error)
artisan "db:seed --force" || echo "[warn] seeder skipped"

# Link public storage (ignore if already linked)
artisan "storage:link" || true

# Start Apache
exec apache2-foreground
