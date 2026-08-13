-- CreateEnum
CREATE TYPE "PayType" AS ENUM ('FIXED', 'HOURLY');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "payType" "PayType" NOT NULL DEFAULT 'FIXED';
