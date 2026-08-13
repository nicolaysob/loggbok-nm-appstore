-- Fri tittel på oppdrag; type blir valgfri
ALTER TABLE "CustomerJob" ADD COLUMN "title" TEXT;

UPDATE "CustomerJob" AS cj
SET "title" = jt."name"
FROM "JobType" AS jt
WHERE jt."id" = cj."jobTypeId";

ALTER TABLE "CustomerJob" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "CustomerJob" ALTER COLUMN "jobTypeId" DROP NOT NULL;

-- Fakturering: merke ekstraarbeid som håndtert
ALTER TABLE "LogEntry" ADD COLUMN "handledAt" TIMESTAMP(3);

CREATE INDEX "LogEntry_type_handledAt_idx" ON "LogEntry"("type", "handledAt");
