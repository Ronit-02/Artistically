import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    "process.env.JWT_SECRET": JSON.stringify("test-only-secret-with-at-least-thirty-two-characters"),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    restoreMocks: true,
    env: {
      JWT_SECRET: "test-only-secret-with-at-least-thirty-two-characters",
      NEXT_PUBLIC_APP_URL: "http://localhost:3001",
      AUTH_TOKEN_ISSUER: "http://localhost:3001",
    },
  },
});
