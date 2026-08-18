export default function ProductsPage() {
  const mockProducts = [
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
      description: "Flagship mechanical keyboard with ultra-low latency optical switches. The primary target for high-concurrency coalescing load tests.",
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
      description: "Curved IPS display with HDR400 support and 1ms response time for immersive gaming and productivity.",
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
      description: "Studio-grade active noise cancellation with 40-hour battery life and multi-device Bluetooth pairing.",
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
      description: "Full rotation and height adjustable stand built with aircraft-grade aluminium alloy.",
    },
    {
      id: "5",
      name: "Pro Wireless Gaming Mouse 26K DPI",
      sku: "MOUSE-PRO-RGB",
      category: "Electronics",
      price: 79.99,
      originalPrice: 99.99,
      rating: 4.9,
      reviews: 1150,
      badge: "High Demand",
      stock: 60,
      description: "Ultra-lightweight 58g ergonomic mouse with optical switches and sub-1ms wireless latency.",
    },
    {
      id: "6",
      name: "Smart 4K Web Camera with Dual Mic",
      sku: "CAM-4K-AI",
      category: "Accessories",
      price: 119.00,
      originalPrice: 149.00,
      rating: 4.5,
      reviews: 440,
      badge: "Sale",
      stock: 22,
      description: "Auto-framing AI 4K webcam with dual noise-filtering omnidirectional microphones.",
    },
    {
      id: "7",
      name: "Hi-Res Studio Reference Monitors Pair",
      sku: "SPK-REF-PRO",
      category: "Audio",
      price: 320.00,
      originalPrice: 380.00,
      rating: 4.8,
      reviews: 290,
      badge: "Staff Pick",
      stock: 12,
      description: "Bi-amplified studio nearfield monitor pair delivering flat frequency response for mixing.",
    },
    {
      id: "8",
      name: "USB-C Thunderbolt 4 Docking Station 14-in-1",
      sku: "DOCK-TB4-14",
      category: "Accessories",
      price: 189.99,
      originalPrice: 229.99,
      rating: 4.7,
      reviews: 510,
      badge: "Bestseller",
      stock: 40,
      description: "Dual 4K 60Hz display support, 96W Power Delivery, Gigabit Ethernet, and SD 4.0 card slots.",
    },
  ];

  const categories = ["All Products", "Electronics", "Audio", "Monitors", "Accessories"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Breadcrumb */}
      <div>
        <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          Catalog Explorer
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Products Catalog
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Browse mock product items designed for KrakenD request deduplication and concurrent traffic benchmarks.
        </p>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Mock */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search mock products..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((c, i) => (
            <button
              key={c}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                i === 0
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort Dropdown Mock */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">Sort by:</span>
          <select className="text-xs font-medium bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Featured & Hot-Keys</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Hot-Key Callout Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-300/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-xs font-bold text-amber-900 uppercase">
              Benchmark Hot-Key: Product ID #1
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              In K6 load tests, <code>GET /api/v1/products/1</code> receives 1,000+ VU bursts to measure KrakenD request collapsing efficacy.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-2xs text-gray-700 dark:text-gray-300 font-semibold whitespace-nowrap">
          SKU: KB-HOTKEY-001
        </span>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
          >
            {/* Product Card Image Placeholder */}
            <div className="h-44 bg-gradient-to-tr from-slate-100 to-gray-200 flex flex-col items-center justify-center p-4 relative">
              <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                {p.badge}
              </span>
              <div className="w-14 h-14 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm flex items-center justify-center text-gray-400 font-bold text-base group-hover:scale-105 transition-transform">
                #{p.id}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-1.5">{p.sku}</span>
            </div>

            {/* Product Details */}
            <div className="p-5 flex flex-col flex-grow">
              <div className="text-[11px] text-indigo-600 font-bold uppercase tracking-wider mb-1">
                {p.category}
              </div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1.5 line-clamp-1">
                {p.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                {p.description}
              </p>

              {/* Rating & Stock */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center text-amber-500 font-medium">
                  ★ <span className="text-gray-700 dark:text-gray-300 ml-1">{p.rating}</span>
                  <span className="text-gray-400 ml-1">({p.reviews})</span>
                </div>
                <span className="text-emerald-600 font-medium text-[11px]">
                  {p.stock} units
                </span>
              </div>

              {/* Price & Action */}
              <div className="mt-auto flex items-center justify-between">
                <div>
                  <div className="text-base font-extrabold text-gray-900 dark:text-gray-100">
                    ${p.price.toFixed(2)}
                  </div>
                  {p.originalPrice && (
                    <div className="text-[11px] text-gray-400 line-through">
                      ${p.originalPrice.toFixed(2)}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Buy Mock
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mock Pagination */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-xs font-medium text-gray-600 dark:text-gray-400">
        <div>Showing 1 to 8 of 32 mock products</div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            Previous
          </button>
          <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold">1</span>
          <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition">2</button>
          <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition">3</button>
          <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 transition">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
