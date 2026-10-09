#!/bin/bash
set -euo pipefail
echo "⏳ Menjalankan migrasi database Order Service..."
source .env
DATABASE_URL="postgres://${ORDER_DB_USER}:${ORDER_DB_PASSWORD}@localhost:${ORDER_DB_PORT}/${ORDER_DB_NAME}?sslmode=disable"
docker run --rm \
  -v $(pwd)/microservices/order-service/migrations:/migrations \
  --network host \
  migrate/migrate \
  -path=/migrations/ \
  -database "$DATABASE_URL" \
  up
echo "✅ Migrasi selesai."
