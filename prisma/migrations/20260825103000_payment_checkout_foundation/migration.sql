CREATE TYPE "CheckoutSessionStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED', 'FAILED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

CREATE TABLE "checkout_sessions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "stripeSessionId" TEXT,
  "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'PENDING',
  "currency" TEXT NOT NULL DEFAULT 'inr',
  "amount" INTEGER NOT NULL,
  "quoteSnapshot" JSONB NOT NULL,
  "shippingAddress" TEXT NOT NULL,
  "promoCode" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "checkout_sessions_stripeSessionId_key" ON "checkout_sessions"("stripeSessionId");
CREATE UNIQUE INDEX "checkout_sessions_userId_idempotencyKey_key" ON "checkout_sessions"("userId", "idempotencyKey");
CREATE INDEX "checkout_sessions_userId_status_createdAt_idx" ON "checkout_sessions"("userId", "status", "createdAt");

CREATE TABLE "payments" (
  "id" TEXT NOT NULL,
  "checkoutSessionId" TEXT NOT NULL,
  "orderId" TEXT,
  "stripePaymentId" TEXT,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "payments_checkoutSessionId_key" ON "payments"("checkoutSessionId");
CREATE UNIQUE INDEX "payments_orderId_key" ON "payments"("orderId");
CREATE UNIQUE INDEX "payments_stripePaymentId_key" ON "payments"("stripePaymentId");
CREATE INDEX "payments_status_createdAt_idx" ON "payments"("status", "createdAt");

CREATE TABLE "payment_events" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT,
  "stripeEventId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "payment_events_stripeEventId_key" ON "payment_events"("stripeEventId");
CREATE INDEX "payment_events_paymentId_createdAt_idx" ON "payment_events"("paymentId", "createdAt");

ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "checkout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
