#!/bin/bash
echo "=========================================================="
echo "🚀 Menjalankan Experiment Load Test (DENGAN Request Coalescing)"
echo "=========================================================="
docker run --rm -i --add-host host.docker.internal:host-gateway \
  -v $(pwd)/load-testing:/load-testing \
  -e K6_PROMETHEUS_RW_SERVER_URL=http://host.docker.internal:9090/api/v1/write \
  grafana/k6:latest run -o experimental-prometheus-rw /load-testing/product_detail_coalesced_test.js
