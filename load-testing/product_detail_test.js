import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    ramping_burst: {
      executor: 'ramping-arrival-rate',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 2000,
      stages: [
        { target: 1000, duration: '5m' }, // Ramp up to 1000 RPS over 5 minutes
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

export function setup() {
  // Fetch initial products to get some valid UUIDs to hit
  let productIds = [];
  try {
    const res = http.get('http://host.docker.internal:8080/api/v1/products?limit=100');
    if (res.status === 200) {
      const body = res.json();
      if (body && body.data && body.data.items && body.data.items.length > 0) {
        productIds = body.data.items.map(p => p.id);
      }
    }
  } catch (e) {
    console.error("Setup failed:", e);
  }

  // Fallback ID if empty
  if (productIds.length === 0) {
    productIds = ['f6f4f9cd-95c7-45fc-aed4-f549493dfad6'];
  }
  
  return { productIds };
}

export default function (data) {
  // For request coalescing test, hitting the EXACT same URL at the same time is key.
  // To simulate a pure hot-key burst (flash sale), 100% of traffic goes to ONE product.
  
  const targetId = data.productIds[0];

  const url = `http://host.docker.internal:8080/api/v1/products/${targetId}`;
  
  const res = http.get(url, {
    tags: { name: 'GetProductDetail' }
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'is successful API response': (r) => r.json('success') === true,
  });

  sleep(1);
}
