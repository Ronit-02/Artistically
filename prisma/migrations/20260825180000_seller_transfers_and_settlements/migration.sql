CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'CREATED', 'FAILED', 'REVERSED');
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'TRANSFERRED', 'REFUNDED', 'OUT_OF_BALANCE');

CREATE TABLE "seller_settlements" (
  "id" TEXT NOT NULL,
  "artistId" TEXT NOT NULL,
  "sellerOrderId" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "grossAmount" INTEGER NOT NULL,
  "shippingAmount" INTEGER NOT NULL,
  "platformFeeAmount" INTEGER NOT NULL,
  "refundAmount" INTEGER NOT NULL DEFAULT 0,
  "netAmount" INTEGER NOT NULL,
  "transferredAmount" INTEGER NOT NULL DEFAULT 0,
  "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
  "reconciledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seller_settlements_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "seller_settlements_sellerOrderId_key" ON "seller_settlements"("sellerOrderId");
CREATE INDEX "seller_settlements_artistId_status_createdAt_idx" ON "seller_settlements"("artistId", "status", "createdAt");

CREATE TABLE "stripe_transfers" (
  "id" TEXT NOT NULL,
  "artistId" TEXT NOT NULL,
  "sellerOrderId" TEXT NOT NULL,
  "settlementId" TEXT NOT NULL,
  "stripeTransferId" TEXT,
  "stripeBalanceTransactionId" TEXT,
  "destinationAccountId" TEXT NOT NULL,
  "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "reversedAmount" INTEGER NOT NULL DEFAULT 0,
  "idempotencyKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "stripe_transfers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "stripe_transfers_settlementId_key" ON "stripe_transfers"("settlementId");
CREATE UNIQUE INDEX "stripe_transfers_stripeTransferId_key" ON "stripe_transfers"("stripeTransferId");
CREATE UNIQUE INDEX "stripe_transfers_idempotencyKey_key" ON "stripe_transfers"("idempotencyKey");
CREATE INDEX "stripe_transfers_artistId_status_createdAt_idx" ON "stripe_transfers"("artistId", "status", "createdAt");
CREATE INDEX "stripe_transfers_sellerOrderId_createdAt_idx" ON "stripe_transfers"("sellerOrderId", "createdAt");

ALTER TABLE "seller_settlements" ADD CONSTRAINT "seller_settlements_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seller_settlements" ADD CONSTRAINT "seller_settlements_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "seller_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stripe_transfers" ADD CONSTRAINT "stripe_transfers_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stripe_transfers" ADD CONSTRAINT "stripe_transfers_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "seller_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stripe_transfers" ADD CONSTRAINT "stripe_transfers_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "seller_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
