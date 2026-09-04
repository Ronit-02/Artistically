CREATE TYPE "SellerOrderStatus" AS ENUM ('PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'LABEL_CREATED', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION');
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'PAID', 'FAILED');

ALTER TABLE "order_items" ADD COLUMN "sellerOrderId" TEXT;

CREATE TABLE "seller_orders" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "artistId" TEXT NOT NULL,
  "status" "SellerOrderStatus" NOT NULL DEFAULT 'PROCESSING',
  "subtotal" DOUBLE PRECISION NOT NULL,
  "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "seller_orders_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "seller_orders_orderId_artistId_key" ON "seller_orders"("orderId", "artistId");
CREATE INDEX "seller_orders_artistId_status_createdAt_idx" ON "seller_orders"("artistId", "status", "createdAt");

CREATE TABLE "shipments" (
  "id" TEXT NOT NULL,
  "sellerOrderId" TEXT NOT NULL,
  "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
  "carrier" TEXT,
  "trackingNumber" TEXT,
  "trackingUrl" TEXT,
  "shippedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "shipments_sellerOrderId_key" ON "shipments"("sellerOrderId");
CREATE INDEX "shipments_status_updatedAt_idx" ON "shipments"("status", "updatedAt");

CREATE TABLE "shipment_events" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "providerEventId" TEXT,
  "status" "ShipmentStatus" NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "location" TEXT,
  "note" TEXT,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shipment_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "shipment_events_providerEventId_key" ON "shipment_events"("providerEventId");
CREATE INDEX "shipment_events_shipmentId_occurredAt_idx" ON "shipment_events"("shipmentId", "occurredAt");

CREATE TABLE "refunds" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "paymentId" TEXT,
  "sellerOrderId" TEXT,
  "stripeRefundId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "refunds_stripeRefundId_key" ON "refunds"("stripeRefundId");
CREATE UNIQUE INDEX "refunds_idempotencyKey_key" ON "refunds"("idempotencyKey");
CREATE INDEX "refunds_orderId_status_createdAt_idx" ON "refunds"("orderId", "status", "createdAt");
CREATE INDEX "refunds_paymentId_createdAt_idx" ON "refunds"("paymentId", "createdAt");

CREATE TABLE "platform_fees" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "sellerOrderId" TEXT,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "platform_fees_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "platform_fees_orderId_createdAt_idx" ON "platform_fees"("orderId", "createdAt");

CREATE TABLE "payouts" (
  "id" TEXT NOT NULL,
  "artistId" TEXT NOT NULL,
  "sellerOrderId" TEXT,
  "stripePayoutId" TEXT,
  "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "availableAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "payouts_stripePayoutId_key" ON "payouts"("stripePayoutId");
CREATE INDEX "payouts_artistId_status_createdAt_idx" ON "payouts"("artistId", "status", "createdAt");
CREATE INDEX "payouts_sellerOrderId_createdAt_idx" ON "payouts"("sellerOrderId", "createdAt");
CREATE INDEX "order_items_sellerOrderId_idx" ON "order_items"("sellerOrderId");

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "seller_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "seller_orders" ADD CONSTRAINT "seller_orders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "seller_orders" ADD CONSTRAINT "seller_orders_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "seller_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipment_events" ADD CONSTRAINT "shipment_events_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "seller_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "platform_fees" ADD CONSTRAINT "platform_fees_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "platform_fees" ADD CONSTRAINT "platform_fees_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "seller_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "seller_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
