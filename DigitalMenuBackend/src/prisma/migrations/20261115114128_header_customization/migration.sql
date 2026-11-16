-- CreateEnum
CREATE TYPE "logoSizeN" AS ENUM ('auto', 'sm', 'md', 'lg');

-- CreateEnum
CREATE TYPE "headerBackgroundPositionN" AS ENUM ('top', 'center', 'bottom', 'left', 'right');

-- CreateEnum
CREATE TYPE "dividerStyleN" AS ENUM ('line', 'dots', 'diamond', 'none');

-- CreateEnum
CREATE TYPE "headerSpacingN" AS ENUM ('tight', 'default', 'loose');

-- CreateEnum
CREATE TYPE "headerMaxWidthN" AS ENUM ('sm', 'md', 'lg', 'full');

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "headerAccentPanel" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "headerBackgroundPosition" "headerBackgroundPositionN" NOT NULL DEFAULT 'center',
ADD COLUMN     "headerBackgroundZoom" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "headerDividerStyle" "dividerStyleN" NOT NULL DEFAULT 'line',
ADD COLUMN     "headerMaxWidth" "headerMaxWidthN" NOT NULL DEFAULT 'full',
ADD COLUMN     "headerNameColor" TEXT,
ADD COLUMN     "headerNameGradient" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "headerPanelIntensity" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "headerShimmer" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "headerSpacing" "headerSpacingN" NOT NULL DEFAULT 'default',
ADD COLUMN     "headerTaglineColor" TEXT,
ADD COLUMN     "headerUppercaseTagline" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logoSize" "logoSizeN" NOT NULL DEFAULT 'auto',
ADD COLUMN     "showLogo" BOOLEAN NOT NULL DEFAULT true;
