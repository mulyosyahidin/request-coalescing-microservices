import { apiClient } from "@/lib/axios";
import { ProductsResponse, Product } from "@/types/product";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";

export default async function PublicProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const limit = 20;

  let products: Product[] = [];
  let total = 0;
  
  try {
    const res = await apiClient.get<ProductsResponse>(`/products?page=${page}&limit=${limit}`);
    if (res.data?.success) {
      products = res.data.data.items || [];
      total = res.data.data.total || 0;
    }
  } catch (error) {
    console.error("Failed to fetch public products:", error);
  }

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };
  
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
            &larr; Kembali ke Beranda
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Semua Produk ({total})</h1>
        </div>

        {products.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center shadow-sm">
            <p className="text-gray-500 dark:text-gray-400">Belum ada produk yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                <div className="h-48 bg-gradient-to-tr from-gray-100 to-gray-200 flex flex-col items-center justify-center relative overflow-hidden">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/80 dark:bg-gray-800/80 shadow-sm flex items-center justify-center text-gray-400 font-bold text-lg group-hover:scale-105 transition-transform z-10">
                      Tanpa gambar
                    </div>
                  )}
                  {p.stock <= 5 && p.stock > 0 && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm z-10">
                      Stok Menipis
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-2 line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-8">
                    {p.description || "Tidak ada deskripsi."}
                  </p>

                  <p className={`text-xs font-medium mb-4 ${p.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {p.stock > 0 ? `${p.stock} tersedia` : "Stok habis"}
                  </p>

                  <div className="mt-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                        {formatRupiah(p.price)}
                      </div>
                      <Link
                        href={`/products/${p.id}`}
                        className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
                      >
                        Detail
                      </Link>
                    </div>
                    <AddToCartButton product={p} variant="list" showQuantity={false} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-8 flex justify-center items-center gap-4">
            <Link 
              href={`/products?page=${page - 1}`} 
              className={`px-4 py-2 rounded-lg font-medium ${page === 1 ? 'pointer-events-none opacity-50 bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-600' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'}`}
            >
              Sebelumnya
            </Link>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Halaman {page} dari {totalPages}
            </span>
            <Link 
              href={`/products?page=${page + 1}`} 
              className={`px-4 py-2 rounded-lg font-medium ${page >= totalPages ? 'pointer-events-none opacity-50 bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-600' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'}`}
            >
              Selanjutnya
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
