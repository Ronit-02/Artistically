import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { assertCsrf } from "@/lib/api-response";
import { enforceRateLimit, opaqueRateLimitKey, RateLimitError } from "@/lib/rate-limit";
import { parseServerEnv } from "@/lib/env";

describe("security controls", () => {
  it("requires a configured signing secret in every environment", () => {
    expect(() => parseServerEnv({ NODE_ENV: "test" })).toThrow(/JWT_SECRET/);
  });

  it("rejects cross-origin cookie-authenticated mutations", () => {
    expect(() => assertCsrf(new NextRequest("http://localhost:3001/api/cart", { method: "POST", headers: { cookie: "artistically_access=token", origin: "https://attacker.example" } }))).toThrow();
    expect(() => assertCsrf(new NextRequest("http://localhost:3001/api/cart", { method: "POST", headers: { cookie: "artistically_access=token", origin: "http://localhost:3001" } }))).not.toThrow();
  });

  it("hashes rate-limit keys and enforces a bounded window", async () => {
    const key = opaqueRateLimitKey("test", "collector@example.com");
    expect(key).not.toContain("collector@example.com");
    await enforceRateLimit(key, { max: 1, windowMs: 60_000 });
    await expect(enforceRateLimit(key, { max: 1, windowMs: 60_000 })).rejects.toBeInstanceOf(RateLimitError);
  });
});
