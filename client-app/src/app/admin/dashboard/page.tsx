import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { apiClient } from "@/lib/axios";
import { ListOrdersResponse, Order } from "@/types/order";
import Link from "next/link";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let jwtPayload: any = null;
  let userProfile: any = null;
  let orders: Order[] = [];

  try {
    jwtPayload = decodeJwt(token);
    // Extra security check for admin role
    if (jwtPayload.role !== "admin") {
      redirect("/customer/dashboard"); // Not an admin, kick them to customer dashboard
    }

    // Fetch full profile and orders concurrently
    const [profileRes, ordersRes] = await Promise.allSettled([
      apiClient.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
      apiClient.get<ListOrdersResponse>("/orders?limit=15", { headers: { Authorization: `Bearer ${token}` } })
    ]);

    if (profileRes.status === "fulfilled" && profileRes.value.data?.success) {
      userProfile = profileRes.value.data.data;
    }

    if (ordersRes.status === "fulfilled" && ordersRes.value.data?.success) {
      orders = ordersRes.value.data.data.orders || [];
    }
  } catch (error) {
    console.error("Dashboard error:", error);
    redirect("/login");
  }

  const displayName = userProfile?.name || jwtPayload?.email || "Admin";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 border-l-4 border-l-red-500">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-red-500">🛡️</span> Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {displayName}</p>
          </div>
          <form action={logoutAction}>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition">
              Sign out
            </button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Admin Profile Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 col-span-1 md:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">User ID</p>
                <p className="text-xs font-mono truncate bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                  {jwtPayload.sub}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Name</p>
                <p className="text-sm font-medium mt-1">{userProfile?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Email</p>
                <p className="text-sm font-medium mt-1">{jwtPayload.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Role</p>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 mt-1">
                  {jwtPayload.role}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Management Tools */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Management */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Products Management</h2>
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Add, update, or remove products from the catalog.
                </p>
                <a href="/admin/products" className="block text-center w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
                  Manage Products
                </a>
              </div>

              {/* Order Management */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Orders Overview</h2>
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Total Orders: {orders.length}
                </p>
                <Link href="/admin/orders" className="block text-center w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition">
                  View All Orders
                </Link>
              </div>
            </div>

            {/* Recent Global Orders List */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Global Orders</h2>
                <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  View All &rarr;
                </Link>
              </div>
              
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 bg-gray-50 dark:bg-gray-950/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    No orders have been placed on the platform yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Order ID</p>
                          <p className="text-sm font-mono mt-0.5 text-indigo-600 dark:text-indigo-400">
                            {order.id.split("-")[0]}...
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Customer ID</p>
                          <p className="text-sm font-mono mt-0.5" title={order.user_id}>
                            {order.user_id.split("-")[0]}...
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Total</p>
                          <p className="text-sm font-bold mt-0.5">{formatRupiah(order.total_amount)}</p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                            {order.status.replace("_", " ")}
                          </span>
                        </div>
                        <div>
                          <Link href={`/admin/orders/${order.id}`} className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold transition whitespace-nowrap">
                            Review
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
