CREATE TYPE "ConnectAccountStatus" AS ENUM ('PENDING', 'ONBOARDING', 'ACTIVE', 'RESTRICTED', 'DISABLED');

CREATE TABLE "stripe_accounts" (
  "id" TEXT NOT NULL,
  "artistId" TEXT NOT NULL,
  "stripeAccountId" TEXT NOT NULL,
  "status" "ConnectAccountStatus" NOT NULL DEFAULT 'PENDING',
  "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
  "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
  "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "stripe_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "stripe_accounts_artistId_key" ON "stripe_accounts"("artistId");
CREATE UNIQUE INDEX "stripe_accounts_stripeAccountId_key" ON "stripe_accounts"("stripeAccountId");
CREATE INDEX "stripe_accounts_status_payoutsEnabled_idx" ON "stripe_accounts"("status", "payoutsEnabled");

ALTER TABLE "stripe_accounts" ADD CONSTRAINT "stripe_accounts_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
