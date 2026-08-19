import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { ListOrdersResponse, Order } from "@/types/order";
import { decodeJwt } from "jose";
import Link from "next/link";

export default async function CustomerOrdersIndexPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) : 1;
  const limit = 20;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let orders: Order[] = [];
  let total = 0;

  try {
    const payload = decodeJwt(token);
    if (payload.role !== "customer" && payload.role !== "admin") {
      redirect("/login");
    }

    const res = await apiClient.get<ListOrdersResponse>(`/orders?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data?.success) {
      orders = res.data.data.orders || [];
      total = res.data.data.total || 0;
    }
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/customer/dashboard" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 ml-4">My Orders</h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="text-4xl mb-2">🛒</span>
              <p className="text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
              <Link 
                href="/products" 
                className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 transition">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Order ID</p>
                      <p className="text-sm font-mono mt-1 text-gray-900 dark:text-gray-100">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Date</p>
                      <p className="text-sm mt-1">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Total</p>
                      <p className="text-sm font-bold mt-1">{formatRupiah(order.total_amount)}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <Link href={`/customer/orders/${order.id}`} className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-semibold transition whitespace-nowrap w-full sm:w-auto">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-6 flex justify-center items-center gap-4">
            <Link 
              href={`/customer/orders?page=${page - 1}`} 
              className={`px-4 py-2 rounded-lg font-medium ${page === 1 ? 'pointer-events-none opacity-50 bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-600' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'}`}
            >
              Previous
            </Link>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Link 
              href={`/customer/orders?page=${page + 1}`} 
              className={`px-4 py-2 rounded-lg font-medium ${page >= totalPages ? 'pointer-events-none opacity-50 bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-600' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'}`}
            >
              Next
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
