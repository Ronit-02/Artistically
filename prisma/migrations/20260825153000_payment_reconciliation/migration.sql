CREATE TYPE "PaymentReconciliationStatus" AS ENUM ('RECONCILED', 'OUT_OF_BALANCE');

CREATE TABLE "payment_reconciliations" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "capturedAmount" INTEGER NOT NULL,
  "sellerAllocatedAmount" INTEGER NOT NULL,
  "taxAmount" INTEGER NOT NULL,
  "discountAmount" INTEGER NOT NULL,
  "platformFeeAmount" INTEGER NOT NULL,
  "refundedAmount" INTEGER NOT NULL DEFAULT 0,
  "status" "PaymentReconciliationStatus" NOT NULL DEFAULT 'RECONCILED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payment_reconciliations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_reconciliations_paymentId_key" ON "payment_reconciliations"("paymentId");
CREATE UNIQUE INDEX "payment_reconciliations_orderId_key" ON "payment_reconciliations"("orderId");
CREATE INDEX "payment_reconciliations_status_updatedAt_idx" ON "payment_reconciliations"("status", "updatedAt");

ALTER TABLE "payment_reconciliations" ADD CONSTRAINT "payment_reconciliations_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_reconciliations" ADD CONSTRAINT "payment_reconciliations_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
