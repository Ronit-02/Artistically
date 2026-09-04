-- Persist user-submitted moderation cases for artwork and collections.
CREATE TYPE "ReportReason" AS ENUM ('INACCURATE', 'COPYRIGHT', 'PROHIBITED', 'HARASSMENT', 'OTHER');
CREATE TYPE "ModerationStatus" AS ENUM ('OPEN', 'DISMISSED', 'RESOLVED');

CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "productId" TEXT,
    "collectionId" TEXT,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ModerationStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reports_status_createdAt_idx" ON "reports"("status", "createdAt");
CREATE INDEX "reports_reporterId_createdAt_idx" ON "reports"("reporterId", "createdAt");
CREATE INDEX "reports_productId_status_idx" ON "reports"("productId", "status");
CREATE INDEX "reports_collectionId_status_idx" ON "reports"("collectionId", "status");

ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey"
  FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewerId_fkey"
  FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_collectionId_fkey"
  FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
