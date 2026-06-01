// ─────────────────────────────────────────────────────────────────────────────
// lib/prisma.ts
// Singleton Prisma client — prevents multiple instances in dev (hot reload)
// Falls back to a mock when @prisma/client isn't generated (concept demo mode)
// ─────────────────────────────────────────────────────────────────────────────

let prisma: any;

try {
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = globalThis as unknown as { prisma: any };
  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} catch {
  // @prisma/client not generated — provide a no-op proxy for build
  const handler: ProxyHandler<object> = {
    get: () => new Proxy({}, handler),
    apply: () => Promise.resolve(null),
  };
  prisma = new Proxy({}, handler);
}

export { prisma };
