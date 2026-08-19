import { apiClient } from "@/lib/axios";
import { ProductsResponse, Product } from "@/types/product";
import Link from "next/link";

export default async function Home() {
  let products: Product[] = [];
  try {
    const res = await apiClient.get<ProductsResponse>("/products?limit=8");
    if (res.data?.success) {
      products = res.data.data.items || [];
    }
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
  }

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-indigo-50 to-transparent dark:from-indigo-950/20 dark:to-transparent pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-6 border border-indigo-100 dark:border-indigo-800">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Live Architecture Demo
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-8">
              Microservices <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                Request Coalescing
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              Explore how our API Gateway deduplicates concurrent requests in real-time, eliminating backend bottlenecks during high-traffic flash sales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#coalescing-info"
                className="px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Learn How It Works
              </a>
              <Link
                href="/products"
                className="px-8 py-3.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Status Bar */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 transform origin-bottom -skew-y-1 opacity-90"></div>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gray-900 dark:bg-black flex items-center justify-center space-x-12 px-4 overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-mono whitespace-nowrap">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Gateway: Online
          </div>
          <div className="hidden sm:flex items-center gap-2 text-gray-400 text-sm font-mono whitespace-nowrap">
            <span>Coalescing Mode:</span>
            <span className="text-white bg-white/10 px-2 py-0.5 rounded">ACTIVE</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-gray-400 text-sm font-mono whitespace-nowrap">
            <span>Backend Load:</span>
            <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-2 rounded-full w-1/12"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-sm font-bold tracking-wider text-indigo-600 uppercase">
              Live Catalog
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
          >
            View all products
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
            >
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gradient-to-tr from-gray-100 to-gray-200 flex flex-col items-center justify-center relative overflow-hidden">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-gray-800/80 shadow-sm flex items-center justify-center text-gray-400 font-bold text-lg group-hover:scale-105 transition-transform z-10">
                    No Img
                  </div>
                )}
                {p.stock <= 5 && p.stock > 0 && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm z-10">
                    Low Stock
                  </span>
                )}
              </div>

              {/* Product Content */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2 line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-8">
                  {p.description || "No description provided."}
                </p>

                {/* Rating & Stock */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center text-amber-500 font-medium">
                    ★ <span className="text-gray-700 dark:text-gray-300 ml-1">5.0</span>
                  </div>
                  <span className={p.stock > 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                    {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                  </span>
                </div>

                {/* Price & Action */}
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatRupiah(p.price)}
                  </div>

                  <Link
                    href={`/products/${p.id}`}
                    className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
                  >
                    Details
                  </Link>
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
