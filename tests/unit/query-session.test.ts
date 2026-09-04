import { describe, expect, it, vi } from "vitest";
import { clearIdentityQueries } from "@/lib/query-session";

describe("clearIdentityQueries", () => {
  it("removes every identity-sensitive query root", () => {
    const queryClient = { removeQueries: vi.fn() };

    clearIdentityQueries(queryClient as never);

    expect(queryClient.removeQueries).toHaveBeenCalledTimes(6);
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ["auth"] });
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ["cart"] });
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ["wishlist"] });
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ["orders"] });
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ["seller-orders"] });
    expect(queryClient.removeQueries).toHaveBeenCalledWith({ queryKey: ["seller-reviews"] });
  });
});
