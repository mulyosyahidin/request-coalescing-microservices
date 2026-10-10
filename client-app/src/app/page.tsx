import { apiClient } from "@/lib/axios";
import { ProductsResponse, Product } from "@/types/product";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";

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
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-950">
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                Online store
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                Shop everyday products from home
              </h1>
              <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                Browse the catalog, add items to your cart, and check out when you are ready. Prices and stock come straight from the store.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/products"
                  className="inline-flex justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                >
                  Shop now
                </Link>
                <a
                  href="#featured"
                  className="inline-flex justify-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  See featured products
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              <div className="rounded-2xl bg-indigo-600 text-white p-6">
                <p className="text-sm font-medium text-indigo-100">1</p>
                <p className="mt-2 text-xl font-bold">Pick a product</p>
                <p className="mt-1 text-sm text-indigo-100">Open the catalog and check the price and stock.</p>
              </div>
              <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-6">
                <p className="text-sm font-medium text-gray-500">2</p>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Add to cart</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Keep shopping, then review everything in one place.</p>
              </div>
              <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-6">
                <p className="text-sm font-medium text-gray-500">3</p>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Check out</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Sign in, place the order, and follow it from your account.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Clear prices</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Every product shows its current price in rupiah.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Live stock</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">See what is available before you add it to the cart.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Order history</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Signed-in customers can review their own orders.</p>
          </div>
        </div>
      </section>

      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Featured products
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              A selection from the catalog that is available now.
            </p>
          </div>
          <Link
            href="/products"
            className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View all
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 font-medium">No products in the catalog yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Check back later, or open the product page.
            </p>
            <Link
              href="/products"
              className="inline-flex mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                <Link href={`/products/${p.id}`} className="block">
                  <div className="h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                    {p.photo_url ? (
                      <img
                        src={p.photo_url}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">No photo</span>
                    )}
                    {p.stock <= 5 && p.stock > 0 && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-10">
                        Low stock
                      </span>
                    )}
                    {p.stock <= 0 && (
                      <span className="absolute top-3 left-3 bg-gray-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-10">
                        Sold out
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-5 flex flex-col flex-grow">
                  <Link href={`/products/${p.id}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-2 line-clamp-1 hover:text-indigo-600">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 min-h-10">
                    {p.description || "No description."}
                  </p>
                  <p className={`text-xs font-medium mb-4 ${p.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                  </p>
                  <div className="mt-auto flex flex-col gap-3">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatRupiah(p.price)}
                    </div>
                    <AddToCartButton product={p} variant="list" showQuantity={false} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-2xl bg-indigo-600 text-white px-8 py-10 md:flex md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Ready to shop?</h2>
            <p className="mt-2 text-indigo-100 max-w-xl">
              Open the full catalog, choose what you need, and finish the order from your cart.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex mt-6 md:mt-0 justify-center px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition"
          >
            Browse catalog
          </Link>
        </div>
      </section>
    </div>
  );
}
