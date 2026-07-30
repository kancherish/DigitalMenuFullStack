-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "imageURL" TEXT;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "defaultImageUrl" TEXT NOT NULL DEFAULT 'https://order.pennentertainment.com/assets/img/png/default-menu-image-placeholder.png',
ADD COLUMN     "showItemImage" BOOLEAN NOT NULL DEFAULT false;
