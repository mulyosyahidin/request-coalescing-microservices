# FEATURES.md — Ruang Lingkup Fitur Proyek RequestCoalescing

> **Terakhir diperbarui:** 2026-08-19
> **Status:** Fase Implementasi (Fase 3)

---

## Ringkasan

Dokumen ini menjabarkan tanggung jawab, fitur awal, dan gambaran endpoint untuk setiap service dan komponen dalam proyek. Scope dibatasi pada **MVP (Minimum Viable Product)** yang cukup untuk menjalankan eksperimen request coalescing secara realistis.

---

## 1. Auth Service (`/microservices/auth-service`)

### Tanggung Jawab
Menangani registrasi, login, validasi token JWT, dan **pengelolaan role (RBAC)**. Menjadi satu-satunya service yang menerbitkan dan memverifikasi token autentikasi. Setiap JWT yang diterbitkan wajib menyertakan claim `role` agar service lain bisa menerapkan otorisasi.

### Fitur Awal

| #   | Fitur                  | Deskripsi                                                                  |
| --- | ---------------------- | -------------------------------------------------------------------------- |
| A1  | Register               | User baru mendaftar dengan email & password (default role: `customer`)     |
| A2  | Login                  | User login, menerima access token (JWT) yang berisi claim `role`           |
| A3  | Token Validation       | Endpoint internal untuk service lain memvalidasi token & mengekstrak claims|
| A4  | Admin Seed/Provisioning| Mekanisme internal untuk membuat akun admin (seed data / endpoint internal)|
| A5  | Health Check           | Endpoint `/health` untuk readiness probe service dan PostgreSQL            |
| A6  | Metrics                | Endpoint `/metrics` untuk Prometheus scraping                              |

### Gambaran Endpoint

```
POST   /api/v1/auth/register          → Registrasi user baru (role = customer)
POST   /api/v1/auth/login             → Login, return JWT (berisi role)
POST   /internal/auth/validate        → Validasi token (internal, non-public)
POST   /internal/auth/admin           → Buat akun admin (internal, non-public)
GET    /health                         → Readiness check (termasuk koneksi PostgreSQL)
GET    /metrics                        → Prometheus metrics
```

### Data Model: `users`

| Field          | Type          | Keterangan                                |
| -------------- | ------------- | ----------------------------------------- |
| `id`           | UUID (PK)     | Primary key                               |
| `email`        | VARCHAR(255)  | Unique, not null                          |
| `password_hash`| VARCHAR(255)  | Bcrypt hash                               |
| `name`         | VARCHAR(100)  | Nama lengkap user                         |
| `role`         | VARCHAR(20)   | `admin` atau `customer`, default `customer`, not null |
| `created_at`   | TIMESTAMPTZ   | Waktu registrasi                          |
| `updated_at`   | TIMESTAMPTZ   | Waktu update terakhir                     |

### JWT Claims (Payload) — Spesifikasi RBAC

Setiap token JWT yang diterbitkan oleh auth-service **WAJIB** mengikuti struktur berikut:

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "customer",
  "exp": 1756000000,
  "iat": 1755913600
}
```

| Claim   | Type   | Keterangan                                                    |
| ------- | ------ | ------------------------------------------------------------- |
| `sub`   | string | User ID (UUID). Digunakan sebagai `user_id` di service lain.  |
| `email` | string | Email user.                                                   |
| `role`  | string | Role user: `admin` atau `customer`. **WAJIB ADA.**            |
| `exp`   | number | Expiration time (Unix timestamp). Default: 24 jam dari `iat`. |
| `iat`   | number | Issued-at time (Unix timestamp).                              |

### Catatan Teknis
- Password di-hash menggunakan `bcrypt` dengan cost factor minimal 10.
- **Registrasi publik (`POST /api/v1/auth/register`) SELALU menghasilkan role `customer`**. Tidak ada parameter `role` di request body registrasi publik — field ini di-set secara paksa oleh server.
- Akun admin dibuat melalui:
  - **Seed data**: SQL migration atau script yang dijalankan saat setup awal.
  - **Endpoint internal**: `POST /internal/auth/admin` — hanya dapat diakses dari jaringan internal, TIDAK diexpose melalui KrakenD.
- Token expiration: 24 jam (bisa dikonfigurasi via env var `JWT_EXPIRATION`).
- Endpoint `/internal/auth/validate` hanya diakses dari jaringan internal (service-to-service), mengembalikan decoded claims termasuk `role`.
- **Tidak ada fitur "upgrade role"** via API public di tahap MVP.

---

## 2. Product Service (`/microservices/product-service`)

### Tanggung Jawab
Mengelola data produk (CRUD). Menjadi **target utama** eksperimen request coalescing karena endpoint baca produk (`GET /products/:id`) akan menerima burst traffic tinggi.

### Fitur Awal

| #   | Fitur                       | Deskripsi                                                             |
| --- | --------------------------- | --------------------------------------------------------------------- |
| P1  | List Products               | Menampilkan daftar produk dengan pagination                           |
| P2  | Get Product by ID           | Menampilkan detail satu produk — **hot endpoint** untuk coalescing    |
| P3  | Create Product              | Menambah produk baru (admin-only)                                     |
| P4  | Update Product              | Mengubah data produk (admin-only)                                     |
| P5  | Delete Product              | Menghapus produk (admin-only)                                         |
| P6  | Seed Products               | Endpoint/script untuk populate data awal (testing)                    |
| P7  | Cache Invalidation (Internal)| Endpoint internal untuk reset cache (digunakan oleh K6 setup)        |
| P8  | Health Check                | Endpoint `/health` untuk readiness service dan PostgreSQL             |
| P9  | Metrics                     | Endpoint `/metrics` dengan custom metric (DB hit count, cache stats)  |

### Gambaran Endpoint

#### 🌐 Public (Tanpa Autentikasi)
```
GET    /api/v1/products               → List products (paginated)
GET    /api/v1/products/:id           → Get product by ID ⭐ HOT ENDPOINT
```
> Endpoint ini bisa diakses oleh siapapun (guest, customer, admin). Ini adalah target utama eksperimen request coalescing.

#### 🔒 Admin-Only (Role: `admin`)
```
POST   /api/v1/products               → Create product [AUTH, ADMIN]
PUT    /api/v1/products/:id           → Update product [AUTH, ADMIN]
DELETE /api/v1/products/:id           → Delete product [AUTH, ADMIN]
```
> Endpoint write hanya bisa diakses oleh user dengan role `admin`. Customer yang mencoba mengakses endpoint ini akan mendapat response `403 Forbidden`.

#### 🔧 Internal (Non-Public, Jaringan Internal)
```
POST   /internal/seed/products        → Seed data produk awal
DELETE /internal/cache/products/:id   → Invalidate cache untuk produk tertentu
```

#### ⚙️ Infrastruktur
```
GET    /health                         → Readiness check (termasuk koneksi PostgreSQL)
GET    /metrics                        → Prometheus metrics
```

### Data Model: `products`

| Field          | Type          | Keterangan                     |
| -------------- | ------------- | ------------------------------ |
| `id`           | SERIAL (PK)   | Auto-increment primary key    |
| `name`         | VARCHAR(255)  | Nama produk, not null          |
| `description`  | TEXT          | Deskripsi produk               |
| `price`        | DECIMAL(12,2) | Harga produk                   |
| `stock`        | INTEGER       | Jumlah stok                    |
| `category`     | VARCHAR(100)  | Kategori produk                |
| `image_url`    | VARCHAR(500)  | URL gambar produk              |
| `created_at`   | TIMESTAMPTZ   | Waktu dibuat                   |
| `updated_at`   | TIMESTAMPTZ   | Waktu update terakhir          |

### Catatan Teknis
- **`GET /api/v1/products/:id` adalah endpoint terpenting** — ini yang akan menerima burst traffic dari K6 dan menjadi subjek eksperimen coalescing.
- **Otorisasi RBAC:** Middleware di product-service harus membaca header `X-User-Role` (diteruskan oleh KrakenD dari JWT claims) dan menolak request write jika role ≠ `admin`. Validasi ini harus terjadi di service level, bukan hanya mengandalkan gateway.
- Tambahkan custom Prometheus counter: `product_db_queries_total` (label: `product_id`) untuk mengukur berapa kali query benar-benar sampai ke database.
- Tambahkan custom histogram: `product_handler_duration_seconds` untuk mengukur latency handler.
- Endpoint `/internal/cache/products/:id` (DELETE) sudah digunakan oleh K6 script yang ada ([`product-hot-key.js`](file:///Users/martinms/Projects/RequestCoalescing/load-testing/product-hot-key.js)) untuk reset cache sebelum test.
- In-memory cache opsional di level service (untuk membandingkan efek coalescing gateway vs cache service-level).

---

## 3. Order Service (`/microservices/order-service`)

### Tanggung Jawab
Mengelola pesanan (orders) dari customer. Bertanggung jawab atas lifecycle order mulai dari pembuatan hingga penyelesaian, termasuk komunikasi dengan product-service (validasi produk & harga) dan payment-service (pembayaran).

### Fitur Awal

| #   | Fitur                | Deskripsi                                                                       |
| --- | -------------------- | ------------------------------------------------------------------------------- |
| O1  | Create Order         | Buat pesanan baru — `user_id` diambil dari JWT `sub`, bukan dari request body   |
| O2  | Get Order by ID      | Lihat detail pesanan — customer hanya bisa lihat miliknya, admin bisa semua     |
| O3  | List User Orders     | Daftar pesanan — customer: miliknya saja, admin: seluruh order                  |
| O4  | Update Order Status  | Ubah status pesanan — hanya admin yang bisa mengubah status                     |
| O5  | Payment Callback     | Endpoint internal untuk menerima update status pembayaran dari payment-service  |
| O6  | Health Check         | Endpoint `/health` untuk readiness service dan PostgreSQL                       |
| O7  | Metrics              | Endpoint `/metrics`                                                             |

### Gambaran Endpoint

#### 🛒 Customer (Role: `customer`)
```
POST   /api/v1/orders                 → Create order [AUTH]
GET    /api/v1/orders                 → List own orders [AUTH] (filter by user_id dari JWT)
GET    /api/v1/orders/:id             → Get order detail [AUTH] (own order only)
```
> Customer yang mencoba mengakses order milik user lain akan mendapat response `404 Not Found` (untuk menghindari information leakage).

#### 👑 Admin (Role: `admin`)
```
GET    /api/v1/orders                 → List ALL orders [AUTH, ADMIN] (pagination)
GET    /api/v1/orders/:id             → Get ANY order detail [AUTH, ADMIN]
PATCH  /api/v1/orders/:id/status      → Update order status [AUTH, ADMIN]
```
> Admin bisa melihat dan mengelola seluruh order dari semua user. Endpoint `PATCH .../status` **hanya bisa diakses admin**.

#### 🔧 Internal (Non-Public, Jaringan Internal)
```
POST   /internal/orders/:id/payment-status  → Callback dari payment-service (update order berdasarkan payment status)
```

#### ⚙️ Infrastruktur
```
GET    /health                         → Readiness check (termasuk koneksi PostgreSQL)
GET    /metrics                        → Prometheus metrics
```

### Aturan Ownership & Data Isolation

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER ACCESS MATRIX                          │
├──────────────────────┬──────────────────┬───────────────────────┤
│ Operasi              │ Customer         │ Admin                 │
├──────────────────────┼──────────────────┼───────────────────────┤
│ Create Order         │ ✅ (own)         │ ✅                    │
│ Get Order by ID      │ ✅ (own only)    │ ✅ (any)              │
│ List Orders          │ ✅ (own only)    │ ✅ (all)              │
│ Update Order Status  │ ❌               │ ✅                    │
├──────────────────────┴──────────────────┴───────────────────────┤
│ "own" = order.user_id == JWT sub (token claim)                 │
└─────────────────────────────────────────────────────────────────┘
```

**Mekanisme enforcement:**
1. Saat **Create Order**: `user_id` di-set dari JWT claim `sub`, **BUKAN dari request body**. Ini mencegah customer membuat order atas nama user lain.
2. Saat **Get Order by ID**: Handler membaca `user_id` dari JWT `sub`, lalu query `WHERE id = :order_id AND user_id = :user_id`. Jika role `admin`, WHERE clause `user_id` tidak diterapkan.
3. Saat **List Orders**: Jika role `customer`, otomatis filter `WHERE user_id = :user_id`. Jika role `admin`, tampilkan semua (dengan pagination).
4. Saat **Update Order Status**: Middleware menolak request jika role ≠ `admin` (response `403 Forbidden`).

### Data Model

**Tabel `orders`:**

| Field          | Type          | Keterangan                              |
| -------------- | ------------- | --------------------------------------- |
| `id`           | UUID (PK)     | Primary key                             |
| `user_id`      | UUID (FK)     | ID user (dari JWT `sub`, referensi ke auth) — **diisi oleh server, bukan client** |
| `status`       | VARCHAR(20)   | pending_payment / paid / confirmed / shipped / completed / cancelled / expired |
| `total_amount` | DECIMAL(12,2) | Total harga pesanan                     |
| `created_at`   | TIMESTAMPTZ   | Waktu dibuat                            |
| `updated_at`   | TIMESTAMPTZ   | Waktu update terakhir                   |

**Tabel `order_items`:**

| Field          | Type          | Keterangan                              |
| -------------- | ------------- | --------------------------------------- |
| `id`           | UUID (PK)     | Primary key                             |
| `order_id`     | UUID (FK)     | Referensi ke orders                     |
| `product_id`   | UUID          | ID produk (referensi ke product-service)|
| `product_name` | VARCHAR(255)  | Snapshot nama produk saat order          |
| `price`        | DECIMAL(12,2) | Snapshot harga saat order                |
| `quantity`     | INTEGER       | Jumlah item                             |

### Status Flow

```
                 ┌──────────────────────────────────────────────────┐
                 │              ORDER STATUS FLOW                    │
                 │                                                  │
                 │  pending_payment ──► paid ──► confirmed           │
                 │       │                         │                 │
                 │       │                         ▼                 │
                 │       │                      shipped              │
                 │       │                         │                 │
                 │       ▼                         ▼                 │
                 │    expired               completed               │
                 │                                                  │
                 │  cancelled ◄── (dari status apapun               │
                 │                 kecuali completed)                │
                 └──────────────────────────────────────────────────┘
```

### Create Order Request Body

```json
{
  "items": [
    { "product_id": "uuid-produk-1", "quantity": 2 },
    { "product_id": "uuid-produk-2", "quantity": 1 }
  ]
}
```

> **Penting:** `user_id` TIDAK ada di request body — diambil dari JWT `sub` claim.

### Create Order Response

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "order-uuid",
      "user_id": "user-uuid",
      "status": "pending_payment",
      "total_amount": 150000.00,
      "items": [
        {
          "id": "item-uuid",
          "product_id": "product-uuid",
          "product_name": "Nama Produk",
          "price": 75000.00,
          "quantity": 2
        }
      ],
      "created_at": "2026-08-19T14:00:00Z",
      "updated_at": "2026-08-19T14:00:00Z"
    },
    "payment": {
      "id": "payment-uuid",
      "snap_token": "midtrans-snap-token-xxx",
      "snap_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/xxx"
    }
  }
}
```

### Inter-Service Communication

```
┌──────────────┐                         ┌─────────────────┐
│ order-service│ ── GET /api/v1/products/:id ──► │ product-service │
│              │     (validasi produk &    │                 │
│              │      ambil harga terkini) │                 │
└──────┬───────┘                         └─────────────────┘
       │
       │  POST /api/v1/payments
       │  (create payment, dapat snap_token)
       ▼
┌─────────────────┐
│ payment-service  │
│                  │ ── POST /internal/orders/:id/payment-status ──►
│ (callback saat   │     (update order status setelah pembayaran)
│  payment selesai)│
└─────────────────┘
```

### Catatan Teknis
- Order menyimpan **snapshot** harga dan nama produk pada saat order dibuat (tidak bergantung pada data live product-service).
- Status flow: `pending_payment` → `paid` → `confirmed` → `shipped` → `completed` (atau `cancelled` dari status apapun kecuali `completed`).
- **Semua endpoint order memerlukan JWT token valid** — tidak ada endpoint order yang bersifat public.
- **`user_id` pada order WAJIB diambil dari JWT `sub` claim**, tidak boleh dari request body. Ini adalah mekanisme keamanan fundamental untuk mencegah IDOR (Insecure Direct Object Reference).
- **Gunakan `404 Not Found`** untuk ownership violation — jangan gunakan `403 Forbidden` agar tidak bocor informasi keberadaan resource milik user lain.

---

## 4. Payment Service (`/microservices/payment-service`)

### Tanggung Jawab
Mengelola pembayaran melalui **Midtrans Snap**. Bertanggung jawab atas pembuatan transaksi pembayaran, penerimaan webhook notification dari Midtrans, dan callback ke order-service untuk update status order berdasarkan hasil pembayaran.

### Fitur Awal

| #   | Fitur                    | Deskripsi                                                                    |
| --- | ------------------------ | ---------------------------------------------------------------------------- |
| PM1 | Create Payment           | Buat transaksi pembayaran & generate Midtrans Snap token                     |
| PM2 | Get Payment Status       | Lihat status pembayaran berdasarkan payment ID                               |
| PM3 | Get Payment by Order ID  | Lihat status pembayaran berdasarkan order ID                                 |
| PM4 | Midtrans Webhook         | Terima & proses notification callback dari Midtrans (signature verification) |
| PM5 | Order Status Callback    | Notify order-service saat pembayaran berhasil/gagal/expired                  |
| PM6 | Health Check             | Endpoint `/health` untuk readiness service dan PostgreSQL                    |
| PM7 | Metrics                  | Endpoint `/metrics`                                                          |

### Gambaran Endpoint

#### 🔧 Internal (Dari order-service)
```
POST   /api/v1/payments               → Create payment & generate Snap token
```
> Dipanggil oleh order-service saat customer membuat order. Mengembalikan `snap_token` dan `snap_url` untuk redirect ke halaman pembayaran Midtrans.

#### 🔒 Authenticated (Role: `customer` / `admin`)
```
GET    /api/v1/payments/:id            → Get payment detail [AUTH]
GET    /api/v1/payments/order/:orderId → Get payment by order ID [AUTH]
```
> Customer hanya bisa melihat payment miliknya sendiri (validasi via user_id dari JWT).

#### 🌐 Public (Midtrans Webhook)
```
POST   /api/v1/payments/notification   → Midtrans webhook callback
```
> Endpoint ini dipanggil oleh server Midtrans. **Tidak memerlukan JWT** — otentikasi dilakukan melalui **signature verification** (SHA512).

#### ⚙️ Infrastruktur
```
GET    /health                         → Readiness check (termasuk koneksi PostgreSQL)
GET    /metrics                        → Prometheus metrics
```

### Midtrans Snap Integration Flow

```
┌──────────────┐     POST /api/v1/payments      ┌─────────────────┐     Snap API      ┌──────────┐
│ order-service│ ──────────────────────────────► │ payment-service  │ ────────────────► │ Midtrans │
│              │     { order_id, user_id,        │                  │                   │ Sandbox  │
│              │       amount, items, customer } │ 1. Simpan ke DB  │ ◄──────────────── │          │
│              │ ◄────────────────────────────── │ 2. Call Snap API │  { snap_token,    │          │
│              │     { snap_token, snap_url }    │ 3. Return token  │    snap_url }     │          │
└──────────────┘                                 └────────┬────────┘                   └────┬─────┘
                                                          │                                  │
       ┌─────────┐                                        │                                  │
       │ Client   │ ◄── snap_token diteruskan ────────────┘                                  │
       │ (Next.js)│ ──► Open Midtrans payment popup/redirect                                 │
       └─────────┘                                                                           │
                          │                                                                  │
                  Customer pilih metode & bayar                                              │
                          │                                                                  │
                          ▼                                                                  │
              ┌──────────────────────────────────────────────────────────────────────────────┘
              │ Midtrans kirim webhook notification
              ▼
       POST /api/v1/payments/notification
              │
              ▼
       ┌─────────────────┐     POST /internal/orders/:id/payment-status
       │ payment-service │ ──────────────────────────────────────────────────────────►
       │ 1. Verify sig   │                                                    ┌──────────────┐
       │ 2. Update DB    │                                                    │ order-service │
       │ 3. Notify order │                                                    │ Update status │
       └─────────────────┘                                                    └──────────────┘
```

### Create Payment Request Body (dari order-service)

```json
{
  "order_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "660e8400-e29b-41d4-a716-446655440001",
  "amount": 150000.00,
  "items": [
    {
      "id": "product-uuid-1",
      "name": "Wireless Mouse",
      "price": 75000.00,
      "quantity": 2
    }
  ],
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Create Payment Response

```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": "payment-uuid",
    "order_id": "order-uuid",
    "amount": 150000.00,
    "status": "pending",
    "snap_token": "midtrans-snap-token-xxx",
    "snap_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/xxx",
    "created_at": "2026-08-19T14:00:00Z"
  }
}
```

### Midtrans Webhook Notification Body (dari Midtrans)

```json
{
  "transaction_time": "2026-08-19 14:10:00",
  "transaction_status": "settlement",
  "transaction_id": "midtrans-txn-id",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "sha512-signature-string",
  "payment_type": "bank_transfer",
  "order_id": "order-uuid",
  "gross_amount": "150000.00",
  "fraud_status": "accept"
}
```

### Signature Verification

Payment-service **WAJIB** memverifikasi signature dari setiap webhook Midtrans:

```
signature = SHA512(order_id + status_code + gross_amount + server_key)
```

Jika signature tidak cocok, webhook harus ditolak dengan `403 Forbidden`.

### Data Model: `payments`

| Field                    | Type          | Keterangan                                            |
| ------------------------ | ------------- | ----------------------------------------------------- |
| `id`                     | UUID (PK)     | Primary key                                           |
| `order_id`               | UUID (UNIQUE) | Referensi ke order (1 order = 1 payment)              |
| `user_id`                | UUID          | ID user pemilik payment                               |
| `amount`                 | DECIMAL(12,2) | Total amount pembayaran                               |
| `status`                 | VARCHAR(20)   | pending / paid / expired / cancelled / denied         |
| `payment_method`         | VARCHAR(50)   | Metode bayar (diisi setelah customer pilih di Midtrans)|
| `midtrans_transaction_id`| VARCHAR(100)  | Transaction ID dari Midtrans                          |
| `snap_token`             | VARCHAR(255)  | Snap token untuk redirect                             |
| `snap_url`               | VARCHAR(500)  | Snap redirect URL                                     |
| `paid_at`                | TIMESTAMPTZ   | Waktu pembayaran berhasil                             |
| `expired_at`             | TIMESTAMPTZ   | Waktu payment expired                                 |
| `created_at`             | TIMESTAMPTZ   | Waktu dibuat                                          |
| `updated_at`             | TIMESTAMPTZ   | Waktu update terakhir                                 |

### Payment Status Flow

```
┌─────────────────────────────────────────────────────┐
│              PAYMENT STATUS FLOW                     │
│                                                     │
│  pending ──────► paid        (settlement/capture)    │
│     │                                                │
│     ├──────► expired     (expire)                    │
│     │                                                │
│     ├──────► cancelled   (cancel)                    │
│     │                                                │
│     └──────► denied      (deny)                      │
│                                                     │
│  Mapping Midtrans transaction_status:                │
│  ├─ settlement → paid                                │
│  ├─ capture    → paid                                │
│  ├─ expire     → expired                             │
│  ├─ cancel     → cancelled                           │
│  ├─ deny       → denied                              │
│  └─ pending    → pending (no change)                 │
└─────────────────────────────────────────────────────┘
```

### Catatan Teknis
- **Midtrans Snap** digunakan untuk pembayaran — customer akan di-redirect ke halaman pembayaran Midtrans atau membuka popup Snap.
- **Tidak menggunakan Midtrans Go SDK** — integrasi dilakukan via HTTP client stdlib (`net/http`) + JSON encoding untuk menjaga dependency tetap minimal.
- **Snap API endpoint:** `POST https://app.sandbox.midtrans.com/snap/v1/transactions` (sandbox) atau `POST https://app.midtrans.com/snap/v1/transactions` (production).
- **Authorization header untuk Snap API:** `Basic base64(SERVER_KEY + ":")`.
- **Webhook notification** dikirim oleh Midtrans ke `POST /api/v1/payments/notification`. Endpoint ini HARUS public (tidak memerlukan JWT) tapi HARUS melakukan **signature verification**.
- **Setelah payment berhasil (status `paid`)**, payment-service akan memanggil `POST /internal/orders/:id/payment-status` di order-service untuk mengupdate status order.
- **1 order = 1 payment** — relasi one-to-one. Jika payment expired, customer harus membuat order baru.
- **Environment:** Gunakan **Sandbox** untuk development, switch ke **Production** saat deploy.

---

## 5. API Gateway (`/api-gateway`)

### Tanggung Jawab
Menjadi single entry point untuk semua request dari client. Melakukan routing, rate limiting, dan — yang menjadi inti eksperimen — **request coalescing/deduplication**.

### Fitur & Konfigurasi

| #   | Fitur                       | Deskripsi                                                          |
| --- | --------------------------- | ------------------------------------------------------------------ |
| G1  | Route Mapping               | Map public endpoint ke backend service endpoint                    |
| G2  | JWT Validation              | Verifikasi JWT token pada endpoint yang memerlukan auth            |
| G3  | Rate Limiting               | Batasi request per detik per client                                |
| G4  | CORS                        | Konfigurasi CORS untuk ClientApp                                   |
| G5  | Request Coalescing (ON)     | Konfigurasi dengan `concurrent_calls` & backend deduplication      |
| G6  | Request Coalescing (OFF)    | Konfigurasi baseline tanpa coalescing                              |
| G7  | Metrics Export              | Export metrics KrakenD ke Prometheus                               |
| G8  | Logging                     | Structured logging ke stdout (dikumpulkan Loki via Alloy)          |
| G9  | JWT Claims Forwarding       | Meneruskan `sub` dan `role` dari JWT ke backend via custom headers |

### JWT Claims Forwarding (RBAC)

KrakenD harus mengekstrak claims dari JWT dan meneruskannya ke backend service melalui custom headers:

| JWT Claim | Header ke Backend | Keterangan                                   |
| --------- | ----------------- | -------------------------------------------- |
| `sub`     | `X-User-Id`       | UUID user, digunakan untuk ownership filter  |
| `role`    | `X-User-Role`     | `admin` atau `customer`, untuk otorisasi     |

> Backend service membaca header ini untuk menerapkan RBAC di level service. Gateway **tidak melakukan otorisasi role** — hanya meneruskan informasi. Otorisasi granular (admin vs customer) dilakukan di masing-masing service.

### Gambaran Route Mapping

```
Public Endpoint                         →   Backend Service                                     Access
─────────────────────────────────────────────────────────────────────────────────────────────────────────
POST   /api/v1/auth/register            →   auth-service:8080/api/v1/auth/register              PUBLIC
POST   /api/v1/auth/login               →   auth-service:8080/api/v1/auth/login                 PUBLIC
GET    /api/v1/products                  →   product-service:8080/api/v1/products                PUBLIC
GET    /api/v1/products/:id              →   product-service:8080/api/v1/products/:id            PUBLIC
POST   /api/v1/products                  →   product-service:8080/api/v1/products                [AUTH+ADMIN]
PUT    /api/v1/products/:id              →   product-service:8080/api/v1/products/:id            [AUTH+ADMIN]
DELETE /api/v1/products/:id              →   product-service:8080/api/v1/products/:id            [AUTH+ADMIN]
POST   /api/v1/orders                    →   order-service:8080/api/v1/orders                    [AUTH]
GET    /api/v1/orders                    →   order-service:8080/api/v1/orders                    [AUTH]
GET    /api/v1/orders/:id                →   order-service:8080/api/v1/orders/:id                [AUTH]
PATCH  /api/v1/orders/:id/status         →   order-service:8080/api/v1/orders/:id/status         [AUTH+ADMIN]
POST   /api/v1/payments/notification     →   payment-service:8080/api/v1/payments/notification   PUBLIC (webhook)
GET    /api/v1/payments/order/:orderId   →   payment-service:8080/api/v1/payments/order/:orderId [AUTH]
```

> **Legend:**
> - `PUBLIC` = tanpa autentikasi.
> - `[AUTH]` = memerlukan JWT valid (customer atau admin).
> - `[AUTH+ADMIN]` = memerlukan JWT valid **dan** role `admin`. Enforcement utama di service, gateway meneruskan claims.

---

## 6. Client Application (`/client-app`)

### Tanggung Jawab
Frontend Next.js yang menyediakan UI realistis untuk interaksi user dan juga berfungsi sebagai sumber traffic alami (selain K6 synthetic load).

### Halaman & Fitur Awal

| #   | Halaman           | Deskripsi                                                    | Akses         |
| --- | ----------------- | ------------------------------------------------------------ | ------------- |
| C1  | Home              | Landing page dengan produk unggulan                          | Public        |
| C2  | Product List      | Daftar produk dengan pagination dan filter kategori          | Public        |
| C3  | Product Detail    | Detail produk tunggal (linked ke hot endpoint)               | Public        |
| C4  | Cart              | Keranjang belanja (client-side state)                        | Public        |
| C5  | Checkout          | Form checkout, buat order & bayar via Midtrans Snap          | Customer+     |
| C6  | Login             | Halaman login                                                | Public        |
| C7  | Register          | Halaman registrasi                                           | Public        |
| C8  | Order History     | Daftar pesanan user yang login (own orders only)             | Customer+     |
| C9  | Admin: Products   | CRUD produk (Create, Update, Delete) — hanya visible untuk admin | Admin only |
| C10 | Admin: All Orders | Lihat semua order dari seluruh user — hanya visible untuk admin  | Admin only |

### Perilaku UI Berdasarkan Role

| Elemen UI                        | Guest (Belum Login) | Customer           | Admin             |
| -------------------------------- | ------------------- | ------------------ | ----------------- |
| Lihat produk                     | ✅                  | ✅                 | ✅                |
| Tombol "Add to Cart"             | ✅ (redirect login) | ✅                 | ✅                |
| Checkout                         | ❌ (redirect login) | ✅                 | ✅                |
| Order History (own)              | ❌                  | ✅                 | ✅                |
| Menu "Admin: Products"           | ❌ (hidden)         | ❌ (hidden)        | ✅                |
| Menu "Admin: All Orders"         | ❌ (hidden)         | ❌ (hidden)        | ✅                |
| Tombol Create/Edit/Delete Produk | ❌ (hidden)         | ❌ (hidden)        | ✅                |

### Catatan Teknis
- Semua API call melalui KrakenD gateway (`BASE_URL` dari env var).
- JWT token disimpan di `httpOnly` cookie atau secure localStorage.
- Gunakan React Server Components untuk data fetching pada halaman Product List dan Product Detail (memanfaatkan SSR).
- **Decode JWT di client** (tanpa verifikasi signature) untuk membaca `role` dan menampilkan/menyembunyikan elemen UI sesuai role. Ini hanya untuk UX — **enforcement sesungguhnya tetap di backend**.
- Halaman admin (`C9`, `C10`) dilindungi oleh middleware Next.js yang memeriksa role dari token. Jika bukan admin, redirect ke halaman utama.
- **Midtrans Snap** di-integrate via `snap.js` script di client. Setelah mendapat `snap_token` dari create order response, client membuka popup pembayaran Midtrans.

---

## 7. Load Testing (`/load-testing`)

### Tanggung Jawab
Menyediakan skenario load test K6 untuk menghasilkan traffic terukur dan mengukur dampak request coalescing.

### Skenario Test

| #   | Skenario                  | Deskripsi                                                        | Status        |
| --- | ------------------------- | ---------------------------------------------------------------- | ------------- |
| T1  | Hot-Key Burst             | Banyak VU request produk yang sama secara simultan               | ✅ Ada (`product-hot-key.js`) |
| T2  | Mixed Product Traffic     | Request ke berbagai produk dengan distribusi Zipfian             | 🔲 Belum      |
| T3  | Full User Journey         | Register → Login → Browse → Add to Cart → Checkout → Payment    | 🔲 Belum      |
| T4  | Auth Stress               | Burst login request untuk mengukur throughput auth-service       | 🔲 Belum      |
| T5  | Sustained Load            | Ramp-up gradual untuk menemukan titik saturasi                   | 🔲 Belum      |

### Script yang Sudah Ada
- [`product-hot-key.js`](file:///Users/martinms/Projects/RequestCoalescing/load-testing/product-hot-key.js): Burst test di mana semua VU request `GET /api/v1/products/1` secara bersamaan. Termasuk setup step untuk reset cache. Configurable via env vars `BASE_URL` dan `VUS`.

---

## 8. Observability (`/observability`)

### Tanggung Jawab
Menyediakan full-stack observability: metrics (Prometheus), logs (Loki), dan visualisasi (Grafana).

### Komponen & Fitur

| #   | Komponen            | Deskripsi                                                    | Status        |
| --- | ------------------- | ------------------------------------------------------------ | ------------- |
| O1  | Prometheus Config   | Scrape config untuk semua service                            | 🔲 Belum      |
| O2  | Grafana Provisioning| Auto-provision datasource & dashboard                        | 🔲 Belum      |
| O3  | Request Coalescing Dashboard | Dashboard Grafana untuk visualisasi eksperimen       | 🔲 Belum      |
| O4  | Loki + Alloy        | Agregasi log dari semua container                            | 🔲 Belum      |
| O5  | Per-Service Dashboard| Dashboard per-service (latency, throughput, errors)          | 🔲 Belum      |
| O6  | Alerting Rules      | Alert untuk error rate tinggi, latency anomaly               | 🔲 Opsional   |

### Metrik Kunci yang Harus Divisualisasikan

```
Experiment Metrics:
├── product_db_queries_total          → Backend hit rate (coalescing vs non-coalescing)
├── http_request_duration_seconds     → Latency distribution (p50, p95, p99)
├── http_requests_total               → Throughput per endpoint
├── http_response_status_total        → Error rate breakdown by status code
│
Service-Specific Metrics:
├── order_created_total               → Total orders created
├── order_status_changes_total        → Order status transitions
├── payment_created_total             → Total payments created
├── payment_webhooks_received_total   → Midtrans webhooks received
│
Infrastructure Metrics:
├── container_cpu_usage_seconds_total → CPU utilization per pod
├── container_memory_usage_bytes      → Memory utilization per pod
└── krakend_*                         → KrakenD internal metrics
```

---

## 9. Kubernetes & Deployment (`/k8s` — akan dibuat)

### Tanggung Jawab
Manifest Kubernetes untuk deployment semua komponen ke GKE.

### Komponen yang Dibutuhkan

| #   | Komponen                      | Deskripsi                                               |
| --- | ----------------------------- | ------------------------------------------------------- |
| K1  | Namespace                     | `request-coalescing` namespace                          |
| K2  | Service Deployments           | Deployment + Service untuk setiap microservice (4 svc)  |
| K3  | PostgreSQL StatefulSets       | StatefulSet atau Cloud SQL untuk database (4 db)        |
| K4  | KrakenD Deployment            | Deployment + Service + ConfigMap untuk gateway          |
| K5  | Grafana Stack Deployment      | Deployment untuk Grafana, Prometheus, Loki, Alloy       |
| K6  | ConfigMaps & Secrets          | Konfigurasi, credentials, dan Midtrans keys             |
| K7  | Ingress                       | Ingress controller untuk external access                |
| K8  | HPA (Horizontal Pod Autoscaler)| Autoscaling berdasarkan CPU/memory untuk service       |

---

## 10. Docker Compose (`docker-compose.yml`)

### Tanggung Jawab
Orkestrasi lokal untuk development dan testing. Menjalankan semua komponen dalam satu environment.

### Services yang Harus Di-compose

```yaml
# Komponen yang harus ada di docker-compose.yml:
services:
  - krakend           # API Gateway
  - auth-service      # + auth-db (PostgreSQL)
  - product-service   # + product-db (PostgreSQL)
  - order-service     # + order-db (PostgreSQL)
  - payment-service   # + payment-db (PostgreSQL)
  - prometheus        # Metrics collection
  - grafana           # Dashboard & visualisasi
  - loki              # Log aggregation
  - alloy             # Log collector / agent
```

---

## Catatan Prioritas

> **Fokus utama** proyek ini adalah menghasilkan data eksperimen yang valid untuk membandingkan performa request coalescing. Oleh karena itu, prioritas implementasi fitur adalah:
>
> 1. 🥇 **Product Service** — harus production-ready dengan metrics lengkap (target coalescing).
> 2. 🥈 **Auth Service** — cukup fungsional untuk JWT auth flow.
> 3. 🥉 **Order Service** — fungsional dasar untuk alur checkout, bukan fokus eksperimen.
> 4. 🏅 **Payment Service** — integrasi Midtrans Snap, fungsional dasar untuk pembayaran.
> 5. 🎖️ **Client App** — UI cukup untuk demo, bukan prioritas utama.
