-- Cover image URLs for visual entity browsers
ALTER TABLE "tours"             ADD COLUMN "cover_image_url" TEXT;
ALTER TABLE "hotels"            ADD COLUMN "cover_image_url" TEXT;
ALTER TABLE "flights"           ADD COLUMN "cover_image_url" TEXT;
ALTER TABLE "destinations"      ADD COLUMN "cover_image_url" TEXT;
ALTER TABLE "hajj_packages"     ADD COLUMN "cover_image_url" TEXT;
ALTER TABLE "umrah_packages"    ADD COLUMN "cover_image_url" TEXT;
ALTER TABLE "visa_countries"    ADD COLUMN "cover_image_url" TEXT;
