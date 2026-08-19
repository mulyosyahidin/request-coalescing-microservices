import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { apiClient } from "@/lib/axios";

export default async function CustomerDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let jwtPayload: any = null;
  let userProfile: any = null;

  try {
    jwtPayload = decodeJwt(token);
    if (jwtPayload.role !== "customer" && jwtPayload.role !== "admin") {
      redirect("/login");
    }

    // Fetch full profile to get the name
    const response = await apiClient.get("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data?.success) {
      userProfile = response.data.data;
    }
  } catch (error) {
    console.error("Dashboard error:", error);
    // If fetching /me fails (e.g. token expired/invalid on backend), logout
    redirect("/login");
  }

  const displayName = userProfile?.name || jwtPayload?.email || "User";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-2xl font-bold">Customer Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {displayName} 👋</p>
          </div>
          <form action={logoutAction}>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition">
              Sign out
            </button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 col-span-1 md:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">User ID</p>
                <p className="text-sm font-mono truncate bg-gray-100 dark:bg-gray-800 p-1.5 rounded mt-1">
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
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 mt-1">
                  {jwtPayload.role}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Orders Placeholder */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 dark:bg-gray-950/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <span className="text-4xl mb-2">🛒</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">No orders found.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                
              </p>
              <a 
                href="/products" 
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition"
              >
                Browse Products
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
