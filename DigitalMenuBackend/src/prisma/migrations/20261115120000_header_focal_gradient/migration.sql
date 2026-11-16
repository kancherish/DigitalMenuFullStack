-- AlterTable
ALTER TABLE "Restaurant"
ADD COLUMN     "headerBackgroundPositionX" DOUBLE PRECISION NOT NULL DEFAULT 50,
ADD COLUMN     "headerBackgroundPositionY" DOUBLE PRECISION NOT NULL DEFAULT 50,
ADD COLUMN     "headerNameGradientFrom" TEXT,
ADD COLUMN     "headerNameGradientTo" TEXT,
ADD COLUMN     "headerNameGradientAngle" INTEGER NOT NULL DEFAULT 120,
DROP COLUMN     "headerBackgroundPosition";

-- DropEnum
DROP TYPE "headerBackgroundPositionN";
