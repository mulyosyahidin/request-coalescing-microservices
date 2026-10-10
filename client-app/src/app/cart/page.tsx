"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState } from "react";
import { checkoutAction } from "@/app/actions/order";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    const payload = items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    const result = await checkoutAction(payload);
    
    if (result.error) {
      setError(result.error);
      if (result.redirect) {
        router.push(result.redirect);
      }
    } else if (result.success) {
      clearCart();
      // Redirect to success or payment page. Let's just show an alert or redirect to orders page.
      // Since payment-service is not there yet, it might return payment: null
      const snapUrl = result.order?.payment?.snap_url;
      if (snapUrl) {
        window.location.href = snapUrl;
      } else {
        alert("Order placed. You can follow it from your account.");
        router.push("/customer/dashboard");
      }
    }
    
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added any products to your cart yet.</p>
        <Link
          href="/products"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {items.map((item) => (
              <li key={item.product.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  {item.product.photo_url ? (
                    <img src={item.product.photo_url} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      <Link href={`/products/${item.product.id}`}>{item.product.name}</Link>
                    </h3>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {formatRupiah(item.product.price * item.quantity)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{formatRupiah(item.product.price)} each</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 text-sm font-medium text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-700">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 transition"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-sm font-medium text-red-600 hover:text-red-500 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Subtotal</span>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {formatRupiah(totalPrice)}
              </span>
            </div>
            
            <p className="text-sm text-gray-500 mb-6 text-right">
              Shipping and taxes calculated at checkout.
            </p>
            
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition shadow-md flex justify-center items-center"
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
