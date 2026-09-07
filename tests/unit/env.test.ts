import { describe, expect, it } from "vitest";
import { parseServerEnv } from "@/lib/env";

describe("parseServerEnv", () => {
  it("uses safe local defaults outside production", () => {
    const environment = parseServerEnv({ NODE_ENV: "test", JWT_SECRET: "test-only-secret-with-at-least-thirty-two-characters" });

    expect(environment).toMatchObject({
      NODE_ENV: "test",
      NEXT_PUBLIC_APP_URL: "http://localhost:3001",
    });
  });

  it("requires database and JWT configuration in production", () => {
    expect(() => parseServerEnv({ NODE_ENV: "production", JWT_SECRET: "test-only-secret-with-at-least-thirty-two-characters" })).toThrow(
      /DATABASE_URL is required in production/
    );
  });

  it("accepts a complete production environment", () => {
    const environment = parseServerEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://user:password@example.com:5432/artistically",
      JWT_SECRET: "a-secure-production-secret-with-32-characters",
      NEXT_PUBLIC_APP_URL: "https://artistically.example",
    });

    expect(environment.NODE_ENV).toBe("production");
    expect(environment.DATABASE_URL).toContain("postgresql://");
  });
});
