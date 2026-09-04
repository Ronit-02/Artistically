import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { InvalidStateError } from "@/lib/domain-errors";
import { notificationService, safeNotify } from "@/lib/services/notification.service";
import { logger } from "@/lib/logger";

type ConnectLinkInput = {
  returnUrl: string;
  refreshUrl: string;
};

type PayoutInput = {
  amountMinor: number;
  idempotencyKey: string;
};

function stripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new InvalidStateError("Seller payments are not configured");
  return new Stripe(secretKey);
}

export const connectService = {
  async createOnboardingLink(userId: string, input: ConnectLinkInput) {
    const artist = await prisma.artist.findUnique({
      where: { userId },
      select: { id: true, stripeAccount: { select: { id: true, stripeAccountId: true } } },
    });
    if (!artist) throw new InvalidStateError("Artist profile is required before seller onboarding");

    const stripe = stripeClient();
    let stripeAccountId = artist.stripeAccount?.stripeAccountId;
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        metadata: { artist_id: artist.id },
      });
      stripeAccountId = account.id;
      await prisma.stripeAccount.create({
        data: { artistId: artist.id, stripeAccountId, status: "ONBOARDING" },
      });
    } else {
      await prisma.stripeAccount.update({
        where: { artistId: artist.id },
        data: { status: "ONBOARDING" },
      });
    }

    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: input.refreshUrl,
      return_url: input.returnUrl,
      type: "account_onboarding",
    });
    return { url: link.url, stripeAccountId };
  },

  async handleAccountUpdated(account: Stripe.Account) {
    const disabled = Boolean(account.requirements?.disabled_reason);
    const active = Boolean(account.details_submitted && account.charges_enabled && account.payouts_enabled);
    const status = disabled ? "DISABLED" : active ? "ACTIVE" : account.details_submitted ? "RESTRICTED" : "ONBOARDING";
    const updated = await prisma.stripeAccount.updateMany({
      where: { stripeAccountId: account.id },
      data: {
        status,
        detailsSubmitted: Boolean(account.details_submitted),
        chargesEnabled: Boolean(account.charges_enabled),
        payoutsEnabled: Boolean(account.payouts_enabled),
      },
    });
    return { updated: updated.count === 1, status };
  },

  async handlePayoutEvent(eventType: string, payout: Stripe.Payout, connectedAccountId: string | null) {
    if (!connectedAccountId) return { updated: false, reason: "missing_connected_account" as const };
    const account = await prisma.stripeAccount.findUnique({
      where: { stripeAccountId: connectedAccountId },
      select: { artistId: true },
    });
    if (!account) return { updated: false, reason: "account_not_found" as const };

    const status = eventType === "payout.paid" ? "PAID" : eventType === "payout.failed" || eventType === "payout.canceled" ? "FAILED" : eventType === "payout.created" ? "PENDING" : "IN_TRANSIT";
    const existing = typeof prisma.payout.findUnique === "function" ? await prisma.payout.findUnique({ where: { stripePayoutId: payout.id }, select: { status: true, paidAt: true } }) : null;
    if (existing?.status === "PAID" && status !== "PAID") return { updated: true, payout: existing };
    const updated = await prisma.payout.upsert({
      where: { stripePayoutId: payout.id },
      create: {
        artistId: account.artistId,
        stripePayoutId: payout.id,
        status,
        amount: payout.amount,
        currency: payout.currency,
        availableAt: payout.arrival_date ? new Date(payout.arrival_date * 1000) : undefined,
        paidAt: status === "PAID" ? new Date() : undefined,
      },
      update: {
        status,
        amount: payout.amount,
        currency: payout.currency,
        availableAt: payout.arrival_date ? new Date(payout.arrival_date * 1000) : undefined,
        paidAt: status === "PAID" ? existing?.paidAt ?? new Date() : existing?.paidAt,
      },
      select: { id: true, status: true, amount: true, currency: true, stripePayoutId: true },
    });
    const artist = await prisma.artist.findUnique({ where: { id: account.artistId }, select: { userId: true } });
    if (artist) safeNotify(notificationService.create({ userId: artist.userId, kind: "PAYOUT", title: `Payout ${status.toLowerCase().replace("_", " ")}`, body: `Your Stripe payout is ${status.toLowerCase().replace("_", " ")}.`, href: "/artist-portal?tab=overview", dedupeKey: `payout:${payout.id}:${status}` }));
    return { updated: true, payout: updated };
  },

  async createTransferForSellerOrder(sellerOrderId: string) {
    const sellerOrder = await prisma.sellerOrder.findUnique({
      where: { id: sellerOrderId },
      select: {
        id: true,
        artistId: true,
        total: true,
        artist: { select: { userId: true, stripeAccount: { select: { stripeAccountId: true, status: true, payoutsEnabled: true } } } },
        platformFees: { select: { amount: true, currency: true } },
        settlement: true,
        transfers: { take: 1 },
      },
    });
    if (!sellerOrder) throw new InvalidStateError("Seller order not found");
    const existingTransfer = sellerOrder.transfers[0] ?? null;
    if (existingTransfer?.status === "CREATED") return existingTransfer;
    const account = sellerOrder.artist.stripeAccount;
    if (!account || account.status !== "ACTIVE" || !account.payoutsEnabled) {
      throw new InvalidStateError("Seller Stripe account is not ready for transfers");
    }

    const fee = sellerOrder.platformFees.reduce((sum, item) => sum + item.amount, 0);
    const currency = sellerOrder.platformFees[0]?.currency ?? "inr";
    const settlement = sellerOrder.settlement ?? await prisma.sellerSettlement.create({
      data: {
        artistId: sellerOrder.artistId,
        sellerOrderId: sellerOrder.id,
        currency,
        grossAmount: sellerOrder.total,
        shippingAmount: 0,
        platformFeeAmount: fee,
        netAmount: sellerOrder.total - fee,
      },
    });
    const amount = settlement.netAmount - settlement.refundAmount;
    if (amount < 1) throw new InvalidStateError("Seller settlement has no transferable balance");
    const idempotencyKey = `seller-transfer:${settlement.id}`;
    const stripe = stripeClient();
    const transfer = await stripe.transfers.create({
      amount,
      currency,
      destination: account.stripeAccountId,
      metadata: { artistically_settlement_id: settlement.id, seller_order_id: sellerOrder.id },
    }, { idempotencyKey });
    const saved = await prisma.$transaction(async (tx) => {
      const savedTransfer = await tx.stripeTransfer.upsert({
        where: { settlementId: settlement.id },
        create: {
          artistId: sellerOrder.artistId,
          sellerOrderId: sellerOrder.id,
          settlementId: settlement.id,
          stripeTransferId: transfer.id,
          stripeBalanceTransactionId: typeof transfer.balance_transaction === "string" ? transfer.balance_transaction : null,
          destinationAccountId: account.stripeAccountId,
          status: "CREATED",
          amount,
          currency,
          idempotencyKey,
        },
        update: {
          stripeTransferId: transfer.id,
          stripeBalanceTransactionId: typeof transfer.balance_transaction === "string" ? transfer.balance_transaction : null,
          status: "CREATED",
          amount,
          currency,
        },
      });
      await tx.sellerSettlement.update({ where: { id: settlement.id }, data: { transferredAmount: amount, status: "TRANSFERRED", reconciledAt: new Date() } });
      return savedTransfer;
    });
    return saved;
  },

  async createPayoutForArtist(userId: string, input: PayoutInput) {
    if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor < 1) throw new InvalidStateError("Payout amount must be a positive integer");
    const artist = await prisma.artist.findUnique({
      where: { userId },
      select: { id: true, stripeAccount: { select: { stripeAccountId: true, status: true, payoutsEnabled: true } } },
    });
    if (!artist?.stripeAccount || artist.stripeAccount.status !== "ACTIVE" || !artist.stripeAccount.payoutsEnabled) throw new InvalidStateError("Seller Stripe account is not ready for payouts");
    const outstanding = await prisma.sellerSettlement.aggregate({ where: { artistId: artist.id }, _sum: { netAmount: true, refundAmount: true, transferredAmount: true } });
    const payouts = typeof prisma.payout.aggregate === "function"
      ? await prisma.payout.aggregate({ where: { artistId: artist.id, status: { in: ["PENDING", "IN_TRANSIT", "PAID"] } }, _sum: { amount: true } })
      : { _sum: { amount: 0 } };
    const available = (outstanding._sum.transferredAmount ?? 0) - (payouts._sum.amount ?? 0);
    if (input.amountMinor > available) throw new InvalidStateError("Payout amount exceeds the available seller balance");
    const stripe = stripeClient();
    const payout = await stripe.payouts.create({ amount: input.amountMinor, currency: "inr", metadata: { artist_id: artist.id } }, { stripeAccount: artist.stripeAccount.stripeAccountId, idempotencyKey: `artist-payout:${input.idempotencyKey}` });
    return prisma.payout.upsert({
      where: { stripePayoutId: payout.id },
      create: { artistId: artist.id, stripePayoutId: payout.id, status: "PENDING", amount: payout.amount, currency: payout.currency, availableAt: payout.arrival_date ? new Date(payout.arrival_date * 1000) : null },
      update: { amount: payout.amount, currency: payout.currency, availableAt: payout.arrival_date ? new Date(payout.arrival_date * 1000) : null },
      select: { id: true, status: true, amount: true, currency: true, availableAt: true, paidAt: true, stripePayoutId: true },
    });
  },

  async handleTransferEvent(eventType: string, transfer: Stripe.Transfer) {
    const metadata = transfer.metadata ?? {};
    const existing = await prisma.stripeTransfer.findFirst({ where: { OR: [{ stripeTransferId: transfer.id }, ...(typeof metadata.artistically_settlement_id === "string" ? [{ settlementId: metadata.artistically_settlement_id }] : [])] }, select: { id: true, settlementId: true, status: true, amount: true } });
    if (!existing) return { updated: false, reason: "transfer_not_found" as const };
    const reversedAmount = typeof transfer.amount_reversed === "number" ? transfer.amount_reversed : 0;
    const status = eventType === "transfer.reversed" || reversedAmount > 0 ? "REVERSED" : "CREATED";
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.stripeTransfer.update({ where: { id: existing.id }, data: { stripeTransferId: transfer.id, status, reversedAmount } });
      await tx.sellerSettlement.update({ where: { id: existing.settlementId }, data: { status: status === "REVERSED" ? "OUT_OF_BALANCE" : "TRANSFERRED", reconciledAt: new Date() } });
      return row;
    });
    return { updated: true, transfer: updated };
  },

  async reconcilePendingTransfers() {
    const settlements = await prisma.sellerSettlement.findMany({ where: { status: "PENDING" }, select: { sellerOrderId: true }, orderBy: { createdAt: "asc" }, take: 100 });
    const results = [] as Array<{ sellerOrderId: string; transferred: boolean; reason?: string }>;
    for (const settlement of settlements) {
      try {
        await this.createTransferForSellerOrder(settlement.sellerOrderId);
        results.push({ sellerOrderId: settlement.sellerOrderId, transferred: true });
      } catch (error) {
        logger.warn("seller_transfer_reconciliation_failed", { sellerOrderId: settlement.sellerOrderId, error });
        results.push({ sellerOrderId: settlement.sellerOrderId, transferred: false, reason: error instanceof Error ? error.message : "Transfer failed" });
      }
    }
    return { attempted: results.length, results };
  },
};
