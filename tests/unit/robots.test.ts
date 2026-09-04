import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots metadata", () => {
  it("allows public discovery and excludes private or operational routes", () => {
    const metadata = robots();
    const rules = Array.isArray(metadata.rules) ? metadata.rules[0] : metadata.rules;
    const disallow = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];

    expect(rules.allow).toBe("/");
    expect(disallow).toEqual(expect.arrayContaining(["/api/", "/profile/", "/admin/"]));
    expect(metadata.sitemap).toContain("/sitemap.xml");
  });
});
