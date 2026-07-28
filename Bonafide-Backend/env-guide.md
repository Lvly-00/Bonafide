```bash
# --- Required ---
APP_KEY=(generate via Render or run: php artisan key:generate)
APP_ENV=production
APP_DEBUG=false
APP_URL=https://bonafide-backend.onrender.com

# --- Database (pick one) ---

# Option A: PostgreSQL (Render PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=your-render-db-host
DB_PORT=5432
DB_DATABASE=bonafide
DB_USERNAME=bonafide_user
DB_PASSWORD=your-db-password

# Option B: SQLite (simplest, no external DB needed)
# DB_CONNECTION=sqlite

# --- Performance / Stability ---
SESSION_DRIVER=cookie
QUEUE_CONNECTION=sync
CACHE_STORE=file
LOG_LEVEL=warning
```
