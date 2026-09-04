-- Fulfillment and post-purchase records
CREATE TYPE "DigitalDeliveryStatus" AS ENUM ('PENDING', 'AVAILABLE', 'DOWNLOADED', 'EXPIRED', 'REVOKED');
CREATE TYPE "DeliveryRecordType" AS ENUM ('ORDER_CONFIRMED', 'PROCESSING_STARTED', 'SHIPPED', 'DELIVERED', 'DIGITAL_AVAILABLE', 'DIGITAL_DOWNLOADED', 'CANCELLED', 'REFUNDED', 'DISPUTE_OPENED', 'DISPUTE_RESOLVED');
CREATE TYPE "DisputeType" AS ENUM ('DAMAGE', 'NON_DELIVERY', 'AUTHENTICITY', 'COPYRIGHT', 'DIGITAL_ACCESS', 'OTHER');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

ALTER TABLE "products" ADD COLUMN "processingDays" INTEGER;
ALTER TABLE "seller_orders" ADD COLUMN "processingDueAt" TIMESTAMP(3), ADD COLUMN "acceptedAt" TIMESTAMP(3), ADD COLUMN "lateAt" TIMESTAMP(3);

CREATE TABLE "digital_deliveries" (
  "id" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "assetReference" TEXT NOT NULL,
  "status" "DigitalDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "downloadLimit" INTEGER NOT NULL DEFAULT 3,
  "downloadCount" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3),
  "availableAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "lastDownloadedAt" TIMESTAMP(3),
  "licenseAcceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "digital_deliveries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "digital_deliveries_orderItemId_key" ON "digital_deliveries"("orderItemId");
CREATE INDEX "digital_deliveries_status_expiresAt_idx" ON "digital_deliveries"("status", "expiresAt");
ALTER TABLE "digital_deliveries" ADD CONSTRAINT "digital_deliveries_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "delivery_records" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "sellerOrderId" TEXT,
  "orderItemId" TEXT,
  "actorId" TEXT,
  "type" "DeliveryRecordType" NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "note" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "delivery_records_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "delivery_records_orderId_occurredAt_idx" ON "delivery_records"("orderId", "occurredAt");
CREATE INDEX "delivery_records_sellerOrderId_occurredAt_idx" ON "delivery_records"("sellerOrderId", "occurredAt");
CREATE INDEX "delivery_records_orderItemId_occurredAt_idx" ON "delivery_records"("orderItemId", "occurredAt");
ALTER TABLE "delivery_records" ADD CONSTRAINT "delivery_records_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "delivery_records" ADD CONSTRAINT "delivery_records_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "seller_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "delivery_records" ADD CONSTRAINT "delivery_records_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "delivery_records" ADD CONSTRAINT "delivery_records_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "disputes" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "claimantId" TEXT NOT NULL,
  "sellerOrderId" TEXT,
  "orderItemId" TEXT,
  "type" "DisputeType" NOT NULL,
  "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
  "reason" TEXT NOT NULL,
  "resolutionNote" TEXT,
  "reviewerId" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "disputes_orderId_status_createdAt_idx" ON "disputes"("orderId", "status", "createdAt");
CREATE INDEX "disputes_claimantId_createdAt_idx" ON "disputes"("claimantId", "createdAt");
CREATE INDEX "disputes_status_createdAt_idx" ON "disputes"("status", "createdAt");
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "seller_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
