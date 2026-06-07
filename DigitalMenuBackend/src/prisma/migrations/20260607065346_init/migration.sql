/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `RestaurantAdmin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RestaurantAdmin_username_key" ON "RestaurantAdmin"("username");
