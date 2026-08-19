#!/bin/bash
set -e

DB_URL="postgres://payment_user:payment_password_secure@localhost:5436/payment_db?sslmode=disable"
MIGRATIONS_DIR="./microservices/payment-service/migrations"

echo "Running migrations for Payment Service..."

docker run --rm -v $(pwd)/$MIGRATIONS_DIR:/migrations --network host migrate/migrate \
    -path=/migrations/ -database "$DB_URL" up

echo "Migrations completed successfully!"
