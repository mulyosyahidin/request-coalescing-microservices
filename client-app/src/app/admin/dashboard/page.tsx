import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { apiClient } from "@/lib/axios";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  let jwtPayload: any = null;
  let userProfile: any = null;

  try {
    jwtPayload = decodeJwt(token);
    // Extra security check for admin role
    if (jwtPayload.role !== "admin") {
      redirect("/customer/dashboard"); // Not an admin, kick them to customer dashboard
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
    redirect("/login");
  }

  const displayName = userProfile?.name || jwtPayload?.email || "Admin";

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
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 mt-1">
                  {jwtPayload.role}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Management Tools Placeholder */}
          <div className="col-span-1 md:col-span-3 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Management */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Products Management</h2>
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Add, update, or remove products. Phase 3.2 integration pending.
                </p>
                <button disabled className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-medium rounded-lg cursor-not-allowed">
                  Manage Products (Coming Soon)
                </button>
              </div>

              {/* Order Management */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Orders Overview</h2>
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  View all orders and update statuses. Phase 3.3 integration pending.
                </p>
                <button disabled className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-medium rounded-lg cursor-not-allowed">
                  Manage Orders (Coming Soon)
                </button>
              </div>
            </div>

            {/* Quick Stats Placeholder */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
              <div className="flex flex-col items-center justify-center h-32 bg-gray-50 dark:bg-gray-950/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Stats will be available once product and order services are fully online.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
