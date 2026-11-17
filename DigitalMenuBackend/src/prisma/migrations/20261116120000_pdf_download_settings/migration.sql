-- CreateEnum
CREATE TYPE "pdfDownloadPlacementN" AS ENUM ('bottom_right', 'bottom_left', 'top_right', 'top_left');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "showPdfDownload" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pdfDownloadPlacement" "pdfDownloadPlacementN" NOT NULL DEFAULT 'bottom_right';
