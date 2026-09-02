-- CreateTable
CREATE TABLE "visa_countries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "flag_url" TEXT,
    "image_url" TEXT,
    "region" TEXT,
    "visa_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "processing_time" TEXT,
    "fee" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "visa_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hajj_packages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "makkah_nights" INTEGER NOT NULL DEFAULT 0,
    "madinah_nights" INTEGER NOT NULL DEFAULT 0,
    "inclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "hajj_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "umrah_packages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "makkah_nights" INTEGER NOT NULL DEFAULT 0,
    "madinah_nights" INTEGER NOT NULL DEFAULT 0,
    "add_on_city" TEXT,
    "inclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "umrah_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hajj_pre_registrations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passport_no" TEXT,
    "district" TEXT,
    "travelers" INTEGER NOT NULL DEFAULT 1,
    "package_tier" TEXT,
    "year" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hajj_pre_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visa_countries_tenant_id_slug_key" ON "visa_countries"("tenant_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "hajj_packages_tenant_id_slug_key" ON "hajj_packages"("tenant_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "umrah_packages_tenant_id_slug_key" ON "umrah_packages"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "hajj_pre_registrations_tenant_id_status_idx" ON "hajj_pre_registrations"("tenant_id", "status");
