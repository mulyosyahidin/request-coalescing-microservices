# ==============================================================================
# Multi-stage Dockerfile untuk Golang Microservice
# Dirancang sesuai GKE Best Practices dan Standard Go Project Layout
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Builder
# ------------------------------------------------------------------------------
FROM golang:1.25-alpine AS builder

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
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -trimpath \
    -ldflags="-s -w -X 'main.Version=${VERSION}'" \
    -o /app/bin/service ./cmd/main.go

# ------------------------------------------------------------------------------
# Stage 2: Runtime (Distroless)
# ------------------------------------------------------------------------------
# Menggunakan Distroless untuk security optimal
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
