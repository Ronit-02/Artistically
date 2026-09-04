import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { $queryRaw: vi.fn() },
}));

import { GET as getLive } from "@/app/api/health/live/route";
import { GET as getReady } from "@/app/api/health/ready/route";
import { prisma } from "@/lib/prisma";

describe("health routes", () => {
  it("returns a process liveness response", async () => {
    const response = getLive();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toBeUndefined();
    expect(body.check).toBe("liveness");
  });

  it("reports database readiness", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ ok: 1 }]);
    const response = await getReady();
    expect(response.status).toBe(200);
    expect((await response.json()).dependencies.database).toBe("ok");
  });

  it("returns 503 when the database is unavailable", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error("database unavailable"));
    const response = await getReady();
    expect(response.status).toBe(503);
    expect((await response.json()).dependencies.database).toBe("failed");
  });
});
