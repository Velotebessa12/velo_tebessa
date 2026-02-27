"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageContext";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId") ?? "—";
  const customerName = searchParams.get("name") ?? "Valued Customer";
  const { lang , dict} = useLang();

  const [visible, setVisible] = useState(false);
  const [stepsVisible, setStepsVisible] = useState([false, false, false]);

  useEffect(() => {
    setVisible(true);
    [0, 1, 2].forEach((i) => {
      setTimeout(
        () => {
          setStepsVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        },
        400 + i * 150,
      );
    });
  }, []);

 
   

  return (
   <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div
        className={`w-full max-w-md transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Card */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-teal-100 shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-400" />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-11 h-11 rounded-full bg-teal-500 flex items-center justify-center text-white">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  {dict.orderSuccess.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {dict.orderSuccess.orderLabel}{" "}
                  <span className="font-mono font-semibold text-teal-600">
                    #{orderId}
                  </span>
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm text-gray-600">
                {dict.orderSuccess.message.replace("{{name}}", customerName)}
              </p>
            </div>

            {/* Steps */}
            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">
                {dict.orderSuccess.nextTitle}
              </p>

              <div className="space-y-3">
                {[
                  dict.orderSuccess.steps.confirm,
                  dict.orderSuccess.steps.prepare,
                  dict.orderSuccess.steps.delivery,
                ].map((step, i) => (
                  <div
                    key={i}
                    className={`transition-all duration-500 ${
                      stepsVisible[i]
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-3"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-800">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push(`/${lang}/orders`)}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition"
              >
                {dict.orderSuccess.track}
              </button>

              <button
                onClick={() => router.push(`/${lang}/`)}
                className="flex-1 border border-teal-200 hover:bg-teal-50 text-teal-600 font-semibold py-3 rounded-xl transition"
              >
                {dict.orderSuccess.back}
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          {dict.orderSuccess.footer}
        </p>
      </div>
    </div>
  );
}
