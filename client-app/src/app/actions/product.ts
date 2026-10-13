"use server";

import { apiClient } from "@/lib/axios";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteProductAction(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await apiClient.delete(`/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.data?.success) {
      revalidatePath("/admin/products");
      return { success: true };
    }
    return { success: false, error: res.data?.message || "Gagal menghapus produk" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

export async function uploadPhotoAction(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await apiClient.post("/products/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });
    
    if (res.data?.success) {
      return { success: true, photo_url: res.data.data.photo_url };
    }
    return { success: false, error: res.data?.message || "Unggah gagal" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

export async function createProductAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const photo_url = formData.get("photo_url") as string;

  try {
    const res = await apiClient.post("/products", {
      name,
      description: description || null,
      price,
      stock,
      photo_url
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.data?.success) {
      revalidatePath("/admin/products");
      return { success: true };
    }
    
    return { success: false, error: res.data?.message || "Gagal membuat produk" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

export async function updateProductAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const photo_url = formData.get("photo_url") as string;

  try {
    const res = await apiClient.put(`/products/${id}`, {
      name,
      description: description || null,
      price,
      stock,
      photo_url
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.data?.success) {
      revalidatePath("/admin/products");
      return { success: true };
    }
    
    return { success: false, error: res.data?.message || "Gagal memperbarui produk" };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}
