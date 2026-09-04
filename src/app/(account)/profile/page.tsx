"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserProfile, OrderItem } from "@/types";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import ProductCard from "@/components/product/ProductCard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useWishlist } from "@/hooks/useWishlist";
import { useUpdateProfile } from "@/hooks/useProfile";
import { logout as logoutApi } from "@/lib/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useOrders } from "@/hooks/useOrders";
import { clearIdentityQueries } from "@/lib/query-session";
import { getProfileTab, type ProfileTab } from "@/lib/profile-tabs";

type Tab = ProfileTab;

const STATUS_STYLES: Record<string, string> = {
  delivered:    "bg-green-100 text-green-700",
  "in-transit": "bg-blue-100 text-blue-700",
  processing:   "bg-yellow-100 text-yellow-700",
  cancelled:    "bg-red-100 text-red-700",
};

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAppStore();
  const queryClient = useQueryClient();
  const { data: currentUser, isPending: isAuthPending } = useCurrentUser();
  const { data: wishlist = [] } = useWishlist();
  const { data: orderHistory = [], isLoading: ordersLoading, isError: ordersError, refetch: refetchOrders } = useOrders();
  const updateProfile = useUpdateProfile();
  const [tab, setTab] = useState<Tab>(() =>
    getProfileTab(typeof window === "undefined" ? "" : window.location.search),
  );
  const [form, setForm] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    address: "",
  });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const handleHistoryChange = () => setTab(getProfileTab(window.location.search));
    window.addEventListener("popstate", handleHistoryChange);
    return () => window.removeEventListener("popstate", handleHistoryChange);
  }, []);

  const moveToTab = (nextTab: Tab) => {
    setTab(nextTab);
    const params = new URLSearchParams(window.location.search);
    if (nextTab === "profile") params.delete("tab");
    else params.set("tab", nextTab);
    const query = params.toString();
    router.replace(`/profile${query ? `?${query}` : ""}`, { scroll: false });
  };

  const displayedForm: UserProfile = currentUser ? {
    firstName: editing ? form.firstName : currentUser.firstName,
    lastName: editing ? form.lastName : currentUser.lastName,
    email: currentUser.email,
    contact: editing ? form.contact : currentUser.phone ?? "",
    address: editing ? form.address : currentUser.address ?? "",
  } : form;

  const startEditing = () => {
    if (!currentUser) return;
    setForm({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      contact: currentUser.phone ?? "",
      address: currentUser.address ?? "",
    });
    setEditing(true);
  };

  const handleSave = () => {
    if (!currentUser) return;
    updateProfile.mutate({
      userId: currentUser.id,
      input: {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.contact || undefined,
        address: form.address || undefined,
      },
    }, {
      onSuccess: () => {
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2500);
      },
    });
  };

  const handleLogout = async () => {
    await logoutApi();
    logout();
    clearIdentityQueries(queryClient);
    router.push("/");
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 focus-visible:ring-2 focus-visible:ring-accent-100 transition-colors disabled:bg-gray-50 disabled:text-gray-500";

  if (isAuthPending) {
    return <div className="max-w-[840px] mx-auto px-6 sm:px-10 py-24 text-center text-sm text-gray-500">Loading your profile…</div>;
  }

  if (!currentUser) {
    return (
      <div className="max-w-[840px] mx-auto px-6 sm:px-10 py-24 text-center">
        <h1 className="font-heading text-[26px] font-semibold text-[#111] mb-2">Sign in to view your profile</h1>
        <p className="text-[15px] text-gray-500 mb-8">Your profile, orders, and wishlist are private to your account.</p>
        <Button variant="primary" onClick={() => router.push("/login")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-[840px] mx-auto px-6 sm:px-10 py-6 sm:py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-[#111] flex-shrink-0">
           {displayedForm.firstName[0]}
        </div>
        <div className="flex-1">
           <h1 className="text-xl sm:text-2xl font-heading font-semibold text-gray-900 tracking-tight-heading">{displayedForm.firstName} {displayedForm.lastName}</h1>
           <p className="text-sm text-gray-500">{displayedForm.email}</p>
        </div>
         <button type="button" onClick={handleLogout} className="inline-flex min-h-11 items-center gap-1.5 text-sm text-red-600 hover:text-red-700 bg-transparent border-none cursor-pointer p-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6" role="tablist" aria-label="Account sections">
        {([["profile", "Profile"], ["orders", "Orders"], ["wishlist", "Wishlist"]] as [Tab, string][]).map(([t, label]) => (
           <button type="button" key={t} role="tab" aria-selected={tab === t} onClick={() => moveToTab(t)} className={`min-h-11 px-4 py-3 text-sm font-medium border-b-2 transition-colors bg-transparent cursor-pointer -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 ${tab === t ? "border-gray-900 text-[#111]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <div className="max-w-lg" role="tabpanel" aria-label="Profile details">
          {saved && <div role="status" aria-live="polite" className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">Profile saved successfully!</div>}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-first-name" className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                <input id="profile-first-name" disabled={!editing} value={displayedForm.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputClass}/>
              </div>
              <div>
                <label htmlFor="profile-last-name" className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                <input id="profile-last-name" disabled={!editing} value={displayedForm.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputClass}/>
              </div>
            </div>
            {(["email", "contact", "address"] as const).map((field) => (
              <div key={field}>
                <label htmlFor={`profile-${field}`} className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field}</label>
                <input id={`profile-${field}`} disabled={!editing || field === "email"} value={displayedForm[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className={inputClass}/>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            {editing ? (
              <>
                <Button variant="primary" onClick={handleSave} disabled={updateProfile.isPending}>{updateProfile.isPending ? "Saving…" : "Save Changes"}</Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              </>
            ) : (
                <Button variant="secondary" onClick={startEditing}>Edit Profile</Button>
              )}
            {updateProfile.isError && <p role="alert" className="mt-3 text-sm text-red-600">We couldn’t save your profile. Check the fields and try again.</p>}
          </div>
        </div>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        ordersLoading ? (
          <p className="py-12 text-center text-sm text-gray-500">Loading your orders…</p>
        ) : ordersError ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500 mb-4">We couldn’t load your orders.</p>
            <Button variant="secondary" onClick={() => refetchOrders()}>Try Again</Button>
          </div>
        ) : orderHistory.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500 mb-4">You haven’t placed any orders yet.</p>
            <Button variant="primary" onClick={() => router.push("/")}>Discover Art</Button>
          </div>
        ) : (
        <div className="space-y-4">
          {orderHistory.map((order: OrderItem) => (
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
                  {order.date && <span className="text-xs text-gray-500">{order.date}</span>}
                </div>
              </div>
              <Link href={order.orderId ? `/tracking?orderId=${encodeURIComponent(order.orderId)}` : "/tracking"} className="inline-flex min-h-11 items-center text-xs text-indigo-600 hover:underline flex-shrink-0 self-start sm:self-center">Track Order</Link>
            </div>
          ))}
        </div>
        )
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
