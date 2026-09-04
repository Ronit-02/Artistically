-- Persist the delivered order item that established review eligibility.
ALTER TABLE "reviews" ADD COLUMN "orderItemId" TEXT;

CREATE UNIQUE INDEX "reviews_orderItemId_key" ON "reviews"("orderItemId");

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_orderItemId_fkey"
  FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
