import { describe, expect, it } from "vitest";
import {
  getPageRouteAccess,
  isAdminRole,
  isArtistApiMutation,
  isArtistRole,
  isProtectedApiRoute,
} from "@/lib/route-access";

describe("route access policy", () => {
  it("protects account pages without matching similarly named public paths", () => {
    expect(getPageRouteAccess("/profile")).toBe("authenticated");
    expect(getPageRouteAccess("/profile/settings")).toBe("authenticated");
    expect(getPageRouteAccess("/profiled")).toBe("public");
    expect(getPageRouteAccess("/products/abc")).toBe("public");
  });

  it("requires an artist role for the artist workspace", () => {
    expect(getPageRouteAccess("/artist-portal")).toBe("artist");
    expect(getPageRouteAccess("/artist-portal/artworks")).toBe("artist");
    expect(isArtistRole("ARTIST")).toBe(true);
    expect(isArtistRole("ADMIN")).toBe(true);
    expect(isArtistRole("USER")).toBe(false);
  });

  it("requires an administrator role for the admin workspace", () => {
    expect(getPageRouteAccess("/admin")).toBe("admin");
    expect(getPageRouteAccess("/admin/reports")).toBe("admin");
    expect(getPageRouteAccess("/administrator")).toBe("public");
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("ARTIST")).toBe(false);
  });

  it("keeps API protection boundary-aware", () => {
    expect(isProtectedApiRoute("/api/cart")).toBe(true);
    expect(isProtectedApiRoute("/api/cart/item")).toBe(true);
    expect(isProtectedApiRoute("/api/cartoon")).toBe(false);
    expect(isProtectedApiRoute("/api/reviews", "GET")).toBe(false);
    expect(isProtectedApiRoute("/api/reviews", "POST")).toBe(true);
    expect(isProtectedApiRoute("/api/reviews/abc", "PATCH")).toBe(true);
    expect(isProtectedApiRoute("/api/reports", "POST")).toBe(true);
    expect(isProtectedApiRoute("/api/checkout/quote", "POST")).toBe(true);
    expect(isProtectedApiRoute("/api/artist/orders", "GET")).toBe(true);
    expect(isProtectedApiRoute("/api/artist/order-items/item-1", "PATCH")).toBe(true);
    expect(isProtectedApiRoute("/api/admin/reports", "GET")).toBe(true);
    expect(isProtectedApiRoute("/api/artists/abc/follow", "GET")).toBe(true);
    expect(isArtistApiMutation("/api/artists/abc/follow", "POST")).toBe(false);
    expect(isArtistApiMutation("/api/artists", "POST")).toBe(true);
    expect(isArtistApiMutation("/api/artists/abc", "POST")).toBe(true);
    expect(isArtistApiMutation("/api/artists", "GET")).toBe(false);
  });
});
