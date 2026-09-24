-- AlterTable visa_services
ALTER TABLE "visa_services" ADD COLUMN IF NOT EXISTS "title_bn" TEXT;
ALTER TABLE "visa_services" ADD COLUMN IF NOT EXISTS "description_bn" TEXT;
ALTER TABLE "visa_services" ADD COLUMN IF NOT EXISTS "processing_time_bn" TEXT;
ALTER TABLE "visa_services" ADD COLUMN IF NOT EXISTS "requirements_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable tours
ALTER TABLE "tours" ADD COLUMN IF NOT EXISTS "title_bn" TEXT;
ALTER TABLE "tours" ADD COLUMN IF NOT EXISTS "description_bn" TEXT;
ALTER TABLE "tours" ADD COLUMN IF NOT EXISTS "highlights_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "tours" ADD COLUMN IF NOT EXISTS "inclusions_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable hajj_packages
ALTER TABLE "hajj_packages" ADD COLUMN IF NOT EXISTS "title_bn" TEXT;
ALTER TABLE "hajj_packages" ADD COLUMN IF NOT EXISTS "inclusions_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "hajj_packages" ADD COLUMN IF NOT EXISTS "highlights_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable umrah_packages
ALTER TABLE "umrah_packages" ADD COLUMN IF NOT EXISTS "title_bn" TEXT;
ALTER TABLE "umrah_packages" ADD COLUMN IF NOT EXISTS "inclusions_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "umrah_packages" ADD COLUMN IF NOT EXISTS "highlights_bn" TEXT[] DEFAULT ARRAY[]::TEXT[];
