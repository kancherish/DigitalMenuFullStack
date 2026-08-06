-- CreateEnum
CREATE TYPE "headerLayoutN" AS ENUM ('banner', 'minimal', 'split');

-- CreateEnum
CREATE TYPE "logoShapeN" AS ENUM ('circle', 'rounded', 'square');

-- CreateEnum
CREATE TYPE "overlayStyleN" AS ENUM ('gradient', 'solid', 'none');

-- CreateEnum
CREATE TYPE "headingFontN" AS ENUM ('serif', 'sans', 'display');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "headerLayout" "headerLayoutN" NOT NULL DEFAULT 'banner',
ADD COLUMN     "headingFont" "headingFontN" NOT NULL DEFAULT 'sans',
ADD COLUMN     "logoShape" "logoShapeN" NOT NULL DEFAULT 'circle',
ADD COLUMN     "overlayIntensity" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "overlayStyle" "overlayStyleN" NOT NULL DEFAULT 'solid';
