ALTER TABLE "Equipment" ADD COLUMN     "categoryId" INTEGER;

CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_categoryId_fkey" 
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON 
DELETE SET NULL ON UPDATE CASCADE;