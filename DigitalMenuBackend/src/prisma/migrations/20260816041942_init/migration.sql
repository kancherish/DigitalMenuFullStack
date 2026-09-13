-- CreateEnum
CREATE TYPE "NavStyle" AS ENUM ('tabs', 'dropdown');

-- CreateEnum
CREATE TYPE "headerLayoutN" AS ENUM ('banner', 'minimal', 'split');

-- CreateEnum
CREATE TYPE "logoShapeN" AS ENUM ('circle', 'rounded', 'square');

-- CreateEnum
CREATE TYPE "overlayStyleN" AS ENUM ('gradient', 'solid', 'none');

-- CreateEnum
CREATE TYPE "headingFontN" AS ENUM ('serif', 'sans', 'display');

-- CreateEnum
CREATE TYPE "headerAlignN" AS ENUM ('center', 'left');

-- CreateEnum
CREATE TYPE "headerSizeN" AS ENUM ('compact', 'default', 'large');

-- CreateEnum
CREATE TYPE "categoryVariantN" AS ENUM ('pill', 'underline');

-- CreateEnum
CREATE TYPE "categorySizeN" AS ENUM ('sm', 'md', 'lg');

-- CreateEnum
CREATE TYPE "itemSizeN" AS ENUM ('sm', 'md', 'lg');

-- CreateEnum
CREATE TYPE "itemImagePositionN" AS ENUM ('left', 'right');

-- CreateEnum
CREATE TYPE "itemImageShapeN" AS ENUM ('rounded', 'square', 'circle');

-- CreateTable
CREATE TABLE "RestaurantAdmin" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,

    CONSTRAINT "RestaurantAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "tagline" TEXT,
    "backgroundUrl" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL,
    "tabStyle" "NavStyle" NOT NULL,
    "roundness" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "headerText" TEXT NOT NULL DEFAULT '#ffffff',
    "showSearch" BOOLEAN NOT NULL DEFAULT false,
    "showItemCount" BOOLEAN NOT NULL DEFAULT false,
    "showDivider" BOOLEAN NOT NULL DEFAULT false,
    "stickyNav" BOOLEAN NOT NULL DEFAULT false,
    "domain" TEXT,
    "defaultImageUrl" TEXT NOT NULL DEFAULT 'https://order.pennentertainment.com/assets/img/png/default-menu-image-placeholder.png',
    "showItemImage" BOOLEAN NOT NULL DEFAULT false,
    "headerLayout" "headerLayoutN" NOT NULL DEFAULT 'banner',
    "logoShape" "logoShapeN" NOT NULL DEFAULT 'circle',
    "overlayStyle" "overlayStyleN" NOT NULL DEFAULT 'solid',
    "overlayIntensity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "headingFont" "headingFontN" NOT NULL DEFAULT 'sans',
    "headerAlign" "headerAlignN" NOT NULL DEFAULT 'center',
    "headerSize" "headerSizeN" NOT NULL DEFAULT 'compact',
    "categoryVariant" "categoryVariantN" NOT NULL DEFAULT 'pill',
    "categorySize" "categorySizeN" NOT NULL DEFAULT 'sm',
    "itemSize" "itemSizeN" NOT NULL DEFAULT 'sm',
    "itemImagePosition" "itemImagePositionN" NOT NULL DEFAULT 'left',
    "itemImageShape" "itemImageShapeN" NOT NULL DEFAULT 'square',
    "currencySymbol" TEXT NOT NULL DEFAULT '₹',
    "surfaceColor" TEXT NOT NULL DEFAULT '#ffffff',
    "boardEnabled" BOOLEAN NOT NULL DEFAULT false,
    "boardText" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Utensils',

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "category_id" TEXT NOT NULL,
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageURL" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "item_id" TEXT NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantAdmin_publicId_key" ON "RestaurantAdmin"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantAdmin_username_key" ON "RestaurantAdmin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_publicId_key" ON "Restaurant"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_adminId_key" ON "Restaurant"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_publicId_key" ON "Category"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_publicId_key" ON "Item"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_name_key" ON "Item"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_publicId_key" ON "Variant"("publicId");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "RestaurantAdmin"("publicId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "Restaurant"("publicId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("publicId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("publicId") ON DELETE CASCADE ON UPDATE CASCADE;
