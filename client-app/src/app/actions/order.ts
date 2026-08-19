"use server";

import { cookies } from "next/headers";
import { apiClient } from "@/lib/axios";

export async function checkoutAction(items: { product_id: string; quantity: number }[]) {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return { error: "You must be logged in to checkout", redirect: "/login" };
  }

  if (!items || items.length === 0) {
    return { error: "Cart is empty" };
  }

  try {
    const response = await apiClient.post(
      "/orders",
      { items },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data?.success) {
      return { success: true, order: response.data.data };
    }

    return { error: response.data?.message || "Checkout failed" };
  } catch (error: any) {
    console.error("Checkout action error:", error?.response?.data || error.message);
    const errorMessage = error?.response?.data?.message || "Checkout failed due to server error.";
    return { error: errorMessage };
  }
}
