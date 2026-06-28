/*
  Warnings:

  - The values [tab] on the enum `NavStyle` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NavStyle_new" AS ENUM ('tabs', 'dropdown');
ALTER TABLE "Restaurant" ALTER COLUMN "tabStyle" TYPE "NavStyle_new" USING ("tabStyle"::text::"NavStyle_new");
ALTER TYPE "NavStyle" RENAME TO "NavStyle_old";
ALTER TYPE "NavStyle_new" RENAME TO "NavStyle";
DROP TYPE "public"."NavStyle_old";
COMMIT;
