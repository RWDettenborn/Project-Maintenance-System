-- Fix typo: arquisitionDate -> acquisitionDate (keeps existing data)
ALTER TABLE "Equipment" RENAME COLUMN "arquisitionDate" TO "acquisitionDate";
