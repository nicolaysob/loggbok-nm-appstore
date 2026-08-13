-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdById" TEXT,
    "text" TEXT NOT NULL,
    "doneAt" TIMESTAMP(3),
    "doneByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Todo_customerId_doneAt_idx" ON "Todo"("customerId", "doneAt");

-- CreateIndex
CREATE INDEX "Todo_createdById_idx" ON "Todo"("createdById");

-- CreateIndex
CREATE INDEX "Todo_doneByUserId_idx" ON "Todo"("doneByUserId");

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_doneByUserId_fkey" FOREIGN KEY ("doneByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
