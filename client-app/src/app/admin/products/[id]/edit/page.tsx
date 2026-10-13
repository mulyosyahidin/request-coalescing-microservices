import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/axios";
import Link from "next/link";
import { ProductDetailResponse } from "@/types/product";
import EditProductForm from "./EditProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
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
        <h1 className="text-2xl font-bold mb-4">Produk Tidak Ditemukan</h1>
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          &larr; Kembali ke Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/admin/products/${product.id}`} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            &larr; Kembali ke Detail
          </Link>
          <h1 className="text-2xl font-bold">Ubah Produk</h1>
        </div>

        <EditProductForm product={product} />
      </div>
    </div>
  );
}
