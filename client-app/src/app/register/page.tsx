"use client";

import { useActionState, useEffect } from "react";
import { registerAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      if (state.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/customer/dashboard");
      }
    }
  }, [state, router]);

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Buat akun
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Simpan data Anda agar bisa checkout dan memantau pesanan.
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
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              defaultValue={state?.fields?.name || ""}
              placeholder="Budi Santoso"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              name="email"
              defaultValue={state?.fields?.email || ""}
              placeholder="budi@example.com"
              required
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Kata Sandi
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
              Konfirmasi Kata Sandi
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

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition"
          >
            {isPending ? "Sedang mendaftar..." : "Buat Akun"}
          </button>
        </form>

        {/* Footer Link to Login */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          Sudah punya akun?{" "}
          <a href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Masuk
          </a>
        </div>
      </div>
    </div>
  );
}
