-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Item_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Category_restaurant_id_name_key" ON "Category"("restaurant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_category_id_name_key" ON "Item"("category_id", "name");
