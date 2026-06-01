"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackingItems, ORDER_STEPS } from "@/data";
import Button from "@/components/ui/Button";

const SHIPPING = 200;
const TAX_RATE = 0.12;

export default function TrackingPage() {
  const router = useRouter();
  const [cancelled, setCancelled] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

  const subtotal = trackingItems.reduce((s, i) => s + i.price * (i.qty ?? 1), 0);
  const total = subtotal + SHIPPING + Math.round(subtotal * TAX_RATE);

  const summaryRows = [
    { label: "Delivery",   value: "Expected by Friday, 09 June 2024" },
    { label: "Return",     value: "Return by Monday, 12 June 2024" },
    { label: "Total cost", value: `₹ ${total.toLocaleString()}` },
    { label: "Total paid", value: `₹ ${total.toLocaleString()}` },
  ];

  if (cancelled) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-2">Order Cancelled</h2>
        <p className="text-gray-500 text-sm mb-6">Your order has been successfully cancelled. A refund will be processed within 5–7 business days.</p>
        <Button variant="primary" onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-heading font-semibold text-gray-900 tracking-tight-heading">Order Tracking</h1>
        <Link href="/" className="text-[13px] text-gray-400 hover:text-gray-900 transition-colors">Continue Shopping</Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left — tracking items + steps */}
        <div className="flex-1">
          {/* Items */}
          <div className="space-y-4 mb-8">
            {trackingItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 relative flex-shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">by {item.artist}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>Size: {item.size}</span>
                    {item.qty && <span>Qty: {item.qty}</span>}
                    <span className="font-semibold text-[#111]">₹{item.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress steps */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-5">Order Status</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"/>
              <div className="space-y-6">
                {ORDER_STEPS.map((step) => (
                  <div key={step.n} className="flex items-start gap-4 relative">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 relative z-10 ${step.active ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                      {step.active ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <span className="text-xs">{step.n}</span>
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`text-sm font-medium ${step.active ? "text-[#111]" : "text-gray-400"}`}>{step.title}</p>
                      <p className={`text-xs mt-0.5 ${step.active ? "text-gray-500" : "text-gray-300"}`}>{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — summary */}
        <div className="lg:w-80 xl:w-96">
          <div className="bg-gray-50 rounded-2xl p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {summaryRows.map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-900 text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button variant="secondary" fullWidth onClick={() => setAgentOpen(!agentOpen)}>
                Contact Support
              </Button>
              <Button variant="ghost" fullWidth onClick={() => setCancelled(true)}>
                Cancel Order
              </Button>
            </div>

            {agentOpen && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Chat with support</p>
                <input type="text" placeholder="Type your message..." className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-gray-400"/>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
