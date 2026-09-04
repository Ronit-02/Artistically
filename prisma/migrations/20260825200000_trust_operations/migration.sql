-- Additive trust and operations records.
CREATE TYPE "ReviewModerationStatus" AS ENUM ('PUBLISHED', 'HIDDEN', 'REMOVED');
CREATE TYPE "CertificateStatus" AS ENUM ('PENDING', 'VERIFIED', 'REVOKED');

ALTER TABLE "reviews" ADD COLUMN "moderationStatus" "ReviewModerationStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "reviews" ADD COLUMN "moderationNote" TEXT;
ALTER TABLE "reviews" ADD COLUMN "moderatedById" TEXT;
ALTER TABLE "reviews" ADD COLUMN "moderatedAt" TIMESTAMP(3);
CREATE INDEX "reviews_moderationStatus_createdAt_idx" ON "reviews"("moderationStatus", "createdAt");
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "media_assets" ADD COLUMN "retainedUntil" TIMESTAMP(3);
ALTER TABLE "media_assets" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "artist_verification_evidence" ADD COLUMN "providerPolicyId" TEXT;
ALTER TABLE "artist_verification_evidence" ADD COLUMN "retainedUntil" TIMESTAMP(3);
ALTER TABLE "artist_verification_evidence" ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE TABLE "evidence_provider_policies" (
  "id" TEXT NOT NULL,
  "providerKey" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "retentionDays" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "evidence_provider_policies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "evidence_provider_policies_providerKey_key" ON "evidence_provider_policies"("providerKey");
ALTER TABLE "artist_verification_evidence" ADD CONSTRAINT "artist_verification_evidence_providerPolicyId_fkey" FOREIGN KEY ("providerPolicyId") REFERENCES "evidence_provider_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "certificates_of_authenticity" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "artistId" TEXT NOT NULL,
  "mediaAssetId" TEXT,
  "certificateNumber" TEXT NOT NULL,
  "status" "CertificateStatus" NOT NULL DEFAULT 'PENDING',
  "note" TEXT,
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verifiedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "certificates_of_authenticity_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "certificates_of_authenticity_productId_key" ON "certificates_of_authenticity"("productId");
CREATE UNIQUE INDEX "certificates_of_authenticity_certificateNumber_key" ON "certificates_of_authenticity"("certificateNumber");
CREATE INDEX "certificates_of_authenticity_artistId_status_createdAt_idx" ON "certificates_of_authenticity"("artistId", "status", "createdAt");
ALTER TABLE "certificates_of_authenticity" ADD CONSTRAINT "certificates_of_authenticity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certificates_of_authenticity" ADD CONSTRAINT "certificates_of_authenticity_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certificates_of_authenticity" ADD CONSTRAINT "certificates_of_authenticity_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_targetType_targetId_createdAt_idx" ON "audit_logs"("targetType", "targetId", "createdAt");
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
