export const ARTIST_PORTAL_TABS = [
  "overview",
  "artworks",
  "collections",
  "orders",
  "analytics",
  "reviews",
  "settings",
] as const;

export type ArtistPortalTab = (typeof ARTIST_PORTAL_TABS)[number];

export function getArtistPortalTab(search: string): ArtistPortalTab {
  const requestedTab = new URLSearchParams(search).get("tab");
  return requestedTab && ARTIST_PORTAL_TABS.includes(requestedTab as ArtistPortalTab)
    ? requestedTab as ArtistPortalTab
    : "overview";
}
