import { describe, expect, it } from "vitest";
import { getProfileTab } from "@/lib/profile-tabs";

describe("profile tab URL state", () => {
  it("restores a supported tab from the query string", () => {
    expect(getProfileTab("?tab=orders")).toBe("orders");
  });

  it("falls back to profile for missing or unsupported tabs", () => {
    expect(getProfileTab("")).toBe("profile");
    expect(getProfileTab("?tab=unknown")).toBe("profile");
  });
});
