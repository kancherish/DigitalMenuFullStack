/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.
  - The required column `publicId` was added to the `Category` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `publicId` was added to the `Item` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `publicId` was added to the `Restaurant` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `publicId` was added to the `Variant` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_restaurant_id_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_item_id_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "publicId" TEXT NOT NULL,
ALTER COLUMN "restaurant_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "publicId" TEXT NOT NULL,
ALTER COLUMN "category_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "publicId" TEXT NOT NULL,
ALTER COLUMN "item_id" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_publicId_key" ON "Category"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_publicId_key" ON "Item"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_publicId_key" ON "Restaurant"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_publicId_key" ON "Variant"("publicId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "Restaurant"("publicId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("publicId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("publicId") ON DELETE CASCADE ON UPDATE CASCADE;
