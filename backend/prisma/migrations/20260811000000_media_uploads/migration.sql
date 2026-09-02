-- AlterTable
ALTER TABLE "media"
  ADD COLUMN "filename" TEXT,
  ADD COLUMN "folder"   TEXT;

-- CreateIndex
CREATE INDEX "media_tenant_id_idx" ON "media"("tenant_id");
CREATE INDEX "media_tour_id_idx"   ON "media"("tour_id");
CREATE INDEX "media_hotel_id_idx"  ON "media"("hotel_id");

-- CreateTable
CREATE TABLE "hero_sections" (
    "id"               TEXT NOT NULL,
    "tenant_id"        TEXT NOT NULL,
    "badge_text_en"    TEXT,
    "badge_text_bn"    TEXT,
    "title_line_a_en"  TEXT,
    "title_line_a_bn"  TEXT,
    "title_line_b_en"  TEXT,
    "title_line_b_bn"  TEXT,
    "title_line_c_en"  TEXT,
    "title_line_c_bn"  TEXT,
    "subtitle_en"      TEXT,
    "subtitle_bn"      TEXT,
    "cta_explore_en"   TEXT,
    "cta_explore_bn"   TEXT,
    "cta_visa_en"      TEXT,
    "cta_visa_bn"      TEXT,
    "cta_destinations_en" TEXT,
    "cta_destinations_bn" TEXT,
    "stats"            JSONB NOT NULL DEFAULT '[]',
    "quick_places"     TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active"        BOOLEAN NOT NULL DEFAULT true,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hero_sections_tenant_id_key" ON "hero_sections"("tenant_id");

-- CreateTable
CREATE TABLE "globe_cities" (
    "id"          TEXT NOT NULL,
    "tenant_id"   TEXT NOT NULL,
    "name_en"     TEXT NOT NULL,
    "name_bn"     TEXT,
    "lat"         DOUBLE PRECISION NOT NULL,
    "lon"         DOUBLE PRECISION NOT NULL,
    "is_active"   BOOLEAN NOT NULL DEFAULT true,
    "sort_order"  INTEGER NOT NULL DEFAULT 0,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "globe_cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "globe_cities_tenant_id_idx" ON "globe_cities"("tenant_id");

-- CreateTable
CREATE TABLE "globe_routes" (
    "id"            TEXT NOT NULL,
    "tenant_id"     TEXT NOT NULL,
    "from_city_id"  TEXT NOT NULL,
    "to_city_id"    TEXT NOT NULL,
    "is_active"     BOOLEAN NOT NULL DEFAULT true,
    "sort_order"    INTEGER NOT NULL DEFAULT 0,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "globe_routes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "globe_routes_tenant_id_idx" ON "globe_routes"("tenant_id");
CREATE INDEX "globe_routes_from_city_id_idx" ON "globe_routes"("from_city_id");
CREATE INDEX "globe_routes_to_city_id_idx" ON "globe_routes"("to_city_id");

-- AddForeignKey
ALTER TABLE "globe_routes" ADD CONSTRAINT "globe_routes_from_city_id_fkey" FOREIGN KEY ("from_city_id") REFERENCES "globe_cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "globe_routes" ADD CONSTRAINT "globe_routes_to_city_id_fkey"   FOREIGN KEY ("to_city_id")   REFERENCES "globe_cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
