/*
  Warnings:

  - A unique constraint covering the columns `[adminId]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adminId` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "adminId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RestuarantAdmin" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "RestuarantAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestuarantAdmin_publicId_key" ON "RestuarantAdmin"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_adminId_key" ON "Restaurant"("adminId");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "RestuarantAdmin"("publicId") ON DELETE RESTRICT ON UPDATE CASCADE;
