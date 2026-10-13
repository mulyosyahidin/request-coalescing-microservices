"use server";

import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { redirect } from "next/navigation";
import { apiClient } from "@/lib/axios";

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const fields = { name, email, password, confirmPassword };

  if (password !== confirmPassword) {
    return { error: "Kata sandi tidak cocok", fields };
  }

  if (!name || !email || !password) {
    return { error: "Semua kolom wajib diisi", fields };
  }

  try {
    const response = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });

    const data = response.data;

    if (data.success && data.data?.token) {
      const token = data.data.token;
      
      const payload = decodeJwt(token);
      const expiresAt = new Date((payload.exp || 0) * 1000);
      const role = payload.role as string;

      (await cookies()).set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
      });

      return { success: true, role };
    }

    return { error: "Akun tidak dapat dibuat. Silakan coba lagi.", fields };
  } catch (error: any) {
    console.error("Register action error:", error?.response?.data || error.message);
    const errorMessage = error?.response?.data?.message || "Pendaftaran gagal. Silakan coba lagi.";
    return { error: errorMessage, fields };
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const fields = { email, password };

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi", fields };
  }

  try {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
    });

    const data = response.data;

    if (data.success && data.data?.token) {
      const token = data.data.token;
      
      const payload = decodeJwt(token);
      const expiresAt = new Date((payload.exp || 0) * 1000);
      const role = payload.role as string;

      (await cookies()).set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
      });

      return { success: true, role };
    }

    return { error: "Masuk tidak berhasil. Silakan coba lagi.", fields };
  } catch (error: any) {
    console.error("Login action error:", error?.response?.data || error.message);
    const errorMessage = error?.response?.data?.message || "Masuk gagal. Periksa kredensial Anda.";
    return { error: errorMessage, fields };
  }
}

export async function logoutAction() {
  (await cookies()).delete("token");
  redirect("/login");
}
