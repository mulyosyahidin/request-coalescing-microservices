# AGENTS.md — Panduan AI Agent untuk Proyek RequestCoalescing

> **Terakhir diperbarui:** 2026-08-19 (order-service & payment-service update)
> **Status:** Fase Implementasi (Fase 3)

---

## 1. Identitas & Tujuan Proyek

Proyek ini adalah **aplikasi toko online (e-commerce) berbasis microservices** yang dibangun untuk keperluan eksperimen dan riset performa **request coalescing vs non-coalescing** pada API Gateway (KrakenD).

**Tujuan akhir:**
Mengukur dan membandingkan dampak fitur *request coalescing* (concurrent request collapsing) pada KrakenD terhadap latensi, throughput, dan efisiensi resource di lingkungan Kubernetes (GKE), dengan observabilitas penuh menggunakan Grafana stack.

---

## 2. Tech Stack

| Layer              | Teknologi                      | Catatan                                           |
| ------------------ | ------------------------------ | ------------------------------------------------- |
| API Gateway        | **KrakenD**                    | Konfigurasi coalescing & non-coalescing           |
| Microservices      | **Go (Golang)**                | auth-service, product-service, order-service, payment-service |
| Client Application | **Next.js**                    | SSR/CSR frontend (Runtime & PM: **Bun**)          |
| Load Testing       | **K6 (Grafana)**               | Skenario hot-key burst dan load test              |
| Observability      | **Grafana, Prometheus, Loki, Alloy** | Metrics, logs, dan tracing                  |
| Database           | **PostgreSQL**                 | Database per service (database-per-service pattern)|
| Containerization   | **Docker**                     | Multi-stage build per service                     |
| Orchestration      | **Kubernetes (GKE)**           | Deployment target akhir                           |

---

## 3. Struktur Direktori

```
RequestCoalescing/
├── api-gateway/            # Konfigurasi KrakenD (krakend.json, flexible config)
├── client-app/             # Next.js frontend
├── load-testing/           # Skenario load testing K6
├── microservices/
│   ├── auth-service/       # Autentikasi & otorisasi (JWT)
│   ├── product-service/    # CRUD produk & cache layer
│   ├── order-service/      # Manajemen pesanan (orders)
│   └── payment-service/    # Pembayaran via Midtrans Snap
├── observability/
│   ├── grafana/            # Dashboard & provisioning
│   │   ├── dashboards/     # JSON dashboard (request-coalescing.json, dll)
│   │   └── provisioning/   # Datasource & dashboard provisioning YAML
│   └── prometheus/         # prometheus.yml scrape config
├── AGENTS.md               # ← File ini
├── FEATURES.md             # Ruang lingkup fitur per service
├── PROGRESS.md             # Roadmap & checklist pengembangan
├── .env.example            # Template environment variables
└── .gitignore
```

---

## 4. Arsitektur Sistem

```
                    ┌─────────────┐
                    │  ClientApp  │
                    │  (Next.js)  │
                    └──────┬──────┘
                           │ HTTP
                    ┌──────▼──────┐
                    │ API Gateway │
                    │  (KrakenD)  │
                    └──┬──┬──┬──┬─┘
                       │  │  │  │
            ┌──────────┘  │  │  └──────────┐
            │             │  │             │
     ┌──────▼──────┐ ┌───▼──▼───┐  ┌──────▼──────┐
     │ auth-service│ │ product- │  │   order-    │
     │   (Go)      │ │ service  │  │  service    │
     │             │ │   (Go)   │  │   (Go)      │
     └──────┬──────┘ └────┬─────┘  └──┬─────┬────┘
            │             │           │     │
            │             │           │     │ HTTP
            │             │           │     ▼
     ┌──────▼──────┐ ┌────▼─────┐  ┌─▼────────────┐     ┌──────────┐
     │ PostgreSQL  │ │PostgreSQL│  │payment-service│────►│ Midtrans │
     │ (auth_db)   │ │(product) │  │   (Go)        │◄────│  (Snap)  │
     └─────────────┘ └──────────┘  └──┬─────┬──────┘     └──────────┘
                                      │     │                Webhook
                               ┌──────▼┐ ┌──▼────────┐
                               │ PgSQL │ │  PgSQL    │
                               │(order)│ │ (payment) │
                               └───────┘ └───────────┘

     ┌────────────────────────────────────────────┐
     │            Observability Layer              │
     │  Prometheus ← scrape ← services            │
     │  Loki ← logs via Alloy                     │
     │  Grafana ← visualisasi dashboard           │
     └────────────────────────────────────────────┘
```

---

## 5. Standar & Konvensi Kode

### 5.1. Golang Microservices

- **Layout proyek:** Ikuti [Standard Go Project Layout](https://github.com/golang-standards/project-layout).
  ```
  service-name/
  ├── cmd/
  │   └── main.go             # Entry point
  ├── internal/
  │   ├── config/             # Konfigurasi (env, viper)
  │   ├── handler/            # HTTP handler (transport layer)
  │   ├── middleware/         # HTTP middleware (auth, logging, cors)
  │   ├── model/              # Domain model / entity
  │   ├── repository/         # Data access layer (PostgreSQL)
  │   ├── service/            # Business logic layer
  │   └── router/             # Route definitions
  ├── migrations/             # SQL migration files
  ├── Dockerfile              # Multi-stage build
  ├── go.mod
  └── go.sum
  ```
- **HTTP Framework:** `net/http` stdlib atau `chi` router (ringan, idiomatic).
- **Database Driver:** `pgx` untuk PostgreSQL.
- **Migration:** `golang-migrate/migrate`.
- **Konfigurasi:** Environment variables (12-Factor App), dengan `.env` untuk development.
- **Logging:** Structured logging dengan `slog` (stdlib Go 1.21+).
- **Metrics:** `prometheus/client_golang` — expose `/metrics` endpoint.
- **Error handling:** Selalu wrap error dengan context. Jangan panic di goroutine.
- **Naming:** camelCase untuk variabel lokal, PascalCase untuk exported identifiers, snake_case untuk nama file.
- **Testing:** Table-driven tests. File test di package yang sama (`_test.go`).

### 5.2. API Design

- **Versioning:** Prefix `/api/v1/`.
- **Format:** JSON (Content-Type: `application/json`).
- **HTTP status codes:** Gunakan semantik yang benar (200, 201, 400, 401, 403, 404, 500).
- **Response format standar:**
  - **Success:**
    ```json
    {
      "success": true,
      "message": "Product retrieved successfully",
      "data": { ... }
    }
    ```
  - **Error:**
    ```json
    {
      "success": false,
      "message": "Product with ID 42 not found",
      "error": {
        "code": "PRODUCT_NOT_FOUND"
      }
    }
    ```
- **Pagination:** Query params `?page=1&limit=20`, response include `total`, `page`, `limit` di dalam objek `data`.
- **Authentication:** Bearer JWT token via `Authorization` header.

### 5.3. KrakenD API Gateway

- **Konfigurasi:** `krakend.json` dengan flexible config templates jika kompleks.
- **Dua mode operasi:** Buat konfigurasi terpisah atau toggle untuk:
  1. **Coalescing ON** — `concurrent_calls` + backend request deduplication.
  2. **Coalescing OFF** — Setiap request diteruskan langsung ke backend.
- **Endpoint mapping:** Gateway menerjemahkan public endpoint ke internal service endpoint.
- **Timeout & Retry:** Konfigurasi `timeout`, `max_rate`, `cache_ttl` secara eksplisit.

### 5.4. Next.js Client App

- **Runtime & Package Manager:** **Bun** (`bun`) untuk semua manajemen package (`bun add`, `bun install`, `bun remove`) dan eksekusi scripts (`bun run dev`, `bun run build`, `bunx`). JANGAN gunakan `npm`, `yarn`, atau `pnpm`.
- **Versi:** Next.js 14+ (App Router).
- **Styling:** Tailwind CSS.
- **State Management:** React hooks + context (atau Zustand jika kompleks).
- **API calls:** Semua request melalui KrakenD gateway, BUKAN langsung ke microservice.
- **Pages utama:** Home, Product List, Product Detail, Cart, Checkout, Login/Register.

### 5.5. Docker & Kubernetes

- **Dockerfile:** Multi-stage build (builder → scratch/distroless).
- **Image tag:** Gunakan semantic versioning atau git SHA.
- **K8s manifests:** Per-service: Deployment, Service, ConfigMap, Secret, HPA.
- **Namespace:** `request-coalescing` (atau `rc-experiment`).
- **Resource limits:** Selalu set `requests` dan `limits` untuk CPU/memory.

### 5.6. Autentikasi & Otorisasi (RBAC)

Proyek ini menerapkan **Role-Based Access Control (RBAC) sederhana** dengan dua role:

#### Definisi Role

| Role       | Deskripsi                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------- |
| `admin`    | Akses penuh: CRUD produk, kelola semua order, lihat semua payment.                             |
| `customer` | Akses terbatas: registrasi/login, lihat produk (read-only), buat & lihat order sendiri, bayar. |

#### JWT Claims (Payload)

Setiap JWT yang diterbitkan oleh auth-service **WAJIB** menyertakan claim `role`:

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "customer",
  "exp": 1756000000,
  "iat": 1755913600
}
```

> **Penting:** Field `role` bersifat **mandatory** di JWT payload. Tanpa field ini, token dianggap invalid.

#### Strategi Enforcement Otorisasi

Otorisasi ditegakkan di **dua layer** yang saling melengkapi:

1. **Layer 1 — KrakenD API Gateway (Perimeter Guard):**
   - Melakukan JWT signature validation pada semua endpoint `[AUTH]`.
   - Meneruskan claims JWT (`sub`, `role`) ke backend service melalui header (e.g., `X-User-Id`, `X-User-Role`).
   - Opsional: menolak request di level gateway jika role tidak sesuai (misalnya, `customer` mengakses `POST /api/v1/products`).

2. **Layer 2 — Microservice (Business Logic Guard):**
   - **Setiap service WAJIB memvalidasi role di handler/middleware sendiri**, tidak boleh hanya mengandalkan gateway.
   - auth-service: Assign role `customer` sebagai default saat registrasi. Admin dibuat melalui seed data atau endpoint internal.
   - product-service: Endpoint write (`POST`, `PUT`, `DELETE`) hanya bisa diakses oleh role `admin`. Endpoint read (`GET`) bersifat public.
   - order-service: Customer hanya bisa membuat dan melihat order miliknya sendiri (`user_id` dari JWT `sub`). Admin bisa lihat semua order dan update status.
   - payment-service: Customer hanya bisa lihat payment miliknya. Webhook Midtrans diverifikasi via signature (bukan JWT).

#### Default Role & Admin Provisioning
- User baru yang registrasi via `POST /api/v1/auth/register` **selalu mendapat role `customer`**.
- Akun admin dibuat melalui **seed data** atau **endpoint internal** (`POST /internal/auth/admin`), TIDAK melalui endpoint registrasi public.
- Tidak ada fitur "upgrade role" via API public di tahap MVP.

---

## 6. Aturan Main untuk AI Agent

### 6.1. WAJIB

1. **Baca PROGRESS.md** sebelum memulai tugas untuk mengetahui fase saat ini.
2. **Baca FEATURES.md** untuk memahami scope fitur yang harus diimplementasi.
3. **Ikuti struktur direktori** yang sudah ditetapkan. Jangan buat direktori baru di root tanpa persetujuan.
4. **Satu service = satu Go module** (masing-masing punya `go.mod` sendiri).
5. **Jangan hardcode** credentials, port, atau host. Gunakan environment variables.
6. **Selalu expose `/health`** dan **`/metrics`** endpoint di setiap microservice.
7. **Update PROGRESS.md** setelah menyelesaikan satu item checklist.
8. **Tulis unit test** untuk setiap business logic baru (minimal happy path + error case).
9. **Gunakan Docker Compose** untuk development environment lokal.
10. **Jaga konsistensi** — jika satu service sudah menggunakan pattern tertentu, service lain harus mengikuti.
11. **Sertakan `role` di JWT claims** — setiap token yang diterbitkan auth-service wajib mengandung field `role` (`admin` atau `customer`).
12. **Validasi otorisasi di DUA layer** — gateway (KrakenD) DAN service handler/middleware. Jangan hanya mengandalkan satu layer.
14. **Format Response Standar** — Semua endpoint di seluruh service WAJIB mengembalikan JSON dengan envelope standar:
    - **Sukses:** `{"success": true, "message": "string", "data": { ... }}`
    - **Gagal/Error:** `{"success": false, "message": "string", "error": { "code": "ERROR_CODE" }}`
15. **Selalu gunakan Bun** — Seluruh eksekusi perintah JavaScript/TypeScript di frontend (`client-app`), termasuk package management (`bun add`, `bun install`) dan script runner (`bun run dev`, `bun run build`, `bunx`), WAJIB menggunakan `bun` alih-alih `npm`/`yarn`/`pnpm`.

### 6.2. DILARANG

1. ❌ Jangan mengubah arsitektur (menambah/menghapus service) tanpa persetujuan eksplisit.
2. ❌ Jangan menambahkan dependency eksternal besar tanpa justifikasi dan persetujuan.
3. ❌ Jangan menulis kode yang mengabaikan error (`_ = someFunc()`).
4. ❌ Jangan commit file `.env` atau credentials apapun.
5. ❌ Jangan bypass API Gateway dari client — semua traffic harus melalui KrakenD.
6. ❌ Jangan menulis SQL query langsung di handler — gunakan repository layer.
7. ❌ Jangan izinkan endpoint yang memerlukan role `admin` bisa diakses oleh `customer` — selalu cek role di middleware.
8. ❌ Jangan hardcode role di kode — gunakan constant atau enum. Jangan gunakan string literal `"admin"` / `"customer"` tersebar di banyak tempat.
9. ❌ Jangan izinkan registrasi publik menghasilkan role `admin` — admin hanya melalui seed atau endpoint internal.
10. ❌ Jangan mengembalikan response mentah/non-JSON (misal plain text `http.Error` bawaan Go) — semua response wajib JSON ber-envelope standar.
11. ❌ Jangan gunakan `npm`, `npx`, `yarn`, atau `pnpm` untuk client app — selalu gunakan `bun` atau `bunx`.

### 6.3. PRIORITAS KEPUTUSAN

Ketika menghadapi ambiguitas, gunakan urutan prioritas ini:
1. **Kesederhanaan** — Pilih solusi paling sederhana yang memenuhi requirement.
2. **Idiomatic Go** — Ikuti konvensi dan best practice komunitas Go.
3. **Observability** — Pastikan setiap operasi bisa di-trace, di-log, dan di-monitor.
4. **Testability** — Kode harus mudah di-test (dependency injection, interface).
5. **Performance** — Optimisasi hanya setelah ada data dari profiling/testing.

---

## 7. Environment Variables

Referensikan `.env.example` untuk template. Setiap service membutuhkan minimal:

| Variable             | Contoh                          | Keterangan                  |
| -------------------- | ------------------------------- | --------------------------- |
| `PORT`               | `8080`                          | Port HTTP service           |
| `DATABASE_URL`       | `postgres://user:pass@host/db`  | Connection string PostgreSQL|
| `JWT_SECRET`         | `super-secret-key`              | Secret untuk sign JWT       |
| `LOG_LEVEL`          | `info`                          | Level logging (debug/info)  |
| `ENVIRONMENT`        | `development`                   | development / production    |

---

## 8. Komunikasi Antar Service

- **Synchronous:** REST via HTTP melalui internal Docker/K8s network.
- **Service discovery (Docker Compose):** Gunakan nama container sebagai hostname (e.g., `http://product-service:8080`).
- **Service discovery (Kubernetes):** Gunakan Kubernetes Service DNS (e.g., `http://product-service.request-coalescing.svc.cluster.local`).
- **Tidak ada message broker** di tahap awal. Jika diperlukan event-driven, diskusikan terlebih dahulu.

### Pola Komunikasi Antar Service

```
order-service  ──► product-service     GET /api/v1/products/:id  (validasi produk & harga)
order-service  ──► payment-service     POST /api/v1/payments     (create payment)
payment-service ──► order-service      POST /internal/orders/:id/payment-status (callback)
payment-service ──► Midtrans (external) POST /snap/v1/transactions (create Snap token)
Midtrans        ──► payment-service    POST /api/v1/payments/notification (webhook)
```

---

## 9. Konteks Eksperimen Request Coalescing

### Apa itu Request Coalescing?
Ketika banyak client mengirim request identik (same endpoint, same params) secara bersamaan, API Gateway hanya meneruskan **satu request** ke backend dan membagikan response-nya ke semua client yang menunggu. Ini mengurangi beban backend secara drastis.

### Skenario Pengujian
1. **Hot-key burst:** Ratusan VU meminta produk yang sama (`/api/v1/products/1`) secara bersamaan.
2. **Mixed traffic:** Campuran request ke berbagai produk dengan distribusi Zipfian.
3. **Baseline (coalescing OFF):** Semua request diteruskan langsung tanpa deduplication.
4. **Experiment (coalescing ON):** Request identik digabungkan di KrakenD.

### Metrik yang Diukur
- Response time (p50, p95, p99)
- Throughput (req/s)
- Backend hit rate (berapa request yang benar-benar sampai ke service)
- Resource utilization (CPU, memory) di pod Kubernetes
- Error rate

---

## 10. Referensi

- [KrakenD Documentation](https://www.krakend.io/docs/)
- [KrakenD Concurrent Requests](https://www.krakend.io/docs/endpoints/concurrent-requests/)
- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
- [K6 Documentation](https://grafana.com/docs/k6/latest/)
- [Grafana Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [Midtrans Snap Documentation](https://docs.midtrans.com/docs/snap-integration)
- [Midtrans Sandbox Testing](https://docs.midtrans.com/docs/testing-payment-on-sandbox)
