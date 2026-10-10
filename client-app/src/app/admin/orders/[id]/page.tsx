import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { OrderDetailResponse, Order } from "@/types/order";
import { decodeJwt } from "jose";
import Link from "next/link";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }
  
  try {
    const payload = decodeJwt(token);
    if (payload.role !== "admin") redirect("/customer/dashboard");
  } catch(e) {
    redirect("/login");
  }

  let order: Order | null = null;
  let errorMsg = null;

  try {
    const res = await apiClient.get<OrderDetailResponse>(`/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data?.success) {
      order = res.data.data;
    } else {
      errorMsg = res.data?.message || "Order not found";
    }
  } catch (error: any) {
    console.error("Failed to fetch order detail:", error?.response?.data || error);
    errorMsg = error?.response?.data?.message || "Failed to load order details.";
  }

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending_payment":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "cancelled":
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
            &larr; Back to admin
          </Link>
        </div>

        {errorMsg || !order ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center shadow-sm border border-gray-200 dark:border-gray-800">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
            <p className="text-gray-500 dark:text-gray-400">{errorMsg || "Order could not be loaded."}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-50/30 dark:bg-red-900/10">
              <div>
                <h1 className="text-2xl font-bold">Order</h1>
                <p className="text-sm text-gray-500 mt-1">Order {order.id.split("-")[0]}</p>
                <p className="text-sm text-gray-500 mt-1">Customer {order.user_id.split("-")[0]}</p>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                  {order.status.replace("_", " ")}
                </span>
                <p className="text-xs text-gray-500">
                  Placed on {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Items Ordered</h2>
              </div>
              
              <ul className="divide-y divide-gray-200 dark:divide-gray-800 border-t border-b border-gray-200 dark:border-gray-800">
                {order.items.map((item) => (
                  <li key={item.id} className="py-4 flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <Link href={`/products/${item.product_id}`} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                        {item.product_name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatRupiah(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right font-semibold">
                      {formatRupiah(item.price * item.quantity)}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col items-end gap-2">
                <div className="flex items-center justify-between w-full sm:w-64">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatRupiah(order.total_amount)}</span>
                </div>
                <div className="flex items-center justify-between w-full sm:w-64 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-black text-2xl text-indigo-600 dark:text-indigo-400">
                    {formatRupiah(order.total_amount)}
                  </span>
                </div>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
