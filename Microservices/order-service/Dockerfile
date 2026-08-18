# ==============================================================================
# Multi-stage Dockerfile untuk Golang Microservice
# Dirancang sesuai GKE Best Practices dan Standard Go Project Layout
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Builder
# ------------------------------------------------------------------------------
FROM golang:1.23-alpine AS builder

# Install SSL CA certificates dan tzdata
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy module files dan download dependencies untuk caching layer optimal
COPY go.mod go.sum* ./
RUN go mod download

# Copy source code
COPY . .

# Build arg untuk environment metadata
ARG VERSION=dev

# Compile binary secara statis
# - CGO_ENABLED=0: Disable cgo agar binary statically linked (wajib untuk distroless)
# - GOOS=linux GOARCH=amd64: Target Linux x86_64
# - -ldflags="-s -w": Strip debugging information untuk mengurangi size
# - -trimpath: Hapus path absolute dari host OS
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -trimpath \
    -ldflags="-s -w -X 'main.Version=${VERSION}'" \
    -o /app/bin/service ./cmd/main.go

# ------------------------------------------------------------------------------
# Stage 2: Runtime (Distroless)
# ------------------------------------------------------------------------------
# Menggunakan Distroless untuk security optimal:
# - Minimal attack surface (tanpa shell, tanpa package manager)
# - Otomatis berjalan sebagai 'nonroot' user (UID 65532)
FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /

# Copy binary dari stage builder
COPY --from=builder --chown=nonroot:nonroot /app/bin/service /service

# Copy CA certificates dan timezone data
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Pastikan container berjalan sebagai nonroot (sesuai GKE PodSecurityStandards)
USER nonroot:nonroot

# Expose port (default 8080)
EXPOSE 8080

ENTRYPOINT ["/service"]
