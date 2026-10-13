"use server";

import { cookies } from "next/headers";
import { apiClient } from "@/lib/axios";

export async function createPaymentAction(orderId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, message: "Tidak diizinkan" };
  }

  try {
    const res = await apiClient.post(
      "/payments",
      { order_id: orderId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error("Failed to create payment:", error?.response?.data || error);
    return {
      success: false,
      message: error?.response?.data?.message || "Gagal membuat pembayaran",
    };
  }
}
