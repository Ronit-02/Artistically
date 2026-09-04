"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useCartMutations } from "@/hooks/useCart";
import CartItem from "@/components/product/CartItem";
import Button from "@/components/ui/Button";
import { createCheckoutSession } from "@/lib/api/checkout";
import { fetchCheckoutQuote, type CheckoutQuoteDto } from "@/lib/api/checkout";
import { ApiClientError } from "@/lib/api/client";
import { useMemo, useState } from "react";

const SHIPPING = 200;
const TAX_RATE = 0.12;

export default function CartPage() {
  const router = useRouter();
  const { data: cart = [], currentUser, isAuthPending, isLoading, isError, refetch } = useCart();
  const { clear } = useCartMutations();
  const [shippingAddress, setShippingAddress] = useState("");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | undefined>();
  const [quote, setQuote] = useState<CheckoutQuoteDto | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + SHIPPING + tax;
  const cartSignature = useMemo(() => cart.map((item) => `${item.id}:${item.quantity}:${item.price}`).join("|"), [cart]);
  const quotedCartSignature = quote ? quote.items.map((item) => `${item.productId}:${item.quantity}:${item.unitPrice}`).join("|") : "";
  const currentQuote = quote && quotedCartSignature === cartSignature ? quote : null;

  async function handleApplyPromo() {
    const normalized = promoCode.trim();
    if (!normalized) {
      setAppliedPromoCode(undefined);
      setQuote(null);
      setQuoteError(null);
      return;
    }
    setIsApplyingPromo(true);
    setQuoteError(null);
    try {
      const nextQuote = await fetchCheckoutQuote(normalized);
      setQuote(nextQuote);
      setAppliedPromoCode(nextQuote.promoCode ?? undefined);
    } catch (error) {
      setQuote(null);
      setAppliedPromoCode(undefined);
      setQuoteError(error instanceof ApiClientError ? error.message : "We couldn’t apply that promo code.");
    } finally {
      setIsApplyingPromo(false);
    }
  }

  async function handleCheckout() {
    if (!shippingAddress.trim()) {
      setCheckoutError("Enter a delivery address before checkout.");
      return;
    }
    setCheckoutError(null);
    setIsCheckingOut(true);
    try {
      const session = await createCheckoutSession({
        shippingAddress: shippingAddress.trim(),
        idempotencyKey: crypto.randomUUID(),
        ...(appliedPromoCode ? { promoCode: appliedPromoCode } : {}),
      });
      if (!session.url) {
        setCheckoutError("This checkout session is no longer available. Try again.");
        return;
      }
      window.location.assign(session.url);
    } catch (error) {
      setCheckoutError(error instanceof ApiClientError ? error.message : "We couldn’t start checkout. Try again.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  if (isAuthPending || (currentUser && isLoading)) {
    return <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center text-sm text-gray-500">Loading your cart…</div>;
  }

  if (!currentUser) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center">
        <h1 className="font-heading text-[26px] font-semibold text-[#111] mb-2">Sign in to view your cart</h1>
        <p className="text-[15px] text-gray-500 mb-8">Your saved artwork and cart items are tied to your account.</p>
        <Button variant="primary" onClick={() => router.push("/login")}>Sign In</Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center">
        <h1 className="font-heading text-[26px] font-semibold text-[#111] mb-2">We couldn’t load your cart</h1>
        <p className="text-[15px] text-gray-500 mb-8">Your account is safe. Try loading the cart again.</p>
        <Button variant="secondary" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const summarySubtotal = currentQuote?.subtotal ?? subtotal;
  const summaryShipping = currentQuote?.shippingCost ?? SHIPPING;
  const summaryTax = currentQuote?.tax ?? tax;
  const summaryDiscount = currentQuote?.discount ?? 0;
  const summaryTotal = currentQuote?.total ?? total;

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left */}
        <div className="flex-1">
          <div className="flex items-end justify-between mb-8">
            <h1 className="font-heading text-[26px] sm:text-[30px] font-semibold text-[#111] tracking-tight-heading">
              My Cart <span className="text-gray-500 font-normal text-[22px]">({cart.length})</span>
            </h1>
             <div className="flex items-center gap-4">
               {cart.length > 0 && (
                 <>
                   {clear.isError && <span role="alert" className="text-[12px] text-red-600">Couldn’t clear cart.</span>}
                   <button type="button" onClick={() => clear.mutate()} disabled={clear.isPending} className="text-[13px] text-gray-500 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">{clear.isPending ? "Clearing…" : "Clear cart"}</button>
                 </>
               )}
               <Link href="/" className="inline-flex min-h-11 items-center text-[13px] text-gray-500 hover:text-[#111] transition-colors">Continue Shopping</Link>
             </div>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-[#f5f5f5] flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <h2 className="font-heading text-[22px] font-semibold text-[#111] mb-2">Your cart is empty</h2>
              <p className="text-[15px] text-gray-500 mb-8">Add some beautiful artworks to your cart.</p>
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
                  { label: "Subtotal", value: `₹${summarySubtotal.toLocaleString()}` },
                  { label: "Shipping", value: `₹${summaryShipping.toLocaleString()}` },
                  { label: "Tax (12%)", value: `₹${summaryTax.toLocaleString()}` },
                  ...(summaryDiscount > 0 ? [{ label: "Discount", value: `-₹${summaryDiscount.toLocaleString()}` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-[14px]">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-[#111]">{value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-5 mb-6">
                <div className="flex justify-between font-heading text-[17px] font-semibold text-[#111]">
                  <span>Total</span>
                  <span>₹{summaryTotal.toLocaleString()}</span>
                </div>
              </div>
              <label htmlFor="promo-code" className="block text-[13px] font-medium text-[#111] mb-2">Promo code</label>
              <div className="flex gap-2 mb-4">
                <input id="promo-code" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="Enter code" className="min-h-11 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-blue-100" />
                <Button type="button" variant="secondary" disabled={isApplyingPromo} onClick={() => void handleApplyPromo()}>{isApplyingPromo ? "Applying…" : "Apply"}</Button>
              </div>
              {quoteError && <p role="alert" className="mb-3 text-xs text-red-600">{quoteError}</p>}
              {currentQuote?.promoCode && <p role="status" className="mb-3 text-xs text-green-700">{currentQuote.promoCode} applied.</p>}
              <label htmlFor="shipping-address" className="block text-[13px] font-medium text-[#111] mb-2">Delivery address</label>
              <textarea
                id="shipping-address"
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
                placeholder={currentUser.address ?? "Enter your delivery address"}
                rows={3}
                maxLength={300}
                className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-blue-100"
              />
              {checkoutError && <p role="alert" className="mt-3 text-xs text-red-600">{checkoutError}</p>}
              <Button variant="primary" fullWidth size="lg" loading={isCheckingOut} onClick={handleCheckout} className="mt-4">
                Continue to secure payment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
