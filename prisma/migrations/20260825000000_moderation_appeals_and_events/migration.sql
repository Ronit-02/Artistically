-- Preserve an append-only moderation history and affected-owner appeals.
CREATE TYPE "AppealStatus" AS ENUM ('OPEN', 'APPROVED', 'REJECTED');
CREATE TYPE "ModerationEventType" AS ENUM (
  'REPORT_CREATED', 'REPORT_DISMISSED', 'REPORT_RESOLVED',
  'APPEAL_SUBMITTED', 'APPEAL_APPROVED', 'APPEAL_REJECTED'
);

CREATE TABLE "moderation_appeals" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "appellantId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "statement" TEXT NOT NULL,
    "status" "AppealStatus" NOT NULL DEFAULT 'OPEN',
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "moderation_appeals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "moderation_appeals_reportId_key" ON "moderation_appeals"("reportId");
CREATE INDEX "moderation_appeals_status_createdAt_idx" ON "moderation_appeals"("status", "createdAt");
CREATE INDEX "moderation_appeals_appellantId_createdAt_idx" ON "moderation_appeals"("appellantId", "createdAt");

CREATE TABLE "moderation_events" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "appealId" TEXT,
    "actorId" TEXT NOT NULL,
    "type" "ModerationEventType" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "moderation_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "moderation_events_reportId_createdAt_idx" ON "moderation_events"("reportId", "createdAt");
CREATE INDEX "moderation_events_appealId_createdAt_idx" ON "moderation_events"("appealId", "createdAt");

ALTER TABLE "moderation_appeals" ADD CONSTRAINT "moderation_appeals_reportId_fkey"
  FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_appeals" ADD CONSTRAINT "moderation_appeals_appellantId_fkey"
  FOREIGN KEY ("appellantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_appeals" ADD CONSTRAINT "moderation_appeals_reviewerId_fkey"
  FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_reportId_fkey"
  FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_appealId_fkey"
  FOREIGN KEY ("appealId") REFERENCES "moderation_appeals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderation_events" ADD CONSTRAINT "moderation_events_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
