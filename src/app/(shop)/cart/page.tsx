"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import CartItem from "@/components/product/CartItem";
import Button from "@/components/ui/Button";

const SHIPPING = 200;
const TAX_RATE = 0.12;

export default function CartPage() {
  const router = useRouter();
  const { cart, clearCart } = useAppStore();
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + SHIPPING + tax - discount;

  const handleCheckout = () => { clearCart(); router.push("/tracking"); };

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left */}
        <div className="flex-1">
          <div className="flex items-end justify-between mb-8">
            <h1 className="font-heading text-[26px] sm:text-[30px] font-semibold text-[#111] tracking-tight-heading">
              My Cart <span className="text-gray-300 font-normal text-[22px]">({cart.length})</span>
            </h1>
            <Link href="/" className="text-[13px] text-gray-400 hover:text-[#111] transition-colors">Continue Shopping</Link>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-[#f5f5f5] flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <h2 className="font-heading text-[22px] font-semibold text-[#111] mb-2">Your cart is empty</h2>
              <p className="text-[15px] text-gray-400 mb-8">Add some beautiful artworks to your cart.</p>
              <Button variant="primary" onClick={() => router.push("/")}>Discover Art</Button>
            </div>
          ) : (
            <div>{cart.map((item) => <CartItem key={item.id} item={item}/>)}</div>
          )}
        </div>

        {/* Right — Summary */}
        {cart.length > 0 && (
          <div className="lg:w-[340px] xl:w-[380px]">
            <div className="bg-[#fafafa] rounded-2xl p-6 sm:p-8 sticky top-24">
              <h2 className="font-heading text-[17px] font-semibold text-[#111] mb-6">Order Summary</h2>
              <div className="space-y-3.5 mb-5">
                {[
                  { label: "Subtotal", value: `₹${subtotal.toLocaleString()}` },
                  { label: "Shipping", value: `₹${SHIPPING}` },
                  { label: "Tax (12%)", value: `₹${tax.toLocaleString()}` },
                  ...(discount > 0 ? [{ label: "Discount", value: `-₹${discount.toLocaleString()}` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-[14px]">
                    <span className="text-gray-400">{label}</span>
                    <span className={label === "Discount" ? "text-green-600" : "text-[#111]"}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mb-5">
                <input type="text" placeholder="Promo code" value={promo} onChange={(e) => setPromo(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors bg-white"/>
                <button onClick={() => { if (promo) setPromoApplied(true); }}
                  className="px-4 py-2.5 text-[13px] font-medium text-[#111] border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 transition-all bg-transparent cursor-pointer">
                  Apply
                </button>
              </div>
              <div className="border-t border-gray-200 pt-5 mb-6">
                <div className="flex justify-between font-heading text-[17px] font-semibold text-[#111]">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              <Button variant="primary" fullWidth size="lg" onClick={handleCheckout}>Proceed to Checkout</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
