#!/bin/bash
# seed-products.sh
# Skrip untuk memasukkan 50 produk dummy ke database via internal endpoint

PRODUCT_SERVICE_URL="http://localhost:8082"
ENDPOINT="/internal/products/seed"

echo "🌱 Seeding Products..."
echo "URL: $PRODUCT_SERVICE_URL$ENDPOINT"
echo "-----------------------------------"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$PRODUCT_SERVICE_URL$ENDPOINT")

HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')
BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')

echo "Response Body:"
echo "$BODY"
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 201 ]; then
  echo "✅ Products seeded successfully."
else
  echo "❌ Failed to seed products."
fi
