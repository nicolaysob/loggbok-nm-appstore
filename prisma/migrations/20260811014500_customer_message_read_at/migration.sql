-- AlterTable
ALTER TABLE "CustomerMessage" ADD COLUMN "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "CustomerMessage_customerId_readAt_idx" ON "CustomerMessage"("customerId", "readAt");
