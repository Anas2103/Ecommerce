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

# Start from fresh config so env vars (e.g. ADMIN_PASSWORD) are read at seed time
artisan "config:clear"

# Run migrations (required)
artisan "migrate --force"

# Seed demo data only when asked to, and only into an empty database
# (never re-seed over real data on restart).
if [ "${SEED_ON_BOOT:-false}" = "true" ]; then
    USERS=$(su -s /bin/bash www-data -c "cd /var/www/html && php artisan tinker --execute='echo \App\Models\User::count();'" | tail -n1)
    if [ "$USERS" = "0" ]; then
        artisan "db:seed --force"
    else
        echo "[info] database already has data — skipping seed"
    fi
fi

# Link public storage (ignore if already linked)
artisan "storage:link" || true

# Cache configuration, routes and views for production performance
artisan "config:cache"
artisan "route:cache"
artisan "view:cache"

# Start Apache
exec apache2-foreground
