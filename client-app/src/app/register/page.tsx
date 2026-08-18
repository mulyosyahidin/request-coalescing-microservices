"use client";

import { useActionState, useEffect } from "react";
import { registerAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
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
            ✨
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Create an Account
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Register to test auth-service JWT generation and mock shopping flows.
          </p>
        </div>

        {/* Mock Form */}
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={state?.fields?.name || ""}
              placeholder="Alice Smith"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              defaultValue={state?.fields?.email || ""}
              placeholder="alice@example.com"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              defaultValue={state?.fields?.password || ""}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              defaultValue={state?.fields?.confirmPassword || ""}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              defaultChecked
              required
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded mt-0.5"
            />
            <label htmlFor="terms" className="ml-2 block text-xs text-gray-600 dark:text-gray-400">
              I agree to the <a href="#" className="text-indigo-600 underline">Terms of Service</a> and <a href="#" className="text-indigo-600 underline">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition"
          >
            {isPending ? "Registering..." : "Create Account"}
          </button>
        </form>

        {/* RBAC Notice */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 shadow-sm">
          <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
            <span>ℹ️</span>
            <span>Default Role Assignment</span>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            All public registrations automatically receive the{" "}
            <code className="bg-amber-100 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-mono px-1.5 py-0.5 rounded text-[10px] border border-amber-200 dark:border-amber-700/60">
              customer
            </code>{" "}
            role. Admin accounts are provisioned via internal seed.
          </p>
        </div>

        {/* Footer Link to Login */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
