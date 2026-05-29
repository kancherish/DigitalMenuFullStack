/*
  Warnings:

  - Added the required column `accentColor` to the `CONFIG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryColor` to the `CONFIG` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagline` to the `CONFIG` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CONFIG" ADD COLUMN     "accentColor" TEXT NOT NULL,
ADD COLUMN     "primaryColor" TEXT NOT NULL,
ADD COLUMN     "tagline" TEXT NOT NULL;
