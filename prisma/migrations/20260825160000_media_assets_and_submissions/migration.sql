-- Additive provider-backed media ownership and artist submission records.
CREATE TYPE "MediaPurpose" AS ENUM ('ARTWORK_IMAGE', 'DIGITAL_FILE', 'ARTIST_COVER', 'VERIFICATION_EVIDENCE');
CREATE TYPE "MediaStatus" AS ENUM ('UPLOADING', 'READY', 'FAILED', 'DELETED');
CREATE TYPE "MediaVisibility" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "ListingSubmissionStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

CREATE TABLE "media_assets" (
  "id" TEXT NOT NULL,
  "artistId" TEXT NOT NULL,
  "productId" TEXT,
  "purpose" "MediaPurpose" NOT NULL,
  "status" "MediaStatus" NOT NULL DEFAULT 'UPLOADING',
  "visibility" "MediaVisibility" NOT NULL DEFAULT 'PRIVATE',
  "provider" TEXT NOT NULL,
  "providerKey" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "checksum" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "media_assets_providerKey_key" ON "media_assets"("providerKey");
CREATE INDEX "media_assets_artistId_purpose_status_idx" ON "media_assets"("artistId", "purpose", "status");
CREATE INDEX "media_assets_productId_purpose_idx" ON "media_assets"("productId", "purpose");
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product_images" ADD COLUMN "mediaAssetId" TEXT;
CREATE INDEX "product_images_mediaAssetId_idx" ON "product_images"("mediaAssetId");
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "digital_deliveries" ADD COLUMN "mediaAssetId" TEXT;
CREATE INDEX "digital_deliveries_mediaAssetId_idx" ON "digital_deliveries"("mediaAssetId");
ALTER TABLE "digital_deliveries" ADD CONSTRAINT "digital_deliveries_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "listing_submissions" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "artistId" TEXT NOT NULL,
  "status" "ListingSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "listing_submissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "listing_submissions_productId_key" ON "listing_submissions"("productId");
CREATE INDEX "listing_submissions_artistId_status_submittedAt_idx" ON "listing_submissions"("artistId", "status", "submittedAt");
ALTER TABLE "listing_submissions" ADD CONSTRAINT "listing_submissions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_submissions" ADD CONSTRAINT "listing_submissions_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
