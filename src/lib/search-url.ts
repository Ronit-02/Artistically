export type SearchSortParam = "price_asc" | "price_desc" | "popular" | "newest";

export type SearchUrlOptions = {
  types?: readonly string[];
  prices?: readonly string[];
  ratings?: readonly number[];
  sort?: SearchSortParam;
  page?: number;
};

export type ParsedSearchUrl = SearchUrlOptions & { query: string };

const SORT_VALUES: readonly SearchSortParam[] = ["price_asc", "price_desc", "popular", "newest"];

function appendValues(params: URLSearchParams, key: string, values: readonly (string | number)[] | undefined) {
  values?.forEach((value) => params.append(key, String(value)));
}

export function buildSearchHref(query: string, options: SearchUrlOptions = {}): string {
  const params = new URLSearchParams();
  const normalized = query.trim();
  if (normalized) params.set("q", normalized);

  appendValues(params, "type", options.types);
  appendValues(params, "price", options.prices);
  appendValues(params, "rating", options.ratings);
  if (options.sort) params.set("sort", options.sort);
  if (options.page && options.page > 1) params.set("page", String(Math.floor(options.page)));

  const encoded = params.toString();
  return encoded ? `/search?${encoded}` : "/search";
}

type SearchParamsLike = Pick<URLSearchParams, "get" | "getAll">;

export function parseSearchUrl(params: SearchParamsLike): ParsedSearchUrl {
  const sort = params.get("sort");
  const pageValue = Number.parseInt(params.get("page") ?? "1", 10);

  return {
    query: params.get("q")?.trim() ?? "",
    types: params.getAll("type"),
    prices: params.getAll("price"),
    ratings: params.getAll("rating").map(Number).filter(Number.isFinite),
    ...(sort && SORT_VALUES.includes(sort as SearchSortParam) ? { sort: sort as SearchSortParam } : {}),
    page: Number.isFinite(pageValue) && pageValue > 1 ? Math.floor(pageValue) : 1,
  };
}
