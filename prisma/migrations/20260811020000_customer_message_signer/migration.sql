-- AlterTable
ALTER TABLE "CustomerMessage" ADD COLUMN "signedByUserId" TEXT;

-- Nullstill auto-«lest» så usignerte meldinger vises igjen til noen signerer
UPDATE "CustomerMessage" SET "readAt" = NULL WHERE "signedByUserId" IS NULL;

-- CreateIndex
CREATE INDEX "CustomerMessage_signedByUserId_idx" ON "CustomerMessage"("signedByUserId");

-- AddForeignKey
ALTER TABLE "CustomerMessage" ADD CONSTRAINT "CustomerMessage_signedByUserId_fkey" FOREIGN KEY ("signedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
