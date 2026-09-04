CREATE TYPE "ArtistVerificationStatus" AS ENUM (
  'NOT_SUBMITTED', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'REVOKED'
);
CREATE TYPE "VerificationEvidenceType" AS ENUM ('IDENTITY', 'BACKGROUND', 'PORTFOLIO');

CREATE TABLE "artist_verifications" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "status" "ArtistVerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "artist_verifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "artist_verifications_artistId_key" ON "artist_verifications"("artistId");
CREATE INDEX "artist_verifications_status_submittedAt_idx" ON "artist_verifications"("status", "submittedAt");
CREATE INDEX "artist_verifications_reviewerId_reviewedAt_idx" ON "artist_verifications"("reviewerId", "reviewedAt");

CREATE TABLE "artist_verification_evidence" (
    "id" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "type" "VerificationEvidenceType" NOT NULL,
    "reference" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "artist_verification_evidence_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "artist_verification_evidence_verificationId_type_idx" ON "artist_verification_evidence"("verificationId", "type");

ALTER TABLE "artist_verifications" ADD CONSTRAINT "artist_verifications_artistId_fkey"
  FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "artist_verifications" ADD CONSTRAINT "artist_verifications_reviewerId_fkey"
  FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "artist_verification_evidence" ADD CONSTRAINT "artist_verification_evidence_verificationId_fkey"
  FOREIGN KEY ("verificationId") REFERENCES "artist_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
