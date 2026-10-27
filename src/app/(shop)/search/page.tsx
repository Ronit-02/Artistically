"use client";

import { Suspense, useEffect, useId, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useProductPage } from "@/hooks/useProducts";
import ProductCard from "@/components/product/ProductCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import type { SortOption } from "@/types";
import type { ProductListParams } from "@/lib/api/products";
import { buildSearchHref, parseSearchUrl, type SearchSortParam } from "@/lib/search-url";
import { API_CATEGORY_BY_LABEL, ART_TYPES, PRICE_RANGES, PRICE_RANGE_MAP } from "@/lib/catalog-taxonomy";

const RATINGS = [4, 3, 2, 1] as const;
const PER_PAGE = 12;
const SORT_PARAM_BY_LABEL: Record<SortOption, SearchSortParam> = {
  "Price: ascending": "price_asc",
  "Price: descending": "price_desc",
  "Most Popular": "popular",
  Newest: "newest",
};

const SORT_LABEL_BY_PARAM: Record<SearchSortParam, SortOption> = {
  price_asc: "Price: ascending",
  price_desc: "Price: descending",
  popular: "Most Popular",
  newest: "Newest",
};

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

type FilterValue = string | number;

function CheckGroup({
  label,
  items,
  checked,
  onToggle,
}: {
  label: string;
  items: readonly FilterValue[];
  checked: readonly FilterValue[];
  onToggle: (value: FilterValue) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const panelId = useId();

  return (
    <fieldset className="min-w-0 border-b border-gray-100 pb-3">
      <legend className="w-full p-0">
        <button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setIsOpen((current) => !current)} className="flex min-h-11 w-full items-center justify-between gap-3 bg-transparent p-0 text-left cursor-pointer">
          <span className="text-[12px] font-semibold text-[#111] uppercase tracking-wider">{label}</span>
          <svg aria-hidden="true" className={`h-4 w-4 shrink-0 text-gray-500 motion-safe:transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
      </legend>
      <div id={panelId} hidden={!isOpen} className="pl-4">
        {items.map((item) => (
          <label key={String(item)} className="flex min-h-11 items-center gap-2.5 cursor-pointer group">
            <input type="checkbox" aria-label={typeof item === "number" ? `${item} stars and up` : undefined} checked={checked.includes(item)} onChange={() => onToggle(item)} className="w-3.5 h-3.5 shrink-0 rounded border-gray-300 text-accent-600 cursor-pointer accent-accent-600"/>
            <span className="text-[13px] text-gray-500 group-hover:text-accent-600 transition-colors">
              {typeof item === "number" ? (
                <span className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} aria-hidden="true" className={`w-3 h-3 ${i < item ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} viewBox="0 0 18 18"><path d={STAR_PATH}/></svg>
                  ))}
                  <span className="text-[12px] text-gray-500">& up</span>
                </span>
              ) : item}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FilterPanel({
  checkedTypes,
  checkedPrices,
  checkedRatings,
  onToggleType,
  onTogglePrice,
  onToggleRating,
  onClear,
}: {
  checkedTypes: string[];
  checkedPrices: string[];
  checkedRatings: number[];
  onToggleType: (value: string) => void;
  onTogglePrice: (value: string) => void;
  onToggleRating: (value: number) => void;
  onClear: () => void;
}) {
  const activeFilters = checkedTypes.length + checkedPrices.length + checkedRatings.length;

  return (
    <div className="space-y-3">
      <CheckGroup label="Art Type" items={ART_TYPES} checked={checkedTypes} onToggle={(value) => onToggleType(String(value))}/>
      <CheckGroup label="Price Range" items={PRICE_RANGES} checked={checkedPrices} onToggle={(value) => onTogglePrice(String(value))}/>
      <CheckGroup label="Rating" items={RATINGS} checked={checkedRatings} onToggle={(value) => onToggleRating(Number(value))}/>
      {activeFilters > 0 && (
        <button type="button" onClick={onClear} className="inline-flex min-h-11 items-center text-[12px] text-red-500 hover:underline mt-1 bg-transparent border-none cursor-pointer p-0">
          Clear all filters
        </button>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div aria-busy="true" aria-label="Loading artworks" className="mx-auto grid max-w-[1240px] grid-cols-2 max-[379px]:grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-3 sm:px-10"><Skeleton className="aspect-[4/5] w-full" /><Skeleton className="aspect-[4/5] w-full" /><Skeleton className="aspect-[4/5] w-full" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { searchQuery, setSearchQuery } = useAppStore();
  const urlQuery = searchParams.get("q") ?? "";
  const searchStateKey = searchParams.toString();

  useEffect(() => {
    if (searchQuery !== urlQuery) {setSearchQuery(urlQuery);}
  }, [searchQuery, setSearchQuery, urlQuery]);

  return <SearchResults key={searchStateKey} searchQuery={urlQuery} setSearchQuery={setSearchQuery}/>;
}

function SearchResults({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsedUrl = useMemo(() => parseSearchUrl(searchParams), [searchParams]);
  const [sortBy, setSortBy] = useState<SortOption>(() => SORT_LABEL_BY_PARAM[parsedUrl.sort ?? "price_asc"]);
  const [checkedTypes, setCheckedTypes] = useState<string[]>(() => parsedUrl.types?.filter((type) => ART_TYPES.includes(type)) ?? []);
  const [checkedPrices, setCheckedPrices] = useState<string[]>(() => parsedUrl.prices?.filter((price) => PRICE_RANGES.includes(price)) ?? []);
  const [checkedRatings, setCheckedRatings] = useState<number[]>(() => parsedUrl.ratings?.filter((rating) => RATINGS.includes(rating as (typeof RATINGS)[number])) ?? []);
  const [currentPage, setCurrentPage] = useState(() => parsedUrl.page ?? 1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const href = buildSearchHref(searchQuery, {
      types: checkedTypes,
      prices: checkedPrices,
      ratings: checkedRatings,
      sort: SORT_PARAM_BY_LABEL[sortBy],
      page: currentPage,
    });
    const currentHref = searchParams.toString() ? `/search?${searchParams.toString()}` : "/search";
    if (href !== currentHref) {router.replace(href, { scroll: false });}
  }, [checkedPrices, checkedRatings, checkedTypes, currentPage, router, searchParams, searchQuery, sortBy]);

  const serverQuery = useMemo(() => {
    const sort = sortBy === "Price: ascending"
      ? "price_asc"
      : sortBy === "Price: descending"
        ? "price_desc"
        : sortBy === "Most Popular"
          ? "popular"
          : "newest";

    return {
      search: searchQuery || undefined,
      includeSold: searchQuery.trim().length > 0 || checkedTypes.length > 0,
      categories: checkedTypes.map((type) => API_CATEGORY_BY_LABEL[type]).filter((category): category is string => !!category),
      priceRanges: checkedPrices.map((price) => {
        const [minimum, maximum] = PRICE_RANGE_MAP[price] ?? [0, Infinity];
        return `${minimum}-${maximum === Infinity ? "+" : maximum}`;
      }),
      minRatings: checkedRatings,
      sortBy: sort as ProductListParams["sortBy"],
    };
  }, [checkedPrices, checkedRatings, checkedTypes, searchQuery, sortBy]);
  const { data: productPage, isLoading, isError, refetch } = useProductPage({
    ...serverQuery,
    page: currentPage,
    limit: PER_PAGE,
  });
  const products = useMemo(() => productPage?.products ?? [], [productPage]);

  const toggle = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) => {
    setCurrentPage(1);
    setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const clearFilters = () => {
    setCurrentPage(1);
    setCheckedTypes([]);
    setCheckedPrices([]);
    setCheckedRatings([]);
  };

  const clearSearch = () => {
    setSearchQuery("");
    router.replace(buildSearchHref("", {
      types: checkedTypes,
      prices: checkedPrices,
      ratings: checkedRatings,
      sort: SORT_PARAM_BY_LABEL[sortBy],
      page: currentPage,
    }), { scroll: false });
  };

  const totalPages = Math.max(1, productPage?.pagination.totalPages ?? 1);
  const visiblePages = Array.from(new Set([
    1,
    ...Array.from({ length: Math.min(3, totalPages) }, (_, index) =>
      Math.min(Math.max(2, currentPage - 1), Math.max(1, totalPages - 3)) + index),
    totalPages,
  ])).filter((page) => page <= totalPages).sort((left, right) => left - right);
  const paginated = products;
  const activeFilters = checkedTypes.length + checkedPrices.length + checkedRatings.length;

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-10 py-8 sm:py-10">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: searchQuery ? `Search: "${searchQuery}"` : "All Artworks" }]} className="mb-5"/>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 xl:w-56 flex-shrink-0">
          <h2 className="font-heading text-[15px] font-semibold text-[#111] mb-5">Filters</h2>
          <FilterPanel checkedTypes={checkedTypes} checkedPrices={checkedPrices} checkedRatings={checkedRatings} onToggleType={(value) => toggle(setCheckedTypes, value)} onTogglePrice={(value) => toggle(setCheckedPrices, value)} onToggleRating={(value) => toggle(setCheckedRatings, value)} onClear={clearFilters}/>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="font-heading text-[20px] sm:text-[24px] font-semibold text-[#111] tracking-tight-heading leading-snug">
                {searchQuery ? `Results for "${searchQuery}"` : "All Artworks"}
              </h1>
              <p className="text-[13px] text-gray-500 mt-0.5">{productPage?.pagination.total ?? 0} artworks found</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button type="button" aria-expanded={filtersOpen} aria-controls="mobile-artwork-filters" onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden min-h-11 flex items-center gap-1.5 text-[13px] text-gray-500 border border-gray-200 rounded-lg px-3 py-2 bg-white cursor-pointer hover:border-gray-300 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Filters {activeFilters > 0 && `(${activeFilters})`}
              </button>
              <select value={sortBy} onChange={(e) => { setCurrentPage(1); setSortBy(e.target.value as SortOption); }}
                aria-label="Sort artworks"
                className="min-h-11 border border-gray-200 rounded-lg text-[13px] px-3 py-2 outline-none bg-white cursor-pointer text-gray-600 hover:border-gray-300 focus-visible:ring-2 focus-visible:ring-accent-100 transition-colors">
                {(["Price: ascending", "Price: descending", "Most Popular", "Newest"] as SortOption[]).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile filters */}
          {filtersOpen && (
            <div id="mobile-artwork-filters" className="lg:hidden bg-[#fafafa] rounded-xl p-5 mb-6 border border-gray-100">
              <FilterPanel checkedTypes={checkedTypes} checkedPrices={checkedPrices} checkedRatings={checkedRatings} onToggleType={(value) => toggle(setCheckedTypes, value)} onTogglePrice={(value) => toggle(setCheckedPrices, value)} onToggleRating={(value) => toggle(setCheckedRatings, value)} onClear={clearFilters}/>
            </div>
          )}

          {/* Active filter tags */}
          {searchQuery && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className="text-[12px] text-gray-500">Searching:</span>
              <span className="inline-flex max-w-full items-center gap-1.5 text-[12px] bg-accent-50 text-accent-700 px-2.5 py-1 rounded-md font-medium">
                {searchQuery}
                <button type="button" onClick={clearSearch} aria-label="Clear search query" className="min-w-11 min-h-11 inline-flex items-center justify-center hover:text-accent-700 bg-transparent border-none cursor-pointer p-0 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <div aria-busy="true" aria-label="Loading artworks" className="grid grid-cols-2 max-[379px]:grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <div key={item} className="space-y-3"><Skeleton className="aspect-[4/5] w-full rounded-xl" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>)}</div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-[14px] mb-4">We couldn’t load artworks right now.</p>
              <Button variant="secondary" onClick={() => refetch()}>Try Again</Button>
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-[14px]">No artworks found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 max-[379px]:grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((p) => <ProductCard key={p.id} product={p}/>)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Artwork pagination" className="flex items-center justify-center gap-1.5 mt-10">
              <button type="button" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                aria-label="Previous page"
                className="min-w-11 min-h-11 rounded-lg border border-gray-200 flex items-center justify-center text-[13px] text-gray-500 disabled:opacity-30 cursor-pointer hover:bg-[#f5f5f5] bg-white transition-colors">‹</button>
              <span aria-live="polite" className="px-3 text-[13px] text-gray-500 sm:sr-only sm:px-0">Page {currentPage} of {totalPages}</span>
              <div className="hidden items-center gap-1.5 sm:flex">
                {visiblePages.map((page, index) => (
                  <div key={page} className="flex items-center gap-1.5">
                    {index > 0 && page - visiblePages[index - 1] > 1 && <span aria-hidden="true" className="px-1 text-[13px] text-gray-500">…</span>}
                    <button type="button" onClick={() => setCurrentPage(page)}
                      aria-label={`Go to page ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                      className={`min-w-11 min-h-11 rounded-lg border text-[13px] cursor-pointer transition-colors ${currentPage === page ? "bg-accent-600 text-white border-accent-600" : "border-gray-200 text-gray-500 hover:bg-[#f5f5f5] bg-white"}`}>{page}</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                aria-label="Next page"
                className="min-w-11 min-h-11 rounded-lg border border-gray-200 flex items-center justify-center text-[13px] text-gray-500 disabled:opacity-30 cursor-pointer hover:bg-[#f5f5f5] bg-white transition-colors">›</button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
