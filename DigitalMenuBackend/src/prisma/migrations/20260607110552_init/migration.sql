/*
  Warnings:

  - You are about to drop the column `refresToken` on the `RestaurantAdmin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RestaurantAdmin" DROP COLUMN "refresToken",
ADD COLUMN     "refreshToken" TEXT;
