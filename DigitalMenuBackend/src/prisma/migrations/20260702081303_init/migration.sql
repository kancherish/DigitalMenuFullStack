-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "showItemCount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showSearch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stickyNav" BOOLEAN NOT NULL DEFAULT false;
