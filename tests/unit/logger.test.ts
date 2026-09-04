import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "@/lib/logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes structured JSON with event context", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);

    logger.info("catalog.read", { requestId: "request-1", count: 3 });

    expect(info).toHaveBeenCalledOnce();
    const entry = JSON.parse(info.mock.calls[0][0]);
    expect(entry).toMatchObject({
      level: "info",
      event: "catalog.read",
      requestId: "request-1",
      count: 3,
    });
    expect(entry.timestamp).toEqual(expect.any(String));
  });
});
