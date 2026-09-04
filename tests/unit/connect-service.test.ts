import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  artistFindUnique: vi.fn(),
  stripeCreate: vi.fn(),
  stripeAccountRecordCreate: vi.fn(),
  stripeAccountUpdate: vi.fn(),
  stripeAccountUpdateMany: vi.fn(),
  stripeAccountFindUnique: vi.fn(),
  payoutUpsert: vi.fn(),
  accountLinkCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artist: { findUnique: mocks.artistFindUnique },
    stripeAccount: { create: mocks.stripeAccountRecordCreate, update: mocks.stripeAccountUpdate, updateMany: mocks.stripeAccountUpdateMany, findUnique: mocks.stripeAccountFindUnique },
    payout: { upsert: mocks.payoutUpsert },
  },
}));

vi.mock("stripe", () => ({
  default: class Stripe {
    accounts = { create: mocks.stripeCreate };
    accountLinks = { create: mocks.accountLinkCreate };
  },
}));

import { connectService } from "@/lib/services/connect.service";

describe("Stripe Connect service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_artistically";
    mocks.artistFindUnique.mockResolvedValue({ id: "artist-1", stripeAccount: null });
    mocks.stripeCreate.mockResolvedValue({ id: "acct_1" });
    mocks.stripeAccountRecordCreate.mockResolvedValue({});
    mocks.accountLinkCreate.mockResolvedValue({ url: "https://connect.stripe.test/onboard" });
    mocks.stripeAccountUpdate.mockResolvedValue({});
    mocks.stripeAccountUpdateMany.mockResolvedValue({ count: 1 });
    mocks.stripeAccountFindUnique.mockResolvedValue({ artistId: "artist-1" });
    mocks.payoutUpsert.mockResolvedValue({ id: "payout-1", status: "PAID", amount: 10000, currency: "inr", stripePayoutId: "po_1" });
  });

  it("creates and persists an Express account before creating the onboarding link", async () => {
    const result = await connectService.createOnboardingLink("artist-user-1", {
      returnUrl: "https://artistically.example/return",
      refreshUrl: "https://artistically.example/refresh",
    });

    expect(mocks.stripeCreate).toHaveBeenCalledWith({ type: "express", metadata: { artist_id: "artist-1" } });
    expect(mocks.accountLinkCreate).toHaveBeenCalledWith({
      account: "acct_1",
      refresh_url: "https://artistically.example/refresh",
      return_url: "https://artistically.example/return",
      type: "account_onboarding",
    });
    expect(result).toEqual({ url: "https://connect.stripe.test/onboard", stripeAccountId: "acct_1" });
  });

  it("reuses an existing connected account", async () => {
    mocks.artistFindUnique.mockResolvedValue({ id: "artist-1", stripeAccount: { id: "local-1", stripeAccountId: "acct_existing" } });

    await connectService.createOnboardingLink("artist-user-1", {
      returnUrl: "https://artistically.example/return",
      refreshUrl: "https://artistically.example/refresh",
    });

    expect(mocks.stripeCreate).not.toHaveBeenCalled();
    expect(mocks.stripeAccountUpdate).toHaveBeenCalledWith({ where: { artistId: "artist-1" }, data: { status: "ONBOARDING" } });
    expect(mocks.accountLinkCreate).toHaveBeenCalledWith(expect.objectContaining({ account: "acct_existing" }));
  });

  it("maps Stripe capability state to the durable account status", async () => {
    await connectService.handleAccountUpdated({
      id: "acct_1",
      details_submitted: true,
      charges_enabled: true,
      payouts_enabled: true,
      requirements: { disabled_reason: null },
    } as never);

    expect(mocks.stripeAccountUpdateMany).toHaveBeenCalledWith({
      where: { stripeAccountId: "acct_1" },
      data: { status: "ACTIVE", detailsSubmitted: true, chargesEnabled: true, payoutsEnabled: true },
    });
  });

  it("persists connected-account payout lifecycle events", async () => {
    const result = await connectService.handlePayoutEvent("payout.paid", {
      id: "po_1",
      amount: 10000,
      currency: "inr",
      arrival_date: 1787654400,
    } as never, "acct_1");

    expect(mocks.payoutUpsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripePayoutId: "po_1" },
      create: expect.objectContaining({ artistId: "artist-1", status: "PAID", amount: 10000, currency: "inr" }),
    }));
    expect(result).toMatchObject({ updated: true, payout: { status: "PAID" } });
  });
});
