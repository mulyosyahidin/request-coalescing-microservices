import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { ListOrdersResponse, Order } from "@/types/order";
import { decodeJwt } from "jose";
import Link from "next/link";

export default async function AdminOrdersIndexPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
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
    if (payload.role !== "admin") {
      redirect("/customer/dashboard");
    }

    const res = await apiClient.get<ListOrdersResponse>(`/orders?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data?.success) {
      orders = res.data.data.orders || [];
      total = res.data.data.total || 0;
    }
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
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
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
              &larr; Back to admin
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 ml-4">
              Orders
            </h1>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total: <span className="font-bold text-gray-900 dark:text-gray-100">{total}</span></p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-gray-500 dark:text-gray-400">No orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-600 dark:text-indigo-400">
                        {order.id.split("-")[0]}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400" title={order.user_id}>
                        {order.user_id.split("-")[0]}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100 text-right">
                        {formatRupiah(order.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/admin/orders/${order.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-bold">
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pt-6 flex justify-center items-center gap-4">
            <Link 
              href={`/admin/orders?page=${page - 1}`} 
              className={`px-4 py-2 rounded-lg font-medium ${page === 1 ? 'pointer-events-none opacity-50 bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-600' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'}`}
            >
              Previous
            </Link>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Link 
              href={`/admin/orders?page=${page + 1}`} 
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
