#!/usr/bin/env bash
set -e

# Substitute environment variables in nginx config
PORT=${PORT:-80}
export PORT
envsubst '$PORT' < /etc/nginx/http.d/default.conf > /etc/nginx/http.d/default.conf.tmp
mv /etc/nginx/http.d/default.conf.tmp /etc/nginx/http.d/default.conf

# Run migrations (ignore if already run)
php artisan migrate --force --graceful 2>/dev/null || true

# Start supervisord
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
