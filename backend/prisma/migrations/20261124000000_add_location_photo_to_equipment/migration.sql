-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN "locationId" INTEGER,
ADD COLUMN "photoUrl" TEXT;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
