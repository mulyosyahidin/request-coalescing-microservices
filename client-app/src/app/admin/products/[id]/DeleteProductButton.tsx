"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/app/actions/product";

export default function DeleteProductButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setLoading(true);
    const result = await deleteProductAction(id);
    
    if (result.success) {
      router.push("/admin/products");
    } else {
      alert("Failed to delete: " + result.error);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete Product"}
    </button>
  );
}
