-- AlterEnum
ALTER TYPE "headingFontN" ADD VALUE 'inter';
ALTER TYPE "headingFontN" ADD VALUE 'poppins';
ALTER TYPE "headingFontN" ADD VALUE 'montserrat';
ALTER TYPE "headingFontN" ADD VALUE 'nunito';
ALTER TYPE "headingFontN" ADD VALUE 'playfair';
ALTER TYPE "headingFontN" ADD VALUE 'lora';
ALTER TYPE "headingFontN" ADD VALUE 'merriweather';

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "bodyFont" "headingFontN" NOT NULL DEFAULT 'sans';
