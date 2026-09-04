-- CreateEnum
CREATE TYPE "ArtworkType" AS ENUM ('ORIGINAL', 'LIMITED_EDITION', 'MADE_TO_ORDER', 'DIGITAL');

-- CreateEnum
CREATE TYPE "FulfillmentMode" AS ENUM ('PHYSICAL', 'DIGITAL');

-- CreateTable
CREATE TABLE "artwork_details" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "artworkType" "ArtworkType" NOT NULL DEFAULT 'ORIGINAL',
    "medium" TEXT,
    "materials" TEXT,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "depth" DOUBLE PRECISION,
    "dimensionUnit" TEXT NOT NULL DEFAULT 'cm',
    "year" INTEGER,
    "condition" TEXT,
    "framing" TEXT,
    "editionSize" INTEGER,
    "editionNumber" INTEGER,
    "authenticity" TEXT,
    "provenance" TEXT,
    "fulfillmentMode" "FulfillmentMode" NOT NULL DEFAULT 'PHYSICAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artwork_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artwork_details_productId_key" ON "artwork_details"("productId");

-- AddForeignKey
ALTER TABLE "artwork_details" ADD CONSTRAINT "artwork_details_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
