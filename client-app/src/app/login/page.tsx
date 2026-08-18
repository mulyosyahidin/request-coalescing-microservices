"use client";

import { useActionState, useEffect } from "react";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/customer/dashboard");
    }
  }, [state, router]);

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-800/40 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-inner">
            🔐
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sign in to access your account and shopping flows.
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              defaultValue={state?.fields?.email || ""}
              placeholder="user@example.com"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <a href="#" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              name="password"
              defaultValue={state?.fields?.password || ""}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-600 dark:text-gray-400">
              Remember this device for 30 days
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* RBAC Info Card */}
        <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 rounded-2xl p-3.5 text-xs text-indigo-800 dark:text-indigo-200 space-y-1.5 shadow-sm">
          <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
            <span>🛡️</span>
            <span>RBAC JWT Authentication</span>
          </div>
          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-relaxed">
            Default public login returns JWT with{" "}
            <code className="bg-indigo-100 dark:bg-indigo-900/80 text-indigo-900 dark:text-indigo-200 font-mono px-1.5 py-0.5 rounded text-[10px] border border-indigo-200 dark:border-indigo-700/60">
              role: &quot;customer&quot;
            </code>
            .
          </p>
        </div>

        {/* Footer Link to Register */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}
