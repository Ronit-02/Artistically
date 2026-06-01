"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { categories, allProducts, artists, collections } from "@/data";
import Logo from "@/components/ui/Logo";
import type { SearchResult } from "@/types";

const RECENT_KEY = "artistically_recent";
function getRecent(): string[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; } }
function saveRecent(q: string) { if (!q.trim()) return; try { localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...getRecent().filter(s => s !== q)].slice(0, 5))); } catch {} }

function buildResults(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase(), r: SearchResult[] = [];
  allProducts.filter(p => p.title.toLowerCase().includes(q) || p.artistName.toLowerCase().includes(q)).slice(0, 3).forEach(p => r.push({ id: `p-${p.id}`, type: "artwork", title: p.title, subtitle: p.artistName, image: p.image, href: `/products/${p.id}` }));
  artists.filter(a => a.name.toLowerCase().includes(q)).slice(0, 2).forEach(a => r.push({ id: `a-${a.id}`, type: "artist", title: a.name, subtitle: `${a.designs} artworks`, image: a.avatar, href: `/artists/${a.id}` }));
  collections.filter(c => c.name.toLowerCase().includes(q)).slice(0, 2).forEach(c => r.push({ id: `c-${c.id}`, type: "collection", title: c.name, subtitle: `${c.artworkCount} artworks`, image: c.coverImage, href: `/collections/${c.id}` }));
  return r.slice(0, 6);
}

function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useAppStore();
  const [focused, setFocused] = useState(false);
  const [local, setLocal] = useState(searchQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [selIdx, setSelIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLocal(searchQuery); }, [searchQuery]);
  useEffect(() => { if (!local.trim()) { setResults([]); return; } const t = setTimeout(() => setResults(buildResults(local)), 120); return () => clearTimeout(t); }, [local]);

  return (
    <div className="relative flex-1 max-w-xl">
      <form onSubmit={(e) => { e.preventDefault(); if (!local.trim()) return; saveRecent(local); setSearchQuery(local); setFocused(false); onSearch(local); }}>
        <div className={`flex items-center w-full rounded-full px-4 py-2.5 gap-2.5 transition-all ${focused ? "bg-white border border-accent-300 shadow-sm" : "bg-[#f5f5f5] border border-transparent hover:bg-[#efefef]"}`}>
          <svg className="w-[18px] h-[18px] flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input ref={inputRef} type="text" placeholder="Search for products or artists…"
            value={local} onChange={e => { setLocal(e.target.value); setSelIdx(-1); }}
            onFocus={() => { setFocused(true); setRecent(getRecent()); }}
            onBlur={(e) => { if (dropRef.current?.contains(e.relatedTarget as Node)) return; setTimeout(() => setFocused(false), 120); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSelIdx(i => (i + 1) % Math.max(results.length, 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSelIdx(i => (i - 1 + results.length) % Math.max(results.length, 1)); }
              if (e.key === "Enter" && selIdx >= 0 && results[selIdx]) { e.preventDefault(); saveRecent(local); setFocused(false); router.push(results[selIdx].href); }
              if (e.key === "Escape") { setFocused(false); inputRef.current?.blur(); }
            }}
            className="flex-1 outline-none text-[13px] text-[#111] placeholder-gray-400 bg-transparent"/>
          {local && <button type="button" onClick={() => { setLocal(""); setSearchQuery(""); setResults([]); inputRef.current?.focus(); }} className="text-gray-300 hover:text-gray-500 bg-transparent border-none cursor-pointer p-0"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>}
        </div>
      </form>
      {focused && (local.trim() ? results.length > 0 : recent.length > 0) && (
        <div ref={dropRef} className="animate-scale-in absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
          {!local.trim() && recent.map(s => <button key={s} onClick={() => { setLocal(s); setSearchQuery(s); setFocused(false); onSearch(s); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#f5f5f5] text-left bg-transparent border-none cursor-pointer"><svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg><span className="text-[13px] text-gray-500">{s}</span></button>)}
          {local.trim() && results.map((r, idx) => <button key={r.id} onClick={() => { saveRecent(local); setFocused(false); router.push(r.href); }} className={`w-full flex items-center gap-3 px-4 py-2.5 text-left bg-transparent border-none cursor-pointer transition-colors ${idx === selIdx ? "bg-[#f5f5f5]" : "hover:bg-[#f5f5f5]"}`}>{r.image ? <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#f0f0f0] flex-shrink-0 relative"><Image src={r.image} alt="" fill className="object-cover" sizes="32px"/></div> : <div className="w-8 h-8 rounded-lg bg-[#f0f0f0] flex-shrink-0"/>}<div className="flex-1 min-w-0"><p className="text-[13px] font-medium text-[#111] truncate">{r.title}</p>{r.subtitle && <p className="text-[11px] text-gray-400 truncate">{r.subtitle}</p>}</div></button>)}
          {local.trim() && results.length === 0 && <div className="p-6 text-center text-[13px] text-gray-400">No results</div>}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, wishlist, setSearchQuery, isLoggedIn, logout } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  useEffect(() => { setMobileSearch(false); setMenuOpen(false); }, [pathname]);

  const doSearch = useCallback((q: string) => { setSearchQuery(q); router.push("/search"); }, [router, setSearchQuery]);
  const catClick = (cat: string) => { setSearchQuery(cat); router.push("/search"); };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      {/* Top row — spacious */}
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 flex items-center gap-6 h-[60px]">
        <Logo size={40} />

        <div className="hidden sm:flex flex-1"><SearchBar onSearch={doSearch}/></div>

        {/* Right links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/artists" className="text-[13px] text-gray-500 hover:text-accent-600 transition-colors font-medium">Artists</Link>
          <Link href="/collections" className="text-[13px] text-gray-500 hover:text-accent-600 transition-colors font-medium">Collections</Link>
          {isLoggedIn && <Link href="/artist-portal" className="text-[13px] text-accent-600 hover:text-accent-700 transition-colors font-medium">Sell</Link>}
        </nav>

        <div className="flex items-center gap-0.5 flex-shrink-0 ml-auto sm:ml-0">
          {/* Profile */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => { if (!isLoggedIn) router.push("/login"); else setMenuOpen(!menuOpen); }}
              className="p-2.5 rounded-lg text-gray-400 hover:text-accent-600 bg-transparent border-none cursor-pointer transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1-.5-3c0-2.21 3.58-4 7-4s7 1.79 7 4a8.38 8.38 0 0 1-.5 3"/></svg>
            </button>
            {isLoggedIn && menuOpen && (
              <div className="animate-scale-in absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-50">
                {[{ label: "Profile", href: "/profile" }, { label: "Orders", href: "/profile?tab=orders" }, { label: "Wishlist", href: "/wishlist" }].map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-[13px] text-gray-500 hover:bg-accent-50 hover:text-accent-600 transition-colors">{item.label}</Link>
                ))}
                <div className="my-1 mx-3 border-t border-gray-100"/>
                <Link href="/artist-portal" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-[13px] text-accent-600 font-medium hover:bg-accent-50 transition-colors">Artist Portal</Link>
                <div className="my-1 mx-3 border-t border-gray-100"/>
                <button onClick={() => { logout(); setMenuOpen(false); router.push("/"); }} className="w-full text-left px-4 py-2 text-[13px] text-gray-400 hover:text-red-500 bg-transparent border-none cursor-pointer transition-colors">Logout</button>
              </div>
            )}
          </div>

          {/* Wishlist — HEART icon */}
          <Link href="/wishlist" className="relative p-2.5 rounded-lg text-gray-400 hover:text-accent-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {wishlist.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-500"/>}
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative p-2.5 rounded-lg text-gray-400 hover:text-accent-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {cartCount > 0 && <span className="absolute top-1 right-1 bg-accent-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-semibold">{cartCount}</span>}
          </Link>

          {/* Mobile search */}
          <button onClick={() => setMobileSearch(!mobileSearch)} className="sm:hidden p-2.5 rounded-lg text-gray-400 hover:text-accent-600 bg-transparent border-none cursor-pointer transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
      </div>

      {mobileSearch && <div className="sm:hidden px-6 pb-3"><SearchBar onSearch={q => { doSearch(q); setMobileSearch(false); }}/></div>}

      {/* Category nav — spacious */}
      <div className="border-t border-gray-50">
        <nav className="max-w-[1240px] mx-auto px-6 sm:px-10 py-2.5 overflow-x-auto">
          <ul className="flex items-center justify-center gap-6 sm:gap-8 list-none m-0 p-0 whitespace-nowrap">
            {categories.map(cat => (
              <li key={cat}><button onClick={() => catClick(cat)} className="text-[13px] text-gray-500 hover:text-accent-600 transition-colors bg-transparent border-none cursor-pointer p-0 font-medium">{cat}</button></li>
            ))}
            <li><Link href="/collections" className="text-[13px] text-gray-500 hover:text-accent-600 transition-colors font-medium">Collections</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
