-- DropForeignKey
ALTER TABLE "Area" DROP CONSTRAINT "Area_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Issue" DROP CONSTRAINT "Issue_areaId_fkey";

-- DropForeignKey
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_areaId_fkey";

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogEntry" ADD CONSTRAINT "LogEntry_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
