"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CartItem as CartItemType } from "@/types";
import { useAppStore } from "@/store/useAppStore";

interface Props { item: CartItemType; }

export default function CartItem({ item }: Props) {
  const router = useRouter();
  const { updateQty, removeItem } = useAppStore();

  return (
    <div className="flex gap-5 py-6 border-b border-gray-100 last:border-b-0">
      <button onClick={() => router.push(`/products/${item.id}`)} className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-[#f5f5f5] relative flex-shrink-0 cursor-pointer border-none p-0">
        <Image src={item.image} alt={item.title} fill className="object-cover" sizes="96px"/>
      </button>
      <div className="flex-1 min-w-0">
        <button onClick={() => router.push(`/products/${item.id}`)} className="font-heading text-[15px] font-medium text-[#111] hover:text-gray-600 transition-colors line-clamp-2 text-left bg-transparent border-none cursor-pointer p-0 block w-full leading-snug">
          {item.title}
        </button>
        <p className="text-[13px] text-gray-400 mt-1">{item.artistName} · Size: {item.size}</p>
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <div className="flex items-center rounded-lg overflow-hidden border border-gray-200">
            <button onClick={() => updateQty(item.id, -1)} className="px-3 py-1.5 text-sm bg-transparent border-none cursor-pointer hover:bg-gray-50 text-gray-500 transition-colors">−</button>
            <span className="px-3 py-1.5 text-sm font-medium text-[#111] border-x border-gray-200 min-w-[2.5rem] text-center">{item.quantity}</span>
            <button onClick={() => updateQty(item.id, 1)} className="px-3 py-1.5 text-sm bg-transparent border-none cursor-pointer hover:bg-gray-50 text-gray-500 transition-colors">+</button>
          </div>
          <span className="text-[15px] font-semibold text-[#111]">₹{(item.price * item.quantity).toLocaleString()}</span>
          <button onClick={() => removeItem(item.id)} className="text-[13px] text-gray-400 hover:text-red-500 bg-transparent border-none cursor-pointer p-0 transition-colors">Remove</button>
        </div>
      </div>
    </div>
  );
}
