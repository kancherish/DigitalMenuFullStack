-- CreateEnum
CREATE TYPE "categoryVariantN" AS ENUM ('pill', 'underline');

-- CreateEnum
CREATE TYPE "categoryAlignN" AS ENUM ('start', 'center');

-- CreateEnum
CREATE TYPE "categorySizeN" AS ENUM ('sm', 'md', 'lg');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "categoryAlign" "categoryAlignN" NOT NULL DEFAULT 'start',
ADD COLUMN     "categorySize" "categorySizeN" NOT NULL DEFAULT 'sm',
ADD COLUMN     "categoryVariant" "categoryVariantN" NOT NULL DEFAULT 'pill';
