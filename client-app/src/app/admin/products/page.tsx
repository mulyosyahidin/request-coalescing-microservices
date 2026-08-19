import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/axios";
import ProductsTable from "./ProductsTable";
import Link from "next/link";
import { ProductsResponse } from "@/types/product";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const jwtPayload = decodeJwt(token);
    if (jwtPayload.role !== "admin") {
      redirect("/customer/dashboard");
    }
  } catch (error) {
    redirect("/login");
  }

  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const limit = 10;

  let initialProducts = [];
  let total = 0;
  
  try {
    // Fetch products
    const res = await apiClient.get<ProductsResponse>(`/products?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (res.data?.success) {
      initialProducts = res.data.data.items || [];
      total = res.data.data.total || 0;
    }
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Products Management</h1>
        </div>

        <ProductsTable 
          initialProducts={initialProducts} 
          currentPage={page} 
          totalItems={total} 
          limit={limit} 
        />
      </div>
    </div>
  );
}
