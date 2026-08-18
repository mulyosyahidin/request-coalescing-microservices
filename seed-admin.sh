#!/bin/bash
# seed-admin.sh
# Skrip untuk membuat user admin via internal endpoint auth-service

AUTH_SERVICE_URL="http://localhost:8081"
ENDPOINT="/internal/auth/admin"

ADMIN_NAME=${1:-"System Admin"}
ADMIN_EMAIL=${2:-"admin@rc.app"}
ADMIN_PASSWORD=${3:-"admin12345"}

echo "🌱 Seeding Admin User..."
echo "-----------------------------------"
echo "Name:     $ADMIN_NAME"
echo "Email:    $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"
echo "URL:      $AUTH_SERVICE_URL$ENDPOINT"
echo "-----------------------------------"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$AUTH_SERVICE_URL$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'"$ADMIN_NAME"'",
    "email": "'"$ADMIN_EMAIL"'",
    "password": "'"$ADMIN_PASSWORD"'"
  }')

HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')

echo "Response Body:"
echo "$BODY"
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 201 ]; then
  echo "✅ Admin seeder completed successfully."
else
  echo "❌ Failed to seed admin."
fi
