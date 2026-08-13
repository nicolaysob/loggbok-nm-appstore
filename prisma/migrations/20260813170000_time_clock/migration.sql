-- CreateEnum
CREATE TYPE "TimeClockKind" AS ENUM ('PAYROLL', 'EXTRA_WORK');

-- CreateTable
CREATE TABLE "TimeClock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "TimeClockKind" NOT NULL,
    "customerId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeClock_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TimeClock_kind_customer_check" CHECK (
        ("kind" = 'PAYROLL' AND "customerId" IS NULL)
        OR ("kind" = 'EXTRA_WORK' AND "customerId" IS NOT NULL)
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "TimeClock_userId_key" ON "TimeClock"("userId");

-- CreateIndex
CREATE INDEX "TimeClock_customerId_idx" ON "TimeClock"("customerId");

-- AddForeignKey
ALTER TABLE "TimeClock" ADD CONSTRAINT "TimeClock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeClock" ADD CONSTRAINT "TimeClock_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
