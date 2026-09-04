"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartItem as CartItemType } from "@/types";
import { useCartMutations } from "@/hooks/useCart";

interface Props { item: CartItemType; }

export default function CartItem({ item }: Props) {
  const { update, remove } = useCartMutations();
  const itemId = item.cartItemId;
  const stockLimit = item.stock !== undefined ? Math.max(0, item.stock) : undefined;
  const isUnavailable = stockLimit === 0;

  const updateQuantity = (delta: number) => {
    if (!itemId) return;
    const nextQuantity = Math.max(1, item.quantity + delta);
    update.mutate({ itemId, quantity: stockLimit !== undefined ? Math.min(stockLimit, nextQuantity) : nextQuantity });
  };

  return (
    <div className="flex gap-5 py-6 border-b border-gray-100 last:border-b-0">
      <Link href={`/products/${item.id}`} className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-[#f5f5f5] relative flex-shrink-0 block">
        <Image src={item.image} alt={item.title} fill className="object-cover" sizes="96px"/>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.id}`} className="font-heading text-[15px] font-medium text-[#111] hover:text-gray-600 transition-colors line-clamp-2 block leading-snug">
          {item.title}
        </Link>
        <p className="text-[13px] text-gray-500 mt-1">{item.artistName} · Size: {item.size}</p>
        {isUnavailable ? (
          <p className="text-xs text-red-600 mt-2">No longer available. Remove this item to continue.</p>
        ) : stockLimit !== undefined ? (
          <p className="text-xs text-gray-500 mt-2">{stockLimit} available</p>
        ) : null}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <div className="flex items-center rounded-lg overflow-hidden border border-gray-200">
            <button type="button" onClick={() => updateQuantity(-1)} disabled={!itemId || update.isPending || item.quantity <= 1} aria-label="Decrease quantity" className="min-h-11 min-w-11 px-3 py-1.5 text-sm bg-transparent border-none cursor-pointer hover:bg-gray-50 text-gray-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40">−</button>
            <span className="px-3 py-1.5 text-sm font-medium text-[#111] border-x border-gray-200 min-w-[2.5rem] text-center">{item.quantity}</span>
            <button type="button" onClick={() => updateQuantity(1)} disabled={!itemId || update.isPending || isUnavailable || (stockLimit !== undefined && item.quantity >= stockLimit)} aria-label="Increase quantity" className="min-h-11 min-w-11 px-3 py-1.5 text-sm bg-transparent border-none cursor-pointer hover:bg-gray-50 text-gray-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40">+</button>
          </div>
          <span className="text-[15px] font-semibold text-[#111]">₹{(item.price * item.quantity).toLocaleString()}</span>
          <button type="button" onClick={() => itemId && remove.mutate(itemId)} disabled={!itemId || remove.isPending} className="min-h-11 px-2 text-[13px] text-gray-500 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-40">Remove</button>
        </div>
        {(update.isError || remove.isError) && (
          <p role="alert" className="text-[12px] text-red-600 mt-3">
            {update.isError ? "Couldn’t update quantity." : "Couldn’t remove this item."} Try again.
          </p>
        )}
      </div>
    </div>
  );
}
