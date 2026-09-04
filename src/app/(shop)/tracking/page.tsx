"use client";

import { FormEvent, Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCancelOrder, useOrder } from "@/hooks/useOrders";
import { useCreateOrderDispute, useOrderDeliveryRecords, useOrderDisputes, usePrepareDigitalDownload } from "@/hooks/usePostPurchase";
import Button from "@/components/ui/Button";

const STATUS_STEPS = [
  { statuses: ["PROCESSING", "CONFIRMED"], title: "Order confirmed", sub: "The order is being prepared." },
  { statuses: ["SHIPPED", "IN_TRANSIT"], title: "On the way", sub: "The seller has handed the order to the carrier." },
  { statuses: ["DELIVERED"], title: "Delivered", sub: "The order reached its delivery destination." },
] as const;

function formatDate(value: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse bg-gray-50" />}>
      <TrackingPageContent />
    </Suspense>
  );
}

function TrackingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const { data: order, isLoading, isError, refetch } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const prepareDigitalDownload = usePrepareDigitalDownload(orderId);
  const { data: deliveryRecords = [] } = useOrderDeliveryRecords(orderId);
  const { data: disputes = [] } = useOrderDisputes(orderId);
  const createDispute = useCreateOrderDispute(orderId);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [disputeType, setDisputeType] = useState("DAMAGE");
  const [disputeReason, setDisputeReason] = useState("");
  const [selectedDisputeItem, setSelectedDisputeItem] = useState("");

  const submitDispute = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createDispute.mutate({
      type: disputeType,
      reason: disputeReason,
      orderItemId: selectedDisputeItem || undefined,
    }, { onSuccess: () => setDisputeReason("") });
  };

  if (isAuthPending) {
    return <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center text-sm text-gray-500">Loading your order…</div>;
  }

  if (!currentUser) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center">
        <h1 className="font-heading text-[26px] font-semibold text-[#111] mb-2">Sign in to track an order</h1>
        <p className="text-[15px] text-gray-500 mb-8">Order status is available only to the account that placed it.</p>
        <Button variant="primary" onClick={() => router.push("/login")}>Sign In</Button>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center">
        <h1 className="font-heading text-[26px] font-semibold text-[#111] mb-2">Choose an order to track</h1>
        <p className="text-[15px] text-gray-500 mb-8">Open tracking from one of your persisted orders.</p>
        <Button variant="primary" onClick={() => router.push("/profile?tab=orders")}>View Orders</Button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center text-sm text-gray-500">Loading order details…</div>;
  }

  if (isError) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center">
        <h1 className="font-heading text-[26px] font-semibold text-[#111] mb-2">We couldn’t load this order</h1>
        <p className="text-[15px] text-gray-500 mb-8">Your order is safe. Try loading its details again.</p>
        <Button variant="secondary" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-24 text-center">
        <h1 className="font-heading text-[26px] font-semibold text-[#111] mb-2">Order not found</h1>
        <p className="text-[15px] text-gray-500 mb-8">This order is not available for your account.</p>
        <Button variant="secondary" onClick={() => router.push("/profile?tab=orders")}>Back to Orders</Button>
      </div>
    );
  }

  if (order.status === "CANCELLED" || cancelOrder.isSuccess) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-2">Order cancelled</h2>
        <p className="text-gray-500 text-sm mb-6">The order and its reserved stock were updated. Payment reconciliation follows the order policy.</p>
        <Button variant="primary" onClick={() => router.push("/profile?tab=orders")}>Back to Orders</Button>
      </div>
    );
  }

  const activeStep = STATUS_STEPS.findIndex((step) => (step.statuses as readonly string[]).includes(order.status));
  const canCancel = order.status === "PROCESSING" || order.status === "CONFIRMED";
  const summaryRows = [
    { label: "Subtotal", value: `₹${order.subtotal.toLocaleString()}` },
    { label: "Shipping", value: `₹${order.shippingCost.toLocaleString()}` },
    { label: "Tax", value: `₹${order.tax.toLocaleString()}` },
    ...(order.discount > 0 ? [{ label: "Discount", value: `-₹${order.discount.toLocaleString()}` }] : []),
    { label: "Total", value: `₹${order.total.toLocaleString()}` },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-semibold text-gray-900 tracking-tight-heading">Order tracking</h1>
          <p className="text-xs text-gray-500 mt-1">Order {order.id}</p>
        </div>
        <Link href="/" className="inline-flex min-h-11 items-center text-[13px] text-gray-500 hover:text-gray-900 transition-colors">Continue Shopping</Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="space-y-4 mb-8">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white border border-gray-200 rounded-xl p-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 relative flex-shrink-0">
                  <Image src={item.product.images[0]?.url ?? "/paintings/painting-1.jpg"} alt={item.product.title} fill className="object-cover" sizes="80px"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">by {item.product.artist.user.firstName} {item.product.artist.user.lastName}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>Size: {item.size}</span>
                    <span>Qty: {item.quantity}</span>
                    <span className="font-semibold text-[#111]">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                  {item.digitalDelivery && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-900">Digital delivery</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.digitalDelivery.status === "EXPIRED" ? "This delivery has expired." : `${item.digitalDelivery.downloadCount} of ${item.digitalDelivery.downloadLimit} downloads used.`}
                          </p>
                        </div>
                        {item.digitalDelivery.status !== "EXPIRED" && item.digitalDelivery.status !== "REVOKED" && item.digitalDelivery.downloadCount < item.digitalDelivery.downloadLimit && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={prepareDigitalDownload.isPending}
                            onClick={() => prepareDigitalDownload.mutate(item.id, { onSuccess: (delivery) => { window.location.assign(delivery.downloadUrl); } })}
                          >
                            Download
                          </Button>
                        )}
                      </div>
                      {prepareDigitalDownload.isError && <p className="mt-2 text-xs text-red-600">We couldn’t prepare the download. Please try again.</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-5">Order status</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"/>
              <div className="space-y-6">
                {STATUS_STEPS.map((step, index) => {
                  const active = activeStep >= index;
                  return (
                    <div key={step.title} className="flex items-start gap-4 relative">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 relative z-10 ${active ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-300 text-gray-500"}`}>
                        {active ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> : <span className="text-xs">{index + 1}</span>}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`text-sm font-medium ${active ? "text-[#111]" : "text-gray-500"}`}>{step.title}</p>
                        <p className={`text-xs mt-0.5 ${active ? "text-gray-500" : "text-gray-500"}`}>{step.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {(deliveryRecords.length > 0 || disputes.length > 0) && (
            <div className="mt-4 bg-white border border-gray-200 rounded-xl p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Order history</h2>
              <div className="space-y-3">
                {deliveryRecords.slice(-6).reverse().map((record) => (
                  <div key={record.id} className="flex items-start justify-between gap-3 text-xs">
                    <div><p className="font-medium text-gray-800">{record.type.replaceAll("_", " ")}</p>{record.note && <p className="mt-0.5 text-gray-500">{record.note}</p>}</div>
                    <time className="shrink-0 text-gray-500">{formatDate(record.occurredAt)}</time>
                  </div>
                ))}
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="flex items-start justify-between gap-3 border-t border-gray-100 pt-3 text-xs">
                    <div><p className="font-medium text-gray-800">Dispute · {dispute.type.replaceAll("_", " ")}</p><p className="mt-0.5 text-gray-500">{dispute.status.replaceAll("_", " ")}</p></div>
                    <time className="shrink-0 text-gray-500">{formatDate(dispute.createdAt)}</time>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-80 xl:w-96">
          <div className="bg-gray-50 rounded-2xl p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Order summary</h2>
            <div className="space-y-3 mb-5">
              {summaryRows.map(({ label, value }) => <div key={label} className="flex justify-between text-sm"><span className="text-gray-500">{label}</span><span className="text-gray-900 text-right">{value}</span></div>)}
              <div className="flex justify-between text-sm"><span className="text-gray-500">Expected delivery</span><span className="text-gray-900 text-right">{formatDate(order.estimatedDelivery)}</span></div>
            </div>
            <div className="space-y-2">
              <a
                href={`mailto:hello@artistically.com?subject=${encodeURIComponent(`Order support: ${order.id}`)}`}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
              >
                Contact support
              </a>
              {canCancel && !confirmingCancel ? (
                <Button variant="ghost" fullWidth disabled={cancelOrder.isPending} onClick={() => setConfirmingCancel(true)}>Cancel Order</Button>
              ) : canCancel ? (
                <div className="space-y-2" role="group" aria-label="Confirm order cancellation">
                  <p className="text-xs text-gray-500">Cancel this order? This action releases its reserved stock and cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" fullWidth disabled={cancelOrder.isPending} onClick={() => setConfirmingCancel(false)}>Keep Order</Button>
                    <Button variant="ghost" fullWidth disabled={cancelOrder.isPending} onClick={() => cancelOrder.mutate(order.id)}>{cancelOrder.isPending ? "Cancelling…" : "Confirm Cancellation"}</Button>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" fullWidth disabled>Order cannot be cancelled</Button>
              )}
            </div>
            {cancelOrder.isError && <p className="mt-3 text-xs text-red-600">We couldn’t cancel this order. Try again or contact support.</p>}
          </div>

          <form onSubmit={submitDispute} className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900">Report an order issue</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">Tell us about damage, non-delivery, or another concern. Our team will review it.</p>
            <label className="mt-4 block text-xs font-medium text-gray-700" htmlFor="dispute-type">Issue type</label>
            <select id="dispute-type" value={disputeType} onChange={(event) => setDisputeType(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm">
              <option value="DAMAGE">Damage</option><option value="NON_DELIVERY">Non-delivery</option><option value="AUTHENTICITY">Authenticity</option><option value="DIGITAL_ACCESS">Digital access</option><option value="OTHER">Other</option>
            </select>
            <label className="mt-3 block text-xs font-medium text-gray-700" htmlFor="dispute-item">Related item</label>
            <select id="dispute-item" value={selectedDisputeItem} onChange={(event) => setSelectedDisputeItem(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm">
              <option value="">Entire order</option>
              {order.items.map((item) => <option key={item.id} value={item.id}>{item.product.title}</option>)}
            </select>
            <label className="mt-3 block text-xs font-medium text-gray-700" htmlFor="dispute-reason">What happened?</label>
            <textarea id="dispute-reason" required minLength={10} maxLength={2000} value={disputeReason} onChange={(event) => setDisputeReason(event.target.value)} className="mt-1 min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Please include useful details" />
            <Button type="submit" fullWidth className="mt-3" disabled={createDispute.isPending || disputes.some((dispute) => dispute.status === "OPEN" || dispute.status === "UNDER_REVIEW")} loading={createDispute.isPending}>Submit issue</Button>
            {createDispute.isError && <p className="mt-3 text-xs text-red-600">We couldn’t submit the issue. Please try again.</p>}
            {createDispute.isSuccess && <p className="mt-3 text-xs text-green-700">Your issue was submitted for review.</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
