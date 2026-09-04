-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "ownerArtistId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_items" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collections_published_featured_createdAt_idx" ON "collections"("published", "featured", "createdAt");

-- CreateIndex
CREATE INDEX "collections_ownerArtistId_idx" ON "collections"("ownerArtistId");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collectionId_productId_key" ON "collection_items"("collectionId", "productId");

-- CreateIndex
CREATE INDEX "collection_items_collectionId_sortOrder_idx" ON "collection_items"("collectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "collection_items_productId_idx" ON "collection_items"("productId");

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_ownerArtistId_fkey" FOREIGN KEY ("ownerArtistId") REFERENCES "artists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
