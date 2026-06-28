/*
  Warnings:

  - Added the required column `roundness` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tabStyle` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NavStyle" AS ENUM ('tab', 'dropdown');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "roundness" TEXT NOT NULL,
ADD COLUMN     "tabStyle" "NavStyle" NOT NULL;
