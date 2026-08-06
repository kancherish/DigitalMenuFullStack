-- CreateEnum
CREATE TYPE "headerAlignN" AS ENUM ('center', 'left');

-- CreateEnum
CREATE TYPE "headerSizeN" AS ENUM ('compact', 'default', 'large');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "headerAlign" "headerAlignN" NOT NULL DEFAULT 'center',
ADD COLUMN     "headerSize" "headerSizeN" NOT NULL DEFAULT 'compact';
