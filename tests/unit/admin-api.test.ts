import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api/client";
import { listAdminReports, resolveAdminReport } from "@/lib/api/admin";

afterEach(() => vi.unstubAllGlobals());

describe("admin moderation API adapter", () => {
  it("loads reports with the selected status", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await listAdminReports("RESOLVED");

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/reports?status=RESOLVED", expect.objectContaining({ credentials: "include" }));
  });

  it("preserves API errors for decision feedback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, error: "Only open reports can be resolved" }), { status: 403 })));

    await expect(resolveAdminReport("report-1", { status: "DISMISSED" })).rejects.toMatchObject({ name: "ApiClientError", status: 403, message: "Only open reports can be resolved" } satisfies Partial<ApiClientError>);
  });
});
