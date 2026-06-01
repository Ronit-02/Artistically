"use client";

import { useState } from "react";
import Image from "next/image";
import { paintings } from "@/data";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";

type Tab = "overview" | "artworks" | "orders" | "analytics" | "reviews" | "settings";

/* ── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, change, icon }: {
  label: string; value: string; change?: string; icon: string;
}) {
  const positive = change && !change.startsWith("-");
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {change}
          </span>
        )}
      </div>
      <p className="font-heading text-2xl font-semibold text-gray-900 tracking-tight-heading">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

/* ── Dashboard Page ─────────────────────────────────────────────────────── */
export default function ArtistPortalPage() {
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "artworks", label: "Artworks" },
    { key: "orders", label: "Orders" },
    { key: "analytics", label: "Analytics" },
    { key: "reviews", label: "Reviews" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight-heading">
          Welcome back, Artist
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your artworks today.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap border-none cursor-pointer ${
              tab === t.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700 bg-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ──────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-8">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Revenue" value="₹1,28,450" change="+12.5%" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <StatCard label="Artworks Sold" value="47" change="+8" icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            <StatCard label="Profile Views" value="2,341" change="+18.3%" icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <StatCard label="Avg. Rating" value="4.8" icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </div>

          {/* Recent artworks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <SectionHeader title="Recent Artworks" />
              <Button variant="primary" size="sm">+ Upload New</Button>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Artwork", "Category", "Price", "Status", "Views"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paintings.slice(0, 5).map((p, i) => (
                    <tr key={p.id} className={`${i < paintings.length - 1 ? "border-b border-gray-50" : ""} hover:bg-gray-50 transition-colors`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                            <Image src={p.image} alt={p.title} fill className="object-cover" sizes="40px" />
                          </div>
                          <div>
                            <p className="text-sm font-heading font-medium text-gray-900 line-clamp-1">{p.title}</p>
                            <p className="text-xs text-gray-400">{p.artistName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded font-medium">{p.category}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-900 font-medium">₹{p.price.toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${i % 3 === 0 ? "bg-green-50 text-green-600" : i % 3 === 1 ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-600"}`}>
                          {i % 3 === 0 ? "Published" : i % 3 === 1 ? "Draft" : "Review"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{Math.floor(Math.random() * 500 + 50)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent orders */}
          <div>
            <SectionHeader title="Recent Orders" className="mb-4" />
            <div className="space-y-3">
              {[
                { buyer: "Priya S.", artwork: "Mystic Valley Sunset", amount: "₹4,250", status: "Completed", date: "May 28" },
                { buyer: "Rahul M.", artwork: "Abstract Horizons", amount: "₹6,800", status: "Shipped", date: "May 26" },
                { buyer: "Anita K.", artwork: "Ceramic Bloom Vase", amount: "₹3,200", status: "Processing", date: "May 25" },
              ].map((o, i) => (
                <div key={i} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-[#111]">
                      {o.buyer[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{o.buyer}</p>
                      <p className="text-xs text-gray-400">{o.artwork}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{o.amount}</p>
                    <p className="text-xs text-gray-400">{o.date}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded hidden sm:inline ${
                    o.status === "Completed" ? "bg-green-50 text-green-600" :
                    o.status === "Shipped" ? "bg-blue-50 text-blue-600" :
                    "bg-amber-50 text-amber-600"
                  }`}>{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Artworks Tab ──────────────────────────────────────────── */}
      {tab === "artworks" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">Manage your published and draft artworks</p>
            <Button variant="primary" size="sm">+ Upload New</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {paintings.map((p) => (
              <div key={p.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gray-100">
                  <Image src={p.image} alt={p.title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-heading font-medium text-gray-900 line-clamp-1">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">₹{p.price.toLocaleString()}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="secondary" size="sm" className="flex-1">Edit</Button>
                    <Button variant="ghost" size="sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Orders Tab ────────────────────────────────────────────── */}
      {tab === "orders" && (
        <div>
          <p className="text-sm text-gray-500 mb-5">Track and manage incoming orders</p>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            {[
              { id: "#ORD-2847", buyer: "Priya S.", artwork: "Mystic Valley Sunset", amount: "₹4,250", status: "Completed", date: "28 May 2024" },
              { id: "#ORD-2843", buyer: "Rahul M.", artwork: "Abstract Horizons", amount: "₹6,800", status: "Shipped", date: "26 May 2024" },
              { id: "#ORD-2840", buyer: "Anita K.", artwork: "Ceramic Bloom Vase", amount: "₹3,200", status: "Processing", date: "25 May 2024" },
              { id: "#ORD-2838", buyer: "Vikram P.", artwork: "Monsoon Reflections", amount: "₹5,100", status: "Completed", date: "22 May 2024" },
            ].map((o, i, arr) => (
              <div key={o.id} className={`flex items-center justify-between px-5 py-4 ${i < arr.length - 1 ? "border-b border-gray-50" : ""}`}>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 font-mono w-20">{o.id}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{o.artwork}</p>
                    <p className="text-xs text-gray-400">by {o.buyer} · {o.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">{o.amount}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    o.status === "Completed" ? "bg-green-50 text-green-600" :
                    o.status === "Shipped" ? "bg-blue-50 text-blue-600" :
                    "bg-amber-50 text-amber-600"
                  }`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Analytics Tab ─────────────────────────────────────────── */}
      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Page Views (30d)" value="8,421" change="+23%" icon="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <StatCard label="Conversion Rate" value="3.2%" change="+0.4%" icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            <StatCard label="Avg. Order Value" value="₹4,750" change="+₹320" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <StatCard label="Repeat Buyers" value="18" change="+5" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="font-heading text-base font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
            <div className="flex items-end gap-2 h-40">
              {[35, 45, 30, 60, 50, 70, 55, 80, 75, 90, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-gray-100 rounded-t" style={{ height: `${h}%` }}>
                    <div className="w-full bg-gray-1000 rounded-t transition-all duration-500" style={{ height: `${h * 0.7}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Reviews Tab ───────────────────────────────────────────── */}
      {tab === "reviews" && (
        <div>
          <p className="text-sm text-gray-500 mb-5">Customer feedback on your artworks</p>
          <div className="space-y-4">
            {[
              { name: "Priya S.", rating: 5, text: "Absolutely stunning piece. The colors are even more vibrant in person. Will definitely buy again!", date: "2 days ago" },
              { name: "Rahul M.", rating: 4, text: "Great quality print and fast shipping. Framing was slightly delayed but overall very happy.", date: "5 days ago" },
              { name: "Anita K.", rating: 5, text: "This ceramic vase is a masterpiece. The glaze work is incredible and it looks perfect in my living room.", date: "1 week ago" },
            ].map((r, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-[#111]">{r.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className={`w-3.5 h-3.5 ${j < r.rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Settings Tab ──────────────────────────────────────────── */}
      {tab === "settings" && (
        <div className="max-w-lg">
          <p className="text-sm text-gray-500 mb-5">Manage your artist profile and preferences</p>
          <div className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6 space-y-4">
            {[
              { label: "Display Name", value: "Cy Twombly", type: "text" },
              { label: "Email", value: "artist@artistically.com", type: "email" },
              { label: "Bio", value: "Contemporary artist exploring abstract expression through mixed media.", type: "textarea" },
              { label: "Portfolio URL", value: "https://artistically.com/cy-twombly", type: "text" },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{field.label}</label>
                {field.type === "textarea" ? (
                  <textarea
                    defaultValue={field.value}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all resize-none"
                  />
                ) : (
                  <input
                    type={field.type}
                    defaultValue={field.value}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                  />
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <Button variant="primary">Save Changes</Button>
              <Button variant="secondary">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
