"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProductAction, uploadPhotoAction } from "@/app/actions/product";
import { Product } from "@/types/product";

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product.photo_url);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    formData.append("id", product.id);
    
    // 1. Upload photo if selected
    let uploadedUrl = product.photo_url || "";
    if (file) {
      const uploadData = new FormData();
      uploadData.append("image", file);
      
      const uploadResult = await uploadPhotoAction(uploadData);
      if (!uploadResult.success) {
        setError(uploadResult.error || "Failed to upload photo");
        setLoading(false);
        return;
      }
      uploadedUrl = uploadResult.photo_url;
    }
    
    // 2. Add photo URL to main form data
    formData.append("photo_url", uploadedUrl);
    
    // 3. Submit to update product
    const result = await updateProductAction(null, formData);
    if (result.success) {
      router.push(`/admin/products/${product.id}`);
    } else {
      setError(result.error || "Failed to update product");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input required name="name" type="text" defaultValue={product.name} className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (Rp)</label>
              <input required name="price" type="number" min="0" defaultValue={product.price} className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input required name="stock" type="number" min="0" defaultValue={product.stock} className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" rows={4} defaultValue={product.description || ""} className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium mb-1">Product Photo</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              {preview ? (
                <div className="relative w-full aspect-square mb-4">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  <button 
                    type="button" 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-xs w-6 h-6"
                  >
                    X
                  </button>
                </div>
              ) : (
                <div className="w-full aspect-square mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
