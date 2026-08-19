import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/axios";
import Link from "next/link";
import { ProductDetailResponse } from "@/types/product";
import DeleteProductButton from "./DeleteProductButton";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const { id } = await params;

  try {
    const jwtPayload = decodeJwt(token);
    if (jwtPayload.role !== "admin") {
      redirect("/customer/dashboard");
    }
  } catch (error) {
    redirect("/login");
  }

  let product = null;
  
  // Basic UUID format regex to prevent invalid requests reaching API Gateway
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
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/products" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            &larr; Back to Products
          </Link>
          <h1 className="text-2xl font-bold">Product Details</h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-gray-100 dark:bg-gray-800 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
            {product.photo_url ? (
              <img src={product.photo_url} alt={product.name} className="w-full max-w-xs object-cover rounded-xl shadow-md" />
            ) : (
              <div className="w-full aspect-square max-w-xs bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          
          <div className="md:w-2/3 p-8 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                product.stock > 10 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                product.stock > 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                Stock: {product.stock}
              </span>
            </div>
            
            <p className="text-2xl text-blue-600 dark:text-blue-400 font-bold mb-6">
              {formatRupiah(product.price)}
            </p>
            
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 mb-8 flex-grow">
              <h3 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">Description</h3>
              <p>{product.description || "No description provided."}</p>
            </div>
            
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex gap-4">
              <Link 
                href={`/admin/products/${product.id}/edit`}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-center"
              >
                Edit Product
              </Link>
              <DeleteProductButton id={product.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
