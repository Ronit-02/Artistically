"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { orderHistory } from "@/data";
import type { UserProfile, OrderItem } from "@/types";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import ProductCard from "@/components/product/ProductCard";

type Tab = "profile" | "orders" | "wishlist";

const STATUS_STYLES: Record<string, string> = {
  delivered:    "bg-green-100 text-green-700",
  "in-transit": "bg-blue-100 text-blue-700",
  processing:   "bg-yellow-100 text-yellow-700",
};

export default function ProfilePage() {
  const router = useRouter();
  const { logout, wishlist } = useAppStore();
  const [tab, setTab] = useState<Tab>("profile");
  const [form, setForm] = useState<UserProfile>({
    firstName: "Ronit",
    lastName: "Khatri",
    email: "ronit@example.com",
    contact: "9871471XXXX",
    address: "Block-10, Pashchim Vihar, New Delhi",
  });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors disabled:bg-gray-50 disabled:text-gray-500";

  return (
    <div className="max-w-[840px] mx-auto px-6 sm:px-10 py-6 sm:py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-[#111] flex-shrink-0">
          {form.firstName[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-heading font-semibold text-gray-900 tracking-tight-heading">{form.firstName} {form.lastName}</h1>
          <p className="text-sm text-gray-500">{form.email}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 bg-transparent border-none cursor-pointer p-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {([["profile", "Profile"], ["orders", "Orders"], ["wishlist", "Wishlist"]] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer -mb-px ${tab === t ? "border-gray-900 text-[#111]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="max-w-lg">
          {saved && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">Profile saved successfully!</div>}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                <input disabled={!editing} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass}/>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                <input disabled={!editing} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass}/>
              </div>
            </div>
            {(["email", "contact", "address"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field}</label>
                <input disabled={!editing} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className={inputClass}/>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            {editing ? (
              <>
                <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        <div className="space-y-4">
          {(orderHistory as OrderItem[]).map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 relative flex-shrink-0">
                <Image src={order.image} alt={order.title} fill className="object-cover" sizes="64px"/>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{order.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">by {order.artist}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-semibold text-gray-900">₹{order.price.toLocaleString()}</span>
                  {order.status && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] ?? ""}`}>
                      {order.status}
                    </span>
                  )}
                  {order.date && <span className="text-xs text-gray-400">{order.date}</span>}
                </div>
              </div>
              <Link href="/tracking" className="text-xs text-indigo-600 hover:underline flex-shrink-0 self-start sm:self-center">Track Order</Link>
            </div>
          ))}
        </div>
      )}

      {/* Wishlist tab */}
      {tab === "wishlist" && (
        wishlist.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm mb-4">No items in your wishlist yet.</p>
            <Button variant="primary" onClick={() => router.push("/")}>Discover Art</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {wishlist.map((p) => <ProductCard key={p.id} product={p}/>)}
          </div>
        )
      )}
    </div>
  );
}
