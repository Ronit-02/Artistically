import { describe, expect, it } from "vitest";
import { getArtistPortalTab } from "@/lib/artist-portal-tabs";

describe("artist portal tab URL state", () => {
  it("restores a supported tab from the query string", () => {
    expect(getArtistPortalTab("?tab=artworks")).toBe("artworks");
  });

  it("falls back to overview for missing or unsupported tabs", () => {
    expect(getArtistPortalTab("")).toBe("overview");
    expect(getArtistPortalTab("?tab=unknown")).toBe("overview");
  });
});
