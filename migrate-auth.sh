#!/bin/bash
set -euo pipefail
# migrate-auth.sh
# Menjalankan migrasi database untuk auth-service menggunakan container golang-migrate

echo "⏳ Menjalankan migrasi database Auth Service..."

source .env

DATABASE_URL="postgres://${AUTH_DB_USER}:${AUTH_DB_PASSWORD}@localhost:${AUTH_DB_PORT}/${AUTH_DB_NAME}?sslmode=disable"

docker run --rm \
  -v $(pwd)/microservices/auth-service/migrations:/migrations \
  --network host \
  migrate/migrate \
  -path=/migrations/ \
  -database "$DATABASE_URL" \
  up

echo "✅ Migrasi selesai."
