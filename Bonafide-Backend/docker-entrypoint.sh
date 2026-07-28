#!/bin/bash
set -e

echo "Clearing old caches..."
php artisan config:clear
php artisan route:clear

echo "Running migrations..."
php artisan migrate --force

echo "Optimizing Laravel for Production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "Starting queue worker..."
php artisan queue:work --daemon --tries=3 --timeout=90 &

echo "Starting Production Server on 0.0.0.0:${PORT:-8000}..."
exec php -S 0.0.0.0:${PORT:-8000} -t public
