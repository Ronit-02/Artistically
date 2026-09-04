-- Convert authoritative INR amounts from rupees stored in FLOAT columns to paise.
-- The existing seed and application data use rupee values, so multiply once during
-- the migration and keep all subsequent calculations in integer minor units.
ALTER TABLE "products"
  ALTER COLUMN "price" TYPE INTEGER USING ROUND("price" * 100)::INTEGER,
  ALTER COLUMN "originalPrice" TYPE INTEGER USING CASE WHEN "originalPrice" IS NULL THEN NULL ELSE ROUND("originalPrice" * 100)::INTEGER END;

ALTER TABLE "orders"
  ALTER COLUMN "subtotal" TYPE INTEGER USING ROUND("subtotal" * 100)::INTEGER,
  ALTER COLUMN "shippingCost" TYPE INTEGER USING ROUND("shippingCost" * 100)::INTEGER,
  ALTER COLUMN "tax" TYPE INTEGER USING ROUND("tax" * 100)::INTEGER,
  ALTER COLUMN "discount" TYPE INTEGER USING ROUND("discount" * 100)::INTEGER,
  ALTER COLUMN "total" TYPE INTEGER USING ROUND("total" * 100)::INTEGER;

ALTER TABLE "orders" ALTER COLUMN "shippingCost" SET DEFAULT 20000;

ALTER TABLE "seller_orders"
  ALTER COLUMN "subtotal" TYPE INTEGER USING ROUND("subtotal" * 100)::INTEGER,
  ALTER COLUMN "shippingCost" TYPE INTEGER USING ROUND("shippingCost" * 100)::INTEGER,
  ALTER COLUMN "total" TYPE INTEGER USING ROUND("total" * 100)::INTEGER;

ALTER TABLE "order_items"
  ALTER COLUMN "price" TYPE INTEGER USING ROUND("price" * 100)::INTEGER;

-- Quote snapshots are JSON and therefore are not converted by the column type
-- changes above. Convert legacy rupee snapshots before the application starts
-- reading them as integer minor units.
WITH converted AS (
  SELECT
    "id",
    jsonb_set(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              "quoteSnapshot",
              '{items}',
              COALESCE(
                (
                  SELECT jsonb_agg(
                    jsonb_set(item, '{unitPrice}', to_jsonb(ROUND((item->>'unitPrice')::numeric * 100)::INTEGER))
                  )
                  FROM jsonb_array_elements("quoteSnapshot"->'items') AS item
                ),
                '[]'::jsonb
              )
            ),
            '{subtotal}', to_jsonb(ROUND(("quoteSnapshot"->>'subtotal')::numeric * 100)::INTEGER)
          ),
          '{shippingCost}', to_jsonb(ROUND(("quoteSnapshot"->>'shippingCost')::numeric * 100)::INTEGER)
        ),
        '{tax}', to_jsonb(ROUND(("quoteSnapshot"->>'tax')::numeric * 100)::INTEGER)
      ),
      '{discount}', to_jsonb(ROUND(("quoteSnapshot"->>'discount')::numeric * 100)::INTEGER)
    ) AS "quoteSnapshot"
  FROM "checkout_sessions"
  WHERE jsonb_typeof("quoteSnapshot") = 'object'
)
UPDATE "checkout_sessions" AS target
SET "quoteSnapshot" = converted."quoteSnapshot"
FROM converted
WHERE target."id" = converted."id";

UPDATE "checkout_sessions"
SET "quoteSnapshot" = jsonb_set(
  "quoteSnapshot",
  '{total}',
  to_jsonb(ROUND(("quoteSnapshot"->>'total')::numeric * 100)::INTEGER)
)
WHERE jsonb_typeof("quoteSnapshot") = 'object';
