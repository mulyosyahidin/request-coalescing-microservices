import { apiClient } from "@/lib/axios";
import Link from "next/link";
import { ProductDetailResponse } from "@/types/product";
import { AddToCartButton } from "@/components/AddToCartButton";

export default async function PublicProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let product = null;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(id)) {
    try {
      const res = await apiClient.get<ProductDetailResponse>(`/products/${id}`);
      if (res.data?.success) {
        product = res.data.data;
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Produk Tidak Ditemukan</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
            &larr; Kembali ke Beranda
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gray-100 dark:bg-gray-800 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800">
            {product.photo_url ? (
              <img src={product.photo_url} alt={product.name} className="w-full h-auto object-cover rounded-2xl shadow-sm" />
            ) : (
              <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-400">
                Tidak ada gambar
              </div>
            )}
          </div>
          
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>
            
            <p className="text-3xl text-indigo-600 dark:text-indigo-400 font-black mb-6">
              {formatRupiah(product.price)}
            </p>
            
            <div className="flex items-center gap-4 mb-8">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                product.stock > 10 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                product.stock > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {product.stock > 0 ? `${product.stock} tersedia` : 'Stok habis'}
              </span>
            </div>
            
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 mb-10 flex-grow">
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">Deskripsi Produk</h3>
              <p className="text-base leading-relaxed">{product.description || "Tidak ada deskripsi."}</p>
            </div>
            
            <div className="mt-auto">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
