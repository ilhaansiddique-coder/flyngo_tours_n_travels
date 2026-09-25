-- AlterTable hajj_packages
ALTER TABLE "hajj_packages" ADD COLUMN IF NOT EXISTS "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "hajj_packages" ADD COLUMN IF NOT EXISTS "requirements_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable umrah_packages
ALTER TABLE "umrah_packages" ADD COLUMN IF NOT EXISTS "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "umrah_packages" ADD COLUMN IF NOT EXISTS "requirements_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];
