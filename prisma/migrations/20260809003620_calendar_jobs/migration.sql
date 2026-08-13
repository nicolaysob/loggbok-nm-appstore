-- CreateEnum
CREATE TYPE "JobScheduleKind" AS ENUM ('ONCE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "JobType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerJob" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "jobTypeId" TEXT NOT NULL,
    "kind" "JobScheduleKind" NOT NULL,
    "dueOn" TIMESTAMP(3),
    "weekday" INTEGER,
    "startsOn" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobCompletion" (
    "id" TEXT NOT NULL,
    "customerJobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobType_name_key" ON "JobType"("name");

-- CreateIndex
CREATE INDEX "CustomerJob_areaId_active_idx" ON "CustomerJob"("areaId", "active");

-- CreateIndex
CREATE INDEX "CustomerJob_jobTypeId_idx" ON "CustomerJob"("jobTypeId");

-- CreateIndex
CREATE INDEX "JobCompletion_scheduledFor_idx" ON "JobCompletion"("scheduledFor");

-- CreateIndex
CREATE INDEX "JobCompletion_userId_idx" ON "JobCompletion"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JobCompletion_customerJobId_scheduledFor_key" ON "JobCompletion"("customerJobId", "scheduledFor");

-- AddForeignKey
ALTER TABLE "CustomerJob" ADD CONSTRAINT "CustomerJob_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerJob" ADD CONSTRAINT "CustomerJob_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "JobType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCompletion" ADD CONSTRAINT "JobCompletion_customerJobId_fkey" FOREIGN KEY ("customerJobId") REFERENCES "CustomerJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCompletion" ADD CONSTRAINT "JobCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
