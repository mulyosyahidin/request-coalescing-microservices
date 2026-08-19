#!/bin/bash
# migrate-products.sh
# Menjalankan migrasi database untuk product-service menggunakan container golang-migrate

echo "⏳ Menjalankan migrasi database Product Service..."

source .env

DATABASE_URL="postgres://${PRODUCT_DB_USER}:${PRODUCT_DB_PASSWORD}@localhost:${PRODUCT_DB_PORT}/${PRODUCT_DB_NAME}?sslmode=disable"

docker run --rm \
  -v $(pwd)/microservices/product-service/migrations:/migrations \
  --network host \
  migrate/migrate \
  -path=/migrations/ \
  -database "$DATABASE_URL" \
  up

echo "✅ Migrasi selesai."
