/*
  Warnings:

  - You are about to drop the `RestuarantAdmin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_adminId_fkey";

-- DropTable
DROP TABLE "RestuarantAdmin";

-- CreateTable
CREATE TABLE "RestaurantAdmin" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refresToken" TEXT,

    CONSTRAINT "RestaurantAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantAdmin_publicId_key" ON "RestaurantAdmin"("publicId");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "RestaurantAdmin"("publicId") ON DELETE RESTRICT ON UPDATE CASCADE;
