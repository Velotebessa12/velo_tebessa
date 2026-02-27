"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function OrderFailedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId") ?? "—";
  const reason =
    searchParams.get("reason") ??
    "We were unable to process your order at this time.";

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4">
      <div
        className={`w-full max-w-md transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Card */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-red-100 shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-400 to-rose-400" />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  Order Failed
                </h1>
                 <p className="text-sm text-gray-500">{reason}</p>
              </div>
            </div>

            {/* Reason */}
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm text-red-700">{reason}</p>
            </div>

            {/* Help */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm text-gray-600">
                You can try again or return to the store. If the problem
                persists, please contact our support team.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() =>
                  router.push(`/checkout?orderId=${orderId}`)
                }
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition"
              >
                Try Again
              </button>

              <button
                onClick={() => router.push("/")}
                className="flex-1 border border-red-200 hover:bg-red-50 text-red-600 font-semibold py-3 rounded-xl transition"
              >
                Back to Store
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          If you were charged, the amount will be automatically refunded.
        </p>
      </div>
    </div>
  );
}