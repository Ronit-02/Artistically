export type PageRouteAccess = "public" | "authenticated" | "artist" | "admin";

const AUTHENTICATED_PAGE_ROUTES = [
  "/profile",
  "/cart",
  "/wishlist",
  "/tracking",
] as const;

const ARTIST_PAGE_ROUTES = ["/artist-portal"] as const;
const ADMIN_PAGE_ROUTES = ["/admin"] as const;

const PROTECTED_API_ROUTES = [
  "/api/cart",
  "/api/orders",
  "/api/wishlist",
  "/api/auth/me",
  "/api/users",
] as const;

const REVIEW_API_ROUTE = "/api/reviews";
const ADMIN_API_ROUTE = "/api/admin";
const REPORT_API_ROUTE = "/api/reports";
const CHECKOUT_API_ROUTE = "/api/checkout";
const CHECKOUT_WEBHOOK_ROUTE = "/api/checkout/webhook";
const ARTIST_ORDER_API_ROUTE = "/api/artist";

function isArtistFollowRoute(pathname: string) {
  return /^\/api\/artists\/[^/]+\/follow$/.test(pathname);
}

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function getPageRouteAccess(pathname: string): PageRouteAccess {
  if (ADMIN_PAGE_ROUTES.some((route) => matchesRoute(pathname, route))) {
    return "admin";
  }

  if (ARTIST_PAGE_ROUTES.some((route) => matchesRoute(pathname, route))) {
    return "artist";
  }

  if (AUTHENTICATED_PAGE_ROUTES.some((route) => matchesRoute(pathname, route))) {
    return "authenticated";
  }

  return "public";
}

export function isProtectedApiRoute(pathname: string, method = "GET") {
  if (matchesRoute(pathname, CHECKOUT_WEBHOOK_ROUTE)) return false;
  if (isArtistFollowRoute(pathname)) return true;

  if (matchesRoute(pathname, REVIEW_API_ROUTE)) {
    return method !== "GET";
  }

  if (matchesRoute(pathname, ADMIN_API_ROUTE)) return true;

  if (matchesRoute(pathname, REPORT_API_ROUTE)) return true;

  if (matchesRoute(pathname, CHECKOUT_API_ROUTE)) return true;

  if (matchesRoute(pathname, ARTIST_ORDER_API_ROUTE)) return true;

  return PROTECTED_API_ROUTES.some((route) => matchesRoute(pathname, route));
}

export function isAdminApiRoute(pathname: string) {
  return matchesRoute(pathname, ADMIN_API_ROUTE);
}

export function isArtistApiRoute(pathname: string) {
  return matchesRoute(pathname, ARTIST_ORDER_API_ROUTE);
}

export function isArtistApiMutation(pathname: string, method: string) {
  return method === "POST" && matchesRoute(pathname, "/api/artists") && !isArtistFollowRoute(pathname);
}

export function isArtistRole(role: string) {
  return role === "ARTIST" || role === "ADMIN";
}

export function isAdminRole(role: string) {
  return role === "ADMIN";
}
