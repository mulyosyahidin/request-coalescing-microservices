# PROGRESS.md — Roadmap & Checklist Pengembangan

> **Terakhir diperbarui:** 2026-08-19
> **Penanggung jawab update:** AI Agent / Developer

---

## Cara Menggunakan Dokumen Ini

- ✅ `[x]` = Selesai
- 🔄 `[/]` = Sedang dikerjakan
- ⬜ `[ ]` = Belum dimulai
- ❌ `[-]` = Dibatalkan / Tidak relevan

**Aturan:** Update checklist ini setiap kali satu item selesai dikerjakan. Tambahkan tanggal penyelesaian jika diperlukan.

---

## Fase 1: Perencanaan & Inisialisasi Proyek ✅

- [x] Membuat struktur direktori proyek
  - [x] `/api-gateway`
  - [x] `/client-app`
  - [x] `/load-testing`
  - [x] `/microservices/auth-service`
  - [x] `/microservices/product-service`
  - [x] `/microservices/order-service`
  - [x] `/microservices/payment-service`
  - [x] `/observability/grafana`
  - [x] `/observability/prometheus`
- [x] Membuat `.gitignore`
- [x] Membuat `.env.example` dengan template variabel
- [x] Menulis `AGENTS.md` — panduan arsitektur & aturan untuk AI agent
- [x] Menulis `FEATURES.md` — ruang lingkup fitur per service/komponen
- [x] Menulis `PROGRESS.md` — roadmap & checklist (dokumen ini)
- [x] Menentukan tech stack & arsitektur sistem
- [x] Menentukan data model awal untuk setiap service

---

## Fase 2: Setup Skeleton & Boilerplate

### 2.1 Golang Microservices Skeleton
- [x] **Auth Service**
  - [x] Inisialisasi Go module (`go mod init`)
  - [x] Setup project layout (`cmd/`, `internal/`, `migrations/`)
  - [x] Entry point `cmd/main.go` dengan HTTP server dasar
  - [x] Konfigurasi loader (env vars)
  - [x] Health check endpoint (`GET /health`)
  - [x] Metrics endpoint (`GET /metrics`)
  - [x] Dockerfile (multi-stage build)
- [x] **Product Service**
  - [x] Inisialisasi Go module (`go mod init`)
  - [ ] Setup project layout (`cmd/`, `internal/`, `migrations/`) — *(dikerjakan di Fase 3.2)*
  - [x] Entry point `cmd/main.go` dengan HTTP server dasar
  - [ ] Konfigurasi loader (env vars) — *(dikerjakan di Fase 3.2)*
  - [x] Health check endpoint (`GET /health`)
  - [x] Metrics endpoint (`GET /metrics`)
  - [x] Dockerfile (multi-stage build)
  - [x] Inisialisasi Go module (`go mod init`)
  - [ ] Setup project layout (`cmd/`, `internal/`, `migrations/`) — *(dikerjakan di Fase 3.3)*
  - [x] Entry point `cmd/main.go` dengan HTTP server dasar
  - [ ] Konfigurasi loader (env vars) — *(dikerjakan di Fase 3.3)*
  - [x] Health check endpoint (`GET /health`)
  - [x] Metrics endpoint (`GET /metrics`)
  - [x] Dockerfile (multi-stage build)
- [ ] **Order Service**
  - [ ] Inisialisasi Go module (`go mod init`)
  - [ ] Setup project layout (`cmd/`, `internal/`, `migrations/`)
  - [ ] Entry point `cmd/main.go` dengan HTTP server dasar
  - [ ] Konfigurasi loader (env vars)
  - [ ] Health check endpoint (`GET /health`)
  - [ ] Metrics endpoint (`GET /metrics`)
  - [ ] Dockerfile (multi-stage build)
- [ ] **Payment Service**
  - [ ] Inisialisasi Go module (`go mod init`)
  - [ ] Setup project layout (`cmd/`, `internal/`, `migrations/`)
  - [ ] Entry point `cmd/main.go` dengan HTTP server dasar
  - [ ] Konfigurasi loader (env vars)
  - [ ] Health check endpoint (`GET /health`)
  - [ ] Metrics endpoint (`GET /metrics`)
  - [ ] Dockerfile (multi-stage build)

### 2.2 Client Application Skeleton
- [x] Inisialisasi Next.js project (`npx create-next-app@latest`)
- [x] Setup Tailwind CSS
- [x] Konfigurasi environment variables (API gateway URL)
- [x] Layout dasar (header, footer, navigation)
- [x] Halaman placeholder (Home, Product List, Login)

### 2.3 Docker Compose
- [x] `docker-compose.yml` untuk development environment
  - [x] KrakenD service
  - [x] auth-service + auth-db (PostgreSQL)
  - [x] product-service + product-db (PostgreSQL)
  - [x] order-service + order-db (PostgreSQL)
  - [x] payment-service + payment-db (PostgreSQL)
  - [x] Prometheus
  - [x] Grafana
  - [x] Loki + Alloy
  - [x] Swagger UI (OpenAPI docs)
  - [x] Network configuration
  - [x] Verifikasi semua service bisa start dan saling berkomunikasi
  - [x] Dokumentasi cara menjalankan (`README.md` atau di `AGENTS.md`)

---

## Fase 3: Implementasi API Gateway & Microservices

### 3.1 Auth Service — Implementasi Penuh ✅
- [x] **Database**
  - [x] Migration: Create `users` table
  - [x] Repository layer (CRUD user, interface + PostgreSQL implementation)
- [x] **Business Logic**
  - [x] Register: validasi input, hash password, simpan user (default role: customer)
  - [x] Login: verifikasi credentials, generate JWT (claim role, exp, sub)
  - [x] Admin Provisioning: create admin account (role: admin)
  - [x] Token validation: parse & verify JWT
- [x] **HTTP Handlers**
  - [x] `POST /api/v1/auth/register`
  - [x] `POST /api/v1/auth/login`
  - [x] `POST /api/v1/auth/logout`
  - [x] `GET /api/v1/auth/me`
  - [x] `POST /internal/auth/validate`
  - [x] `POST /internal/auth/admin`
- [x] **Middleware**
  - [x] Request logging middleware
  - [x] CORS middleware
  - [x] Auth middleware (JWT verification & context extraction)
- [x] **Testing**
  - [x] Unit tests untuk service layer (`auth_service_test.go`)
  - [x] Unit tests untuk repository layer (`user_repository_test.go`)
  - [x] Unit tests untuk handler layer (`auth_handler_test.go`)
  - [x] Unit tests untuk middleware layer (`auth_middleware_test.go`, `cors_middleware_test.go`)
  - [x] Integration test (`integration_test.go`) — E2E HTTP flow test

### 3.2 Product Service — Implementasi Penuh
- [x] **Database**
  - [x] Migration: Create `products` table
  - [x] Repository layer (CRUD products)
  - [x] Seed data (minimal 50-100 produk)
- [x] **Business Logic**
  - [x] List products (pagination, filter)
  - [x] Get product by ID
  - [x] Create / Update / Delete product
  - [x] Cache invalidation logic
- [x] **HTTP Handlers**
  - [x] `GET /api/v1/products` (list, paginated)
  - [x] `GET /api/v1/products/:id` ⭐
  - [x] `POST /api/v1/products`
  - [x] `PUT /api/v1/products/:id`
  - [x] `DELETE /api/v1/products/:id`
  - [x] `POST /internal/seed/products`
  - [x] `DELETE /internal/cache/products/:id`
- [x] **Custom Prometheus Metrics**
  - [x] `product_db_queries_total` (counter, label: product_id, operation)
  - [x] `product_handler_duration_seconds` (histogram)
  - [x] `product_cache_hits_total` / `product_cache_misses_total`
- [x] **Middleware**
  - [x] Auth middleware (JWT validation via auth-service)
  - [x] Request logging middleware
- [ ] **Testing**
  - [ ] Unit tests untuk service layer
  - [ ] Unit tests untuk repository layer
  - [ ] Integration test endpoint `GET /products/:id`


### 3.3 KrakenD API Gateway
- [x] **Konfigurasi Dasar**
  - [x] `krakend.json` dengan route mapping semua endpoint
  - [x] JWT validation pada endpoint yang memerlukan auth (KrakenD plugin)
  - [x] CORS configuration
  - [x] Rate limiting
  - [x] Timeout & circuit breaker per backend
- [x] **Konfigurasi Coalescing**
  - [x] Konfigurasi mode **Coalescing ON** (via internal singleflight product-service)
  - [x] Konfigurasi mode **Coalescing OFF** (baseline)
  - [x] Mekanisme toggle/switch antara dua mode (separate endpoint /coalesced)
- [x] **Metrics**
  - [x] Expose KrakenD metrics ke Prometheus (Port 9091)
- [x] **Testing**
  - [x] Verifikasi routing untuk semua endpoint
  - [x] Verifikasi JWT validation bekerja
  - [x] Verifikasi coalescing ON vs OFF berfungsi

### 3.4 Client Application
- [x] **Pages**
  - [x] Home page dengan produk unggulan (Mock UI diubah jadi Fetch Live API)
  - [x] Product List page (pagination, search, filter - Live API)
  - [x] Product Detail page
  - [x] Login & Register page
  - [x] Cart page (client-side state)
  - [x] Checkout page (integrasi Midtrans Snap) - Partially done (UI implemented, awaiting payment service)
  - [x] Admin Dashboard (CRUD Products)
  - [x] Order History page (customer: own orders)
  - [x] Admin: All Orders page (admin: semua order)
- [x] **Auth Integration**
  - [x] Login/Register flow dengan JWT
  - [x] Protected routes (redirect ke login)
  - [x] Auth context/provider
- [x] **API Integration**
  - [x] API client/service layer (fetch via gateway)
  - [x] Error handling & loading states
- [ ] **Dockerfile**
  - [ ] Multi-stage build untuk Next.js

### 3.5 Order Service — Implementasi Penuh
- [x] **Database**
  - [x] Migration: Create `orders` table
  - [x] Migration: Create `order_items` table
  - [x] Repository layer (CRUD orders + order items, interface + PostgreSQL implementation)
- [x] **Business Logic**
  - [x] Create order: validasi items, snapshot harga/nama dari product-service, hitung total
  - [x] Get order by ID: ownership check (customer hanya bisa lihat miliknya)
  - [x] List orders: customer filtered by user_id, admin lihat semua (pagination)
  - [x] Update order status: admin only, validasi status transition
  - [x] Inter-service call ke product-service (validasi produk & harga)
  - [ ] Inter-service call ke payment-service (create payment, terima callback) - Awaiting payment service
- [x] **HTTP Handlers**
  - [x] `POST /api/v1/orders` — Create order [AUTH]
  - [x] `GET /api/v1/orders` — List orders [AUTH] (customer: own, admin: all)
  - [x] `GET /api/v1/orders/:id` — Get order detail [AUTH] (customer: own only)
  - [x] `PATCH /api/v1/orders/:id/status` — Update status [AUTH, ADMIN]
  - [ ] `POST /internal/orders/:id/payment-status` — Callback dari payment-service (internal)
- [ ] **Custom Prometheus Metrics**
  - [ ] `order_created_total` (counter)
  - [ ] `order_status_changes_total` (counter, label: from_status, to_status)
  - [ ] `order_handler_duration_seconds` (histogram, label: method, route)
  - [ ] `order_db_queries_total` (counter, label: operation)
- [x] **Middleware**
  - [x] Auth middleware (JWT validation — parse token, extract user_id & role)
  - [x] RequireRole middleware (admin-only endpoints)
  - [x] CORS middleware
- [ ] **Testing**
  - [ ] Unit tests untuk service layer (create order, ownership check, status transition)
  - [ ] Unit tests untuk repository layer
  - [ ] Unit tests untuk handler layer
  - [ ] Integration test (E2E create order flow)

### 3.6 Payment Service — Implementasi Penuh
- [ ] **Database**
  - [x] Migration: Create `payments` table
  - [x] Repository layer (CRUD payments, interface + PostgreSQL implementation)
- [ ] **Business Logic**
  - [x] Create payment: generate Midtrans Snap token via Snap API
  - [x] Handle Midtrans webhook notification (signature verification)
  - [x] Get payment status by ID / by order_id
  - [x] Update payment status berdasarkan Midtrans notification
  - [x] Callback ke order-service saat status berubah (settlement → update order ke paid)
- [ ] **HTTP Handlers**
  - [x] `POST /api/v1/payments` — Create payment (internal, dari order-service)
  - [x] `GET /api/v1/payments/:id` — Get payment detail [AUTH]
  - [ ] `GET /api/v1/payments/order/:orderId` — Get payment by order ID [AUTH]
  - [ ] `POST /api/v1/payments/notification` — Midtrans webhook callback (public, verified by signature)
- [ ] **Midtrans Integration**
  - [x] HTTP client untuk Midtrans Snap API (`POST /snap/v1/transactions`)
  - [x] Signature verification untuk webhook (SHA512)
  - [x] Mapping Midtrans transaction_status ke internal payment status
- [ ] **Custom Prometheus Metrics**
  - [ ] `payment_created_total` (counter)
  - [ ] `payment_status_changes_total` (counter, label: status)
  - [ ] `payment_webhooks_received_total` (counter, label: transaction_status)
  - [ ] `payment_handler_duration_seconds` (histogram, label: method, route)
- [ ] **Middleware**
  - [x] Auth middleware (JWT validation — parse token, extract user_id - [ ] Auth middleware (JWT validation — parse token, extract user_id & role) role)
  - [x] CORS middleware
- [ ] **Testing**
  - [ ] Unit tests untuk service layer (create payment, webhook handling, signature verification)
  - [ ] Unit tests untuk repository layer
  - [ ] Unit tests untuk handler layer
  - [ ] Integration test (mock Midtrans API)

### 3.7 KrakenD — Update Route Mapping
- [x] Tambah route order-service endpoints ke `krakend.json`
- [x] Tambah route payment-service endpoints ke `krakend.json`
  - [x] `POST /api/v1/payments/notification` — public (webhook Midtrans)
  - [x] `GET /api/v1/payments/order/{orderId}` — [AUTH]
- [x] Verifikasi routing untuk semua endpoint baru

### 3.8 Infrastructure Updates
- [x] Update `docker-compose.yml` — tambah order-db, payment-db, order-service, payment-service
- [x] Update `.env.example` — tambah env vars untuk order - [ ] Update `.env.example` — tambah env vars untuk order & payment service + Midtrans keys payment service + Midtrans keys
- [x] Update `prometheus.yml` — tambah scrape target order-service - [ ] Update `prometheus.yml` — tambah scrape target order-service & payment-service payment-service
- [x] Update dokumentasi (AGENTS.md, FEATURES.md)

---

## Fase 4: Observability Stack ✅

### 4.1 Prometheus
- [x] Buat `prometheus.yml` — scrape config untuk semua services
  - [x] auth-service
  - [x] product-service
  - [x] order-service
  - [x] payment-service
  - [x] KrakenD
- [x] Verifikasi semua target UP di Prometheus UI

### 4.2 Grafana Dashboard
- [x] Buat provisioning datasource (Prometheus, Loki)
- [x] Buat provisioning dashboard config
- [x] Buat dashboard `request-coalescing.json` untuk eksperimen
- [x] Buat dashboard per-service (latency, throughput, error rate)
- [x] Buat dashboard infrastructure (CPU, memory per container)
- [x] Verifikasi provisioning otomatis datasource & dashboard

### 4.3 Loki + Alloy
- [x] Setup Loki untuk log aggregation
- [x] Setup Alloy sebagai log collector dari semua container
- [x] Konfigurasi Grafana datasource untuk Loki
- [x] Verifikasi log bisa diquery dari Grafana Explore
- [x] Tambahkan Loki & Alloy ke docker-compose

### 4.4 Integrasi End-to-End Observability
- [x] Verifikasi metrics dari semua service terlihat di Grafana
- [x] Verifikasi log dari semua service terlihat di Grafana (Loki)
- [x] Correlate metrics dengan logs (filter by service, time range)

---

## Fase 5: Load Testing & Eksperimen Request Coalescing

### 5.1 Persiapan Test
- [ ] Seed database product-service dengan data yang cukup (100+ produk)
- [x] Verifikasi K6 script `product-hot-key.js` berjalan dengan benar (menggunakan product_detail_test.js)
- [x] Kalibrasi baseline performance (tanpa coalescing, low traffic)

### 5.2 Pengembangan Skenario K6 Tambahan
- [ ] `mixed-product-traffic.js` — request ke berbagai produk (Zipfian distribution)
- [ ] `full-user-journey.js` — Register → Login → Browse → Cart → Checkout → Payment
- [ ] `auth-stress.js` — burst login request
- [ ] `sustained-load.js` — ramp-up gradual untuk menemukan titik saturasi

### 5.3 Eksperimen Coalescing
- [x] **Baseline (Coalescing OFF)**
  - [x] Jalankan semua skenario K6 dengan coalescing OFF
  - [x] Catat hasil: latency (p50/p95/p99), throughput, error rate
  - [x] Screenshot/export dashboard Grafana
  - [x] Catat `product_db_queries_total` (backend hit rate)
- [x] **Experiment (Coalescing ON)**
  - [x] Switch KrakenD ke mode coalescing ON (diimplementasikan via /coalesced dengan singleflight)
  - [x] Jalankan skenario K6 yang sama
  - [x] Catat hasil yang sama
  - [x] Screenshot/export dashboard Grafana
  - [x] Catat `product_db_queries_total` (backend hit rate)
- [ ] **Analisis Perbandingan**
  - [ ] Bandingkan latency coalescing ON vs OFF
  - [ ] Bandingkan throughput coalescing ON vs OFF
  - [ ] Bandingkan backend hit rate (reduction %)
  - [ ] Bandingkan resource utilization
  - [ ] Dokumentasikan temuan di `EXPERIMENT_RESULTS.md`

---

## Fase 6: Deployment ke GKE (Kubernetes)

### 6.1 Persiapan
- [ ] Buat GKE cluster (atau gunakan existing)
- [ ] Setup `kubectl` context
- [ ] Buat namespace `request-coalescing`
- [ ] Setup Container Registry (Artifact Registry) untuk push Docker images
- [ ] Buat direktori `/k8s` untuk manifest

### 6.2 Manifest Kubernetes
- [ ] **Database**
  - [ ] PostgreSQL StatefulSet (atau Cloud SQL) untuk setiap service (4 database)
  - [ ] PersistentVolumeClaim untuk data PostgreSQL
  - [ ] Secrets untuk database credentials
- [ ] **Microservices**
  - [ ] Deployment + Service untuk auth-service
  - [ ] Deployment + Service untuk product-service
  - [ ] Deployment + Service untuk order-service
  - [ ] Deployment + Service untuk payment-service
  - [ ] ConfigMap untuk environment variables
  - [ ] Secrets untuk JWT secret, Midtrans keys, dll
- [ ] **API Gateway**
  - [ ] Deployment + Service untuk KrakenD
  - [ ] ConfigMap untuk `krakend.json`
- [ ] **Observability**
  - [ ] Deployment untuk Prometheus (atau Managed Prometheus GKE)
  - [ ] Deployment untuk Grafana
  - [ ] Deployment untuk Loki + Alloy
  - [ ] ConfigMaps untuk konfigurasi
- [ ] **Networking**
  - [ ] Ingress (atau LoadBalancer Service) untuk external access
  - [ ] NetworkPolicy (opsional, untuk isolasi)
- [ ] **Autoscaling**
  - [ ] HPA untuk product-service
  - [ ] HPA untuk auth-service
  - [ ] HPA untuk order-service
  - [ ] HPA untuk payment-service
  - [ ] HPA untuk KrakenD

### 6.3 CI/CD (Opsional)
- [ ] GitHub Actions / Cloud Build pipeline
  - [ ] Build Docker images
  - [ ] Push ke Artifact Registry
  - [ ] Deploy ke GKE

### 6.4 Deployment & Verifikasi
- [ ] Build & push semua Docker images
- [ ] Apply semua manifest ke GKE
- [ ] Verifikasi semua pods running
- [ ] Verifikasi service-to-service communication
- [ ] Verifikasi Grafana dashboard & Prometheus targets
- [ ] Jalankan smoke test (K6 dengan VU rendah)

### 6.5 Eksperimen di GKE
- [ ] Jalankan eksperimen coalescing ON vs OFF di environment Kubernetes
- [ ] Bandingkan hasil GKE vs Docker Compose (lokal)
- [ ] Dokumentasikan hasil akhir

---

## Milestone Summary

| Fase | Nama                               | Target     | Status |
| ---- | ---------------------------------- | ---------- | ------ |
| 1    | Perencanaan & Inisialisasi         | ✅ Selesai  | ✅     |
| 2    | Setup Skeleton & Boilerplate       | ✅ Selesai  | ✅     |
| 3    | Implementasi API Gateway & Service | ✅ Selesai  | ✅     |
| 4    | Observability Stack                | ✅ Selesai  | ✅     |
| 5    | Load Testing & Eksperimen         | —          | 🔄     |
| 6    | Deployment ke GKE                  | —          | ⬜     |

---

> **Catatan:** Tanggal target bisa ditambahkan setelah estimasi effort dilakukan pada awal Fase 2.
