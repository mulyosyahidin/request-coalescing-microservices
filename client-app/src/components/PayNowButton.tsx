"use client";

import { useState } from "react";
import { createPaymentAction } from "@/app/actions/payment";

export default function PayNowButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    const res = await createPaymentAction(orderId);

    if (res.success && res.data?.snap_url) {
      window.location.href = res.data.snap_url;
    } else {
      setError(res.message || "Gagal memproses pembayaran");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={handlePay}
        disabled={loading}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition shadow-md w-full sm:w-auto"
      >
        {loading ? "Memproses..." : "Bayar Sekarang"}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
