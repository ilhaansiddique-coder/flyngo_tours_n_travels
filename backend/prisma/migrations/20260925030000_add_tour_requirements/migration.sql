-- AlterTable tours
ALTER TABLE "tours" ADD COLUMN IF NOT EXISTS "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tours" ADD COLUMN IF NOT EXISTS "requirements_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];
