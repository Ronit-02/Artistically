import { afterEach, describe, expect, it, vi } from "vitest";
import { createReport } from "@/lib/api/reports";

afterEach(() => vi.unstubAllGlobals());

describe("reports API adapter", () => {
  it("posts the selected target and report details", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { id: "report-1", status: "OPEN" },
    }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await createReport({
      targetType: "PRODUCT",
      targetId: "product-1",
      reason: "COPYRIGHT",
      details: "The image appears to be used without permission.",
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/reports", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        targetType: "PRODUCT",
        targetId: "product-1",
        reason: "COPYRIGHT",
        details: "The image appears to be used without permission.",
      }),
    }));
  });
});
