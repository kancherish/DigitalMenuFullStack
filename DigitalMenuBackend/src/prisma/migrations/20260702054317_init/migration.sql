-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "badges" TEXT[] DEFAULT ARRAY[]::TEXT[];
