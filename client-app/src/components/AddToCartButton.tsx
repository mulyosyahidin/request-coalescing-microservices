"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  product: Product;
  showQuantity?: boolean;
  variant?: "detail" | "list";
}

export function AddToCartButton({ product, showQuantity = true, variant = "detail" }: AddToCartButtonProps) {
  const { items, addToCart, removeFromCart } = useCart();
  const [added, setAdded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  const existingItem = items.find((item) => item.product.id === product.id);
  const inCart = !!existingItem;
  
  // Calculate remaining stock available to add
  const remainingStock = product.stock - (existingItem?.quantity || 0);

  const handleAdd = () => {
    if (selectedQuantity > 0 && selectedQuantity <= remainingStock) {
      addToCart(product, selectedQuantity);
      setAdded(true);
      setSelectedQuantity(1); // Reset back to 1 after adding
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleRemove = () => {
    removeFromCart(product.id);
  };

  const increment = () => {
    if (selectedQuantity < remainingStock) {
      setSelectedQuantity((prev) => prev + 1);
    }
  };

  const decrement = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity((prev) => prev - 1);
    }
  };

  // Hydration mismatch prevention
  if (!mounted) {
    return (
      <button disabled className={`bg-gray-300 dark:bg-gray-800 text-gray-500 rounded-xl cursor-not-allowed ${variant === "detail" ? "w-full py-4" : "px-3 py-1.5 text-xs"}`}>
        Memuat...
      </button>
    );
  }

  const isList = variant === "list";

  return (
    <div className={`flex ${isList ? "flex-col" : "flex-col"} gap-2`}>
      {/* Quantity Selector */}
      {showQuantity && remainingStock > 0 && !isList && (
        <div className="flex items-center gap-4">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Jumlah:</span>
          <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            <button 
              onClick={decrement}
              disabled={selectedQuantity <= 1}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 transition"
            >
              -
            </button>
            <span className="px-6 py-2 text-sm font-medium text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-700">
              {selectedQuantity}
            </span>
            <button 
              onClick={increment}
              disabled={selectedQuantity >= remainingStock}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 transition"
            >
              +
            </button>
          </div>
          <span className="text-sm text-gray-500">
            ({remainingStock} tersedia)
          </span>
        </div>
      )}

      <div className={`flex ${isList ? "flex-row" : "flex-col"} gap-2 w-full`}>
        <button
          onClick={handleAdd}
          disabled={remainingStock <= 0}
          className={`${isList ? "flex-1 px-3 py-1.5 text-xs rounded-lg" : "w-full py-4 text-base rounded-xl"} font-bold transition shadow-sm hover:shadow-md ${
            added
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white"
          }`}
        >
          {added
            ? "Ditambahkan ✓"
            : inCart && remainingStock > 0
            ? (isList ? "+1" : "Tambah Lagi ke Keranjang")
            : remainingStock > 0
            ? "Tambah ke Keranjang"
            : "Stok Habis"}
        </button>

        {inCart && (
          <button
            onClick={handleRemove}
            className={`${isList ? "px-2 py-1.5 text-xs rounded-lg" : "w-full py-3 text-base rounded-xl border-2"} font-bold transition border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-600 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white`}
            title="Hapus dari keranjang"
          >
            {isList ? "✕" : `Hapus dari Keranjang (${existingItem.quantity} item)`}
          </button>
        )}
      </div>
    </div>
  );
}
