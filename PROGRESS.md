# PROGRESS.md — Roadmap & Checklist Pengembangan

> **Terakhir diperbarui:** 2026-08-18
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
- [x] **Order Service**
  - [x] Inisialisasi Go module (`go mod init`)
  - [ ] Setup project layout (`cmd/`, `internal/`, `migrations/`) — *(dikerjakan di Fase 3.3)*
  - [x] Entry point `cmd/main.go` dengan HTTP server dasar
  - [ ] Konfigurasi loader (env vars) — *(dikerjakan di Fase 3.3)*
  - [x] Health check endpoint (`GET /health`)
  - [x] Metrics endpoint (`GET /metrics`)
  - [x] Dockerfile (multi-stage build)

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
- [ ] **Database**
  - [ ] Migration: Create `products` table
  - [ ] Repository layer (CRUD products)
  - [ ] Seed data (minimal 50-100 produk)
- [ ] **Business Logic**
  - [ ] List products (pagination, filter)
  - [ ] Get product by ID
  - [ ] Create / Update / Delete product
  - [ ] Cache invalidation logic
- [ ] **HTTP Handlers**
  - [ ] `GET /api/v1/products` (list, paginated)
  - [ ] `GET /api/v1/products/:id` ⭐
  - [ ] `POST /api/v1/products`
  - [ ] `PUT /api/v1/products/:id`
  - [ ] `DELETE /api/v1/products/:id`
  - [ ] `POST /internal/seed/products`
  - [ ] `DELETE /internal/cache/products/:id`
- [ ] **Custom Prometheus Metrics**
  - [ ] `product_db_queries_total` (counter, label: product_id, operation)
  - [ ] `product_handler_duration_seconds` (histogram)
  - [ ] `product_cache_hits_total` / `product_cache_misses_total`
- [ ] **Middleware**
  - [ ] Auth middleware (JWT validation via auth-service)
  - [ ] Request logging middleware
- [ ] **Testing**
  - [ ] Unit tests untuk service layer
  - [ ] Unit tests untuk repository layer
  - [ ] Integration test endpoint `GET /products/:id`

### 3.3 Order Service — Implementasi Penuh
- [ ] **Database**
  - [ ] Migration: Create `orders` dan `order_items` tables
  - [ ] Repository layer
- [ ] **Business Logic**
  - [ ] Create order (validasi stok via product-service)
  - [ ] Get order by ID
  - [ ] List user orders
  - [ ] Update order status (state machine)
- [ ] **HTTP Handlers**
  - [ ] `POST /api/v1/orders`
  - [ ] `GET /api/v1/orders/:id`
  - [ ] `GET /api/v1/orders`
  - [ ] `PATCH /api/v1/orders/:id/status`
- [ ] **Middleware**
  - [ ] Auth middleware
- [ ] **Testing**
  - [ ] Unit tests
  - [ ] Integration test

### 3.4 KrakenD API Gateway
- [ ] **Konfigurasi Dasar**
  - [x] `krakend.json` dengan route mapping semua endpoint
  - [ ] JWT validation pada endpoint yang memerlukan auth (KrakenD plugin)
  - [x] CORS configuration
  - [ ] Rate limiting
  - [ ] Timeout & circuit breaker per backend
- [ ] **Konfigurasi Coalescing**
  - [ ] Konfigurasi mode **Coalescing ON** (concurrent_calls, backend dedup)
  - [ ] Konfigurasi mode **Coalescing OFF** (baseline)
  - [ ] Mekanisme toggle/switch antara dua mode (env var atau file terpisah)
- [x] **Metrics**
  - [x] Expose KrakenD metrics ke Prometheus (Port 9091)
- [ ] **Testing**
  - [ ] Verifikasi routing untuk semua endpoint
  - [ ] Verifikasi JWT validation bekerja
  - [ ] Verifikasi coalescing ON vs OFF berfungsi

### 3.5 Client Application
- [ ] **Pages**
  - [x] Home page dengan produk unggulan (Mock UI)
  - [x] Product List page (pagination, search, filter - Mock UI)
  - [ ] Product Detail page
  - [x] Login & Register page (Mock UI)
  - [ ] Cart page (client-side state)
  - [ ] Checkout page
  - [ ] Order History page
- [ ] **Auth Integration**
  - [ ] Login/Register flow dengan JWT
  - [ ] Protected routes (redirect ke login)
  - [ ] Auth context/provider
- [ ] **API Integration**
  - [ ] API client/service layer (fetch via gateway)
  - [ ] Error handling & loading states
- [ ] **Dockerfile**
  - [ ] Multi-stage build untuk Next.js

---

## Fase 4: Observability Stack ✅

### 4.1 Prometheus
- [x] Buat `prometheus.yml` — scrape config untuk semua services
  - [x] auth-service
  - [x] product-service
  - [x] order-service
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
- [ ] Verifikasi K6 script `product-hot-key.js` berjalan dengan benar
- [ ] Kalibrasi baseline performance (tanpa coalescing, low traffic)

### 5.2 Pengembangan Skenario K6 Tambahan
- [ ] `mixed-product-traffic.js` — request ke berbagai produk (Zipfian distribution)
- [ ] `full-user-journey.js` — Register → Login → Browse → Cart → Checkout
- [ ] `auth-stress.js` — burst login request
- [ ] `sustained-load.js` — ramp-up gradual untuk menemukan titik saturasi

### 5.3 Eksperimen Coalescing
- [ ] **Baseline (Coalescing OFF)**
  - [ ] Jalankan semua skenario K6 dengan coalescing OFF
  - [ ] Catat hasil: latency (p50/p95/p99), throughput, error rate
  - [ ] Screenshot/export dashboard Grafana
  - [ ] Catat `product_db_queries_total` (backend hit rate)
- [ ] **Experiment (Coalescing ON)**
  - [ ] Switch KrakenD ke mode coalescing ON
  - [ ] Jalankan skenario K6 yang sama
  - [ ] Catat hasil yang sama
  - [ ] Screenshot/export dashboard Grafana
  - [ ] Catat `product_db_queries_total` (backend hit rate)
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
  - [ ] PostgreSQL StatefulSet (atau Cloud SQL) untuk setiap service
  - [ ] PersistentVolumeClaim untuk data PostgreSQL
  - [ ] Secrets untuk database credentials
- [ ] **Microservices**
  - [ ] Deployment + Service untuk auth-service
  - [ ] Deployment + Service untuk product-service
  - [ ] Deployment + Service untuk order-service
  - [ ] ConfigMap untuk environment variables
  - [ ] Secrets untuk JWT secret, dll
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
| 3    | Implementasi API Gateway & Service | —          | 🔄     |
| 4    | Observability Stack                | ✅ Selesai  | ✅     |
| 5    | Load Testing & Eksperimen         | —          | ⬜     |
| 6    | Deployment ke GKE                  | —          | ⬜     |

---

> **Catatan:** Tanggal target bisa ditambahkan setelah estimasi effort dilakukan pada awal Fase 2.
