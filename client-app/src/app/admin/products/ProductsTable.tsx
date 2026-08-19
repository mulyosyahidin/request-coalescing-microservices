"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { deleteProductAction } from "@/app/actions/product";

export default function ProductsTable({ 
  initialProducts, 
  currentPage, 
  totalItems, 
  limit 
}: { 
  initialProducts: Product[],
  currentPage: number,
  totalItems: number,
  limit: number
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);
  
  const totalPages = Math.ceil(totalItems / limit);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    setLoadingId(id);
    const result = await deleteProductAction(id);
    
    if (result.success) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      alert("Failed to delete: " + result.error);
    }
    setLoadingId(null);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold">All Products ({totalItems})</h2>
        <Link 
          href="/admin/products/new" 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          + Add Product
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-6 py-4 font-semibold">Photo</th>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Price</th>
              <th className="px-6 py-4 font-semibold">Stock</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  No products found on this page.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.name} className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-gray-700" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-400 text-xs">No img</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {p.name}
                  </td>
                  <td className="px-6 py-4">
                    {formatRupiah(p.price)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.stock > 10 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      p.stock > 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-4 justify-end">
                    <Link href={`/admin/products/${p.id}`} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                      View
                    </Link>
                    <Link href={`/admin/products/${p.id}/edit`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      disabled={loadingId === p.id}
                      className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 font-medium"
                    >
                      {loadingId === p.id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Link 
              href={`/admin/products?page=${currentPage - 1}`} 
              className={`px-3 py-1 text-sm rounded-md border ${currentPage === 1 ? 'pointer-events-none opacity-50 bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}
            >
              Previous
            </Link>
            <Link 
              href={`/admin/products?page=${currentPage + 1}`} 
              className={`px-3 py-1 text-sm rounded-md border ${currentPage >= totalPages ? 'pointer-events-none opacity-50 bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'}`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
