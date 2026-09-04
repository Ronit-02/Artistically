export const PROFILE_TABS = ["profile", "orders", "wishlist"] as const;

export type ProfileTab = (typeof PROFILE_TABS)[number];

export function getProfileTab(search: string): ProfileTab {
  const requestedTab = new URLSearchParams(search).get("tab");
  return requestedTab && PROFILE_TABS.includes(requestedTab as ProfileTab)
    ? requestedTab as ProfileTab
    : "profile";
}
