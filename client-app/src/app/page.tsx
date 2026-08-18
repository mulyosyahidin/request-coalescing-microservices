export default function HomePage() {
  const featuredProducts = [
    {
      id: "1",
      name: "Quantum Mechanical Keyboard RGB Pro",
      sku: "KB-HOTKEY-001",
      category: "Electronics",
      price: 129.99,
      originalPrice: 159.99,
      rating: 4.9,
      reviews: 1420,
      badge: "⭐ Hot-Key Target (ID: 1)",
      stock: 45,
      description: "Flagship mechanical keyboard with ultra-low latency optical switches. Prime candidate for burst traffic testing.",
    },
    {
      id: "2",
      name: "Ultra-Wide Gaming Monitor 34-inch 144Hz",
      sku: "MON-34-UW",
      category: "Monitors",
      price: 499.00,
      originalPrice: 599.00,
      rating: 4.8,
      reviews: 870,
      badge: "Bestseller",
      stock: 18,
      description: "Curved IPS display with HDR400 support and 1ms response time.",
    },
    {
      id: "3",
      name: "Noise-Cancelling Wireless Headphones Max",
      sku: "AUDIO-NC-PRO",
      category: "Audio",
      price: 249.50,
      originalPrice: 299.00,
      rating: 4.7,
      reviews: 620,
      badge: "Popular",
      stock: 30,
      description: "Studio-grade active noise cancellation with 40-hour battery life.",
    },
    {
      id: "4",
      name: "Ergonomic Aluminium Laptop Stand",
      sku: "ACC-STAND-04",
      category: "Accessories",
      price: 45.00,
      originalPrice: 55.00,
      rating: 4.6,
      reviews: 310,
      badge: "Deal",
      stock: 85,
      description: "Full rotation and height adjustable stand for all laptops up to 17 inches.",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/30 border border-indigo-400/30 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase text-indigo-200">
              <span>⚡ KrakenD Request Coalescing Lab</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              High-Concurrency <br />
              <span className="bg-gradient-to-r from-teal-300 to-indigo-200 bg-clip-text text-transparent">
                E-Commerce Architecture
              </span>
            </h1>

            <p className="text-lg text-indigo-100 max-w-xl leading-relaxed">
              Experience the power of <strong>Request Coalescing (Concurrent Request Collapsing)</strong>. 
              When thousands of users request the same hot-key product simultaneously, KrakenD coalesces identical backend requests into a single database hit.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="/products"
                className="px-6 py-3.5 bg-white dark:bg-gray-900 text-indigo-900 dark:text-indigo-100 font-semibold rounded-xl hover:bg-indigo-50 shadow-lg shadow-indigo-950/20 transition-all"
              >
                Browse Mock Catalog
              </a>
              <a
                href="#coalescing-info"
                className="px-6 py-3.5 bg-indigo-700/50 hover:bg-indigo-700/80 border border-indigo-400/30 text-white font-semibold rounded-xl backdrop-blur transition"
              >
                How Coalescing Works
              </a>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 sm:p-8 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-sm font-semibold tracking-wide">Gateway Simulator</span>
              </div>
              <span className="text-xs bg-indigo-500/40 px-2.5 py-1 rounded-md text-indigo-200">
                GKE Parity Ready
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Client Traffic Inbound</span>
                  <span className="text-emerald-400 font-mono">1,000 req/s</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-indigo-400 h-2 rounded-full w-full"></div>
                </div>
              </div>

              <div className="flex justify-center my-1 text-indigo-300">
                <span className="text-xs font-mono">↓ KrakenD Request Deduplication ↓</span>
              </div>

              <div className="bg-emerald-950/40 rounded-xl p-4 border border-emerald-500/30">
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span className="text-emerald-300 font-medium">Backend Hits (Coalescing ON)</span>
                  <span className="text-emerald-300 font-mono font-bold">1 Backend Req</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full w-1/12"></div>
                </div>
                <p className="text-[11px] text-emerald-200 mt-2">
                  🎉 99.9% database load reduction on hot product queries!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-sm font-bold tracking-wider text-indigo-600 uppercase">
              Mock Catalog
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
              Featured Products & Hot Keys
            </h2>
          </div>
          <a
            href="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
          >
            View all products
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
            >
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gradient-to-tr from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4 relative">
                <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                  {p.badge}
                </span>
                <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-gray-800/80 shadow-sm flex items-center justify-center text-gray-400 font-bold text-lg group-hover:scale-105 transition-transform">
                  #{p.id}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-2">{p.sku}</span>
              </div>

              {/* Product Content */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="text-xs text-indigo-600 font-medium mb-1">{p.category}</div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2 line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                  {p.description}
                </p>

                {/* Rating & Stock */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center text-amber-500 font-medium">
                    ★ <span className="text-gray-700 dark:text-gray-300 ml-1">{p.rating}</span>
                    <span className="text-gray-400 ml-1">({p.reviews})</span>
                  </div>
                  <span className="text-emerald-600 font-medium">{p.stock} in stock</span>
                </div>

                {/* Price & Action */}
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <div className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                      ${p.price.toFixed(2)}
                    </div>
                    {p.originalPrice && (
                      <div className="text-xs text-gray-400 line-through">
                        ${p.originalPrice.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <a
                    href="/products"
                    className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
                  >
                    Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Request Coalescing Explanation Section */}
      <section id="coalescing-info" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-wider text-indigo-400 uppercase">
              Architecture Concept
            </span>
            <h2 className="text-3xl font-extrabold mt-2">
              Request Coalescing vs Traditional Gateway
            </h2>
            <p className="text-sm text-gray-300 mt-3">
              How KrakenD API Gateway handles hot-key bursts during high-traffic flash sales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Without Coalescing */}
            <div className="bg-white/5 rounded-2xl p-6 border border-red-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm">
                  ✕
                </span>
                <div>
                  <h3 className="font-bold text-white text-base">Without Coalescing (Baseline)</h3>
                  <p className="text-xs text-gray-400">1:1 Client-to-Backend Passthrough</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>1000 concurrent requests trigger 1000 backend database queries.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>PostgreSQL connection pool exhaustion during flash sales.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>High tail latency (p99) and increased CPU / memory spike.</span>
                </li>
              </ul>
            </div>

            {/* With Coalescing */}
            <div className="bg-white/5 rounded-2xl p-6 border border-emerald-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  ✓
                </span>
                <div>
                  <h3 className="font-bold text-white text-base">With Request Coalescing (Active)</h3>
                  <p className="text-xs text-gray-400">Concurrent Request Deduplication</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>1000 concurrent requests collapsed into 1 single backend query.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Response distributed simultaneously to all waiting clients.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>Drastic reduction in database load and ultra-stable latencies.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
