-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "boardEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "boardText" TEXT NOT NULL DEFAULT '';
