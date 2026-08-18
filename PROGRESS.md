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
  - [x] `/API-Gateway`
  - [x] `/ClientApp`
  - [x] `/K6`
  - [x] `/Microservices/auth-service`
  - [x] `/Microservices/product-service`
  - [x] `/Microservices/order-service`
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
- [ ] **Auth Service**
  - [x] Inisialisasi Go module (`go mod init`)
  - [ ] Setup project layout (`cmd/`, `internal/`, `migrations/`)
  - [x] Entry point `cmd/main.go` dengan HTTP server dasar
  - [ ] Konfigurasi loader (env vars)
  - [x] Health check endpoint (`GET /health`)
  - [ ] Metrics endpoint (`GET /metrics`)
  - [x] Dockerfile (multi-stage build)
- [ ] **Product Service**
  - [x] Inisialisasi Go module (`go mod init`)
  - [ ] Setup project layout (`cmd/`, `internal/`, `migrations/`)
  - [x] Entry point `cmd/main.go` dengan HTTP server dasar
  - [ ] Konfigurasi loader (env vars)
  - [x] Health check endpoint (`GET /health`)
  - [ ] Metrics endpoint (`GET /metrics`)
  - [x] Dockerfile (multi-stage build)
- [ ] **Order Service**
  - [x] Inisialisasi Go module (`go mod init`)
  - [ ] Setup project layout (`cmd/`, `internal/`, `migrations/`)
  - [x] Entry point `cmd/main.go` dengan HTTP server dasar
  - [ ] Konfigurasi loader (env vars)
  - [x] Health check endpoint (`GET /health`)
  - [ ] Metrics endpoint (`GET /metrics`)
  - [x] Dockerfile (multi-stage build)

### 2.2 Client Application Skeleton
- [x] Inisialisasi Next.js project (`npx create-next-app@latest`)
- [x] Setup Tailwind CSS
- [x] Konfigurasi environment variables (API gateway URL)
- [x] Layout dasar (header, footer, navigation)
- [x] Halaman placeholder (Home, Product List, Login)

### 2.3 Docker Compose
- [ ] `docker-compose.yml` untuk development environment
  - [ ] KrakenD service
  - [ ] auth-service + auth-db (PostgreSQL)
  - [ ] product-service + product-db (PostgreSQL)
  - [ ] order-service + order-db (PostgreSQL)
  - [ ] Prometheus
  - [ ] Grafana
  - [ ] Network configuration
- [ ] Verifikasi semua service bisa start dan saling berkomunikasi
- [ ] Dokumentasi cara menjalankan (`README.md` atau di `AGENTS.md`)

---

## Fase 3: Implementasi API Gateway & Microservices

### 3.1 Auth Service — Implementasi Penuh
- [x] **Database**
  - [x] Migration: Create `users` table
  - [x] Repository layer (CRUD user)
- [x] **Business Logic**
  - [x] Register: validasi input, hash password, simpan user
  - [x] Login: verifikasi credentials, generate JWT
  - [x] Token validation: parse & verify JWT
- [x] **HTTP Handlers**
  - [x] `POST /api/v1/auth/register`
  - [x] `POST /api/v1/auth/login`
  - [x] `POST /internal/auth/validate` (Digantikan oleh GET /me)
- [x] **Middleware**
  - [x] Request logging middleware
  - [ ] CORS middleware (Di-handle oleh KrakenD)
- [ ] **Testing**
  - [ ] Unit tests untuk service layer
  - [ ] Unit tests untuk repository layer
  - [ ] Integration test (handler → service → DB)

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
  - [ ] `krakend.json` dengan route mapping semua endpoint
  - [ ] JWT validation pada endpoint yang memerlukan auth
  - [ ] CORS configuration
  - [ ] Rate limiting
  - [ ] Timeout & circuit breaker per backend
- [ ] **Konfigurasi Coalescing**
  - [ ] Konfigurasi mode **Coalescing ON** (concurrent_calls, backend dedup)
  - [ ] Konfigurasi mode **Coalescing OFF** (baseline)
  - [ ] Mekanisme toggle/switch antara dua mode (env var atau file terpisah)
- [ ] **Metrics**
  - [ ] Expose KrakenD metrics ke Prometheus
- [ ] **Testing**
  - [ ] Verifikasi routing untuk semua endpoint
  - [ ] Verifikasi JWT validation bekerja
  - [ ] Verifikasi coalescing ON vs OFF berfungsi

### 3.5 Client Application
- [ ] **Pages**
  - [ ] Home page dengan produk unggulan
  - [ ] Product List page (pagination, filter)
  - [ ] Product Detail page
  - [ ] Login & Register page
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

## Fase 4: Observability Stack

### 4.1 Prometheus
- [ ] Buat `prometheus.yml` — scrape config untuk semua services
  - [ ] auth-service
  - [ ] product-service
  - [ ] order-service
  - [ ] KrakenD
- [ ] Verifikasi semua target UP di Prometheus UI

### 4.2 Grafana Dashboard
- [ ] Buat provisioning datasource (Prometheus, Loki)
- [ ] Buat provisioning dashboard config
- [ ] Buat dashboard `request-coalescing.json` untuk eksperimen
- [ ] Buat dashboard per-service (latency, throughput, error rate)
- [ ] Buat dashboard infrastructure (CPU, memory per container)
- [ ] Verifikasi provisioning otomatis datasource & dashboard

### 4.3 Loki + Alloy
- [ ] Setup Loki untuk log aggregation
- [ ] Setup Alloy sebagai log collector dari semua container
- [ ] Konfigurasi Grafana datasource untuk Loki
- [ ] Verifikasi log bisa diquery dari Grafana Explore
- [ ] Tambahkan Loki & Alloy ke docker-compose

### 4.4 Integrasi End-to-End Observability
- [ ] Verifikasi metrics dari semua service terlihat di Grafana
- [ ] Verifikasi log dari semua service terlihat di Grafana (Loki)
- [ ] Correlate metrics dengan logs (filter by service, time range)

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
| 2    | Setup Skeleton & Boilerplate       | —          | ⬜     |
| 3    | Implementasi API Gateway & Service | —          | ⬜     |
| 4    | Observability Stack                | —          | ⬜     |
| 5    | Load Testing & Eksperimen         | —          | ⬜     |
| 6    | Deployment ke GKE                  | —          | ⬜     |

---

> **Catatan:** Tanggal target bisa ditambahkan setelah estimasi effort dilakukan pada awal Fase 2.
