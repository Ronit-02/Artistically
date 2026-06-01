"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { allProducts, ART_TYPES, PRICE_RANGES, PRICE_RANGE_MAP } from "@/data";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import type { SortOption } from "@/types";

const RATINGS = [4, 3, 2, 1] as const;
const PER_PAGE = 12;

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

export default function SearchPage() {
  const { searchQuery, setSearchQuery } = useAppStore();
  const [sortBy, setSortBy] = useState<SortOption>("Price: ascending");
  const [checkedTypes, setCheckedTypes] = useState<string[]>([]);
  const [checkedPrices, setCheckedPrices] = useState<string[]>([]);
  const [checkedRatings, setCheckedRatings] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, checkedTypes, checkedPrices, checkedRatings, sortBy]);

  const toggle = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, current: T[], value: T) => {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.artistName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (checkedTypes.length) list = list.filter((p) => checkedTypes.includes(p.category));
    if (checkedPrices.length) {
      list = list.filter((p) => checkedPrices.some((range) => {
        const [min, max] = PRICE_RANGE_MAP[range] ?? [0, Infinity];
        return p.price >= min && p.price <= max;
      }));
    }
    if (checkedRatings.length) list = list.filter((p) => checkedRatings.some((r) => p.rating >= r));
    switch (sortBy) {
      case "Price: ascending": list.sort((a, b) => a.price - b.price); break;
      case "Price: descending": list.sort((a, b) => b.price - a.price); break;
      case "Most Popular": list.sort((a, b) => b.reviews - a.reviews); break;
    }
    return list;
  }, [searchQuery, checkedTypes, checkedPrices, checkedRatings, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const activeFilters = checkedTypes.length + checkedPrices.length + checkedRatings.length;

  const CheckGroup = <T extends string | number>({
    label, items, checked, toggle: tog,
  }: { label: string; items: readonly T[]; checked: T[]; toggle: (v: T) => void }) => (
    <div className="mb-6">
      <p className="text-[11px] font-semibold text-[#111] uppercase tracking-wider mb-2.5">{label}</p>
      <div className="space-y-2">
        {items.map((item) => (
          <label key={String(item)} className="flex items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" checked={checked.includes(item)} onChange={() => tog(item)} className="w-3.5 h-3.5 rounded border-gray-300 text-accent-600 cursor-pointer accent-accent-600"/>
            <span className="text-[13px] text-gray-500 group-hover:text-accent-600 transition-colors">
              {typeof item === "number" ? (
                <span className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-3 h-3 ${i < item ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} viewBox="0 0 18 18"><path d={STAR_PATH}/></svg>
                  ))}
                  <span className="text-[11px] text-gray-400">& up</span>
                </span>
              ) : item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const Filters = () => (
    <div>
      <CheckGroup label="Art Type" items={ART_TYPES} checked={checkedTypes} toggle={(v) => toggle(setCheckedTypes, checkedTypes, v as string)}/>
      <CheckGroup label="Price Range" items={PRICE_RANGES} checked={checkedPrices} toggle={(v) => toggle(setCheckedPrices, checkedPrices, v as string)}/>
      <CheckGroup label="Rating" items={RATINGS} checked={checkedRatings} toggle={(v) => toggle(setCheckedRatings, checkedRatings, v as number)}/>
      {activeFilters > 0 && (
        <button onClick={() => { setCheckedTypes([]); setCheckedPrices([]); setCheckedRatings([]); }} className="text-[12px] text-red-500 hover:underline mt-1 bg-transparent border-none cursor-pointer p-0">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-8 sm:py-10">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: searchQuery ? `Search: "${searchQuery}"` : "All Artworks" }]} className="mb-5"/>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 xl:w-56 flex-shrink-0">
          <h2 className="font-heading text-[15px] font-semibold text-[#111] mb-5">Filters</h2>
          <Filters/>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-heading text-[20px] sm:text-[24px] font-semibold text-[#111] tracking-tight-heading leading-snug">
                {searchQuery ? `Results for "${searchQuery}"` : "All Artworks"}
              </h1>
              <p className="text-[13px] text-gray-400 mt-0.5">{filtered.length} artworks found</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden flex items-center gap-1.5 text-[13px] text-gray-500 border border-gray-200 rounded-lg px-3 py-2 bg-white cursor-pointer hover:border-gray-300 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Filters {activeFilters > 0 && `(${activeFilters})`}
              </button>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-200 rounded-lg text-[13px] px-3 py-2 outline-none bg-white cursor-pointer text-gray-600 hover:border-gray-300 transition-colors">
                {(["Price: ascending", "Price: descending", "Most Popular", "Newest"] as SortOption[]).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile filters */}
          {filtersOpen && (
            <div className="lg:hidden bg-[#fafafa] rounded-xl p-5 mb-6 border border-gray-100">
              <Filters/>
            </div>
          )}

          {/* Active filter tags */}
          {searchQuery && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="text-[12px] text-gray-400">Searching:</span>
              <span className="inline-flex items-center gap-1.5 text-[12px] bg-accent-50 text-accent-700 px-2.5 py-1 rounded-md font-medium">
                {searchQuery}
                <button onClick={() => setSearchQuery("")} className="hover:text-accent-900 bg-transparent border-none cursor-pointer p-0 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            </div>
          )}

          {/* Grid */}
          {paginated.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-[14px]">No artworks found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((p) => <ProductCard key={p.id} product={p}/>)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[13px] text-gray-400 disabled:opacity-30 cursor-pointer hover:bg-[#f5f5f5] bg-white transition-colors">‹</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg border text-[13px] cursor-pointer transition-colors ${currentPage === i + 1 ? "bg-accent-600 text-white border-accent-600" : "border-gray-200 text-gray-500 hover:bg-[#f5f5f5] bg-white"}`}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[13px] text-gray-400 disabled:opacity-30 cursor-pointer hover:bg-[#f5f5f5] bg-white transition-colors">›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
