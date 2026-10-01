package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	ProductDBQueriesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "product_db_queries_total",
			Help: "Total number of queries executed against the product database",
		},
		[]string{"operation"}, // e.g. "select_all", "select_one", "insert", "update", "delete"
	)

	ProductCacheHitsTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "product_cache_hits_total",
			Help: "Total number of cache hits for products",
		},
	)

	ProductCacheMissesTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "product_cache_misses_total",
			Help: "Total number of cache misses for products",
		},
	)

	ProductHandlerDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "product_handler_duration_seconds",
			Help:    "Histogram of response latency (seconds) of product handlers.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "route"},
	)
)
