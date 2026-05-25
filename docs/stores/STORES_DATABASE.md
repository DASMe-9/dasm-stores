# DASM Stores — Database Architecture

> **Rule**: All store data lives in **DASM-services** Supabase project.
> This is the **only** database for stores. No store tables in Core DB.

## Database

| Property | Value |
|----------|-------|
| Supabase Project | `bmfqfmsxtotdksvcqfrh` (DASM-services) |
| Backend Connection | `pgsql_services` (in DASM-Platform Laravel) |
| Env Vars (dasm-stores) | `SUPABASE_SERVICES_URL` + `SUPABASE_SERVICES_SERVICE_KEY` |
| Primary Key Type | UUID (all tables) |

## Backend (DASM-Platform)

All store API endpoints are in `DASM-Platform/backend`:
- Controllers: `app/Http/Controllers/Store/`
- Models: `app/Models/Store*.php` (19 models, all with `$connection = 'pgsql_services'`)
- Routes: `routes/api/stores.php`
- Migrations: `database/migrations/*store*`

## Frontend (dasm-stores)

This repo is the storefront and seller dashboard. It calls the backend API at:
- Production: `https://dasm-laravel.onrender.com` (set via `NEXT_PUBLIC_API_URL`)
- All auth goes through Core API (`POST /api/login`)
- All store CRUD goes through `/api/stores/*` endpoints

## Cross-DB Identity

- `stores.user_id` references `users.id` in Core DB (bigint)
- No foreign key constraints across databases
- Identity, auth, ledger, and wallets remain in Core DB
