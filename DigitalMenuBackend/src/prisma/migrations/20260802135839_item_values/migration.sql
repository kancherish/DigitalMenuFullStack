/*
  Warnings:

  - You are about to drop the column `categoryAlign` on the `Restaurant` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "itemSizeN" AS ENUM ('sm', 'md', 'lg');

-- CreateEnum
CREATE TYPE "itemImagePositionN" AS ENUM ('left', 'right');

-- CreateEnum
CREATE TYPE "itemImageShapeN" AS ENUM ('rounded', 'square', 'circle');

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "categoryAlign",
ADD COLUMN     "currencySymbol" TEXT NOT NULL DEFAULT '₹',
ADD COLUMN     "itemImagePosition" "itemImagePositionN" NOT NULL DEFAULT 'left',
ADD COLUMN     "itemImageShape" "itemImageShapeN" NOT NULL DEFAULT 'square',
ADD COLUMN     "itemSize" "itemSizeN" NOT NULL DEFAULT 'sm';

-- DropEnum
DROP TYPE "categoryAlignN";
