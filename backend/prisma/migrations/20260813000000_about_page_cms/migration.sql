-- CreateEnum
CREATE TYPE "AboutSectionType" AS ENUM ('STORY', 'VISION', 'MISSION', 'SERVICE', 'SERVICES', 'VALUES', 'STATS', 'ACHIEVEMENTS', 'TEAM', 'TRIPS', 'STRATEGIES', 'CONTACT', 'CUSTOM');

-- CreateTable: about_page_meta (singleton per tenant)
CREATE TABLE "about_page_meta" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "hero_eyebrow_en" TEXT,
    "hero_eyebrow_bn" TEXT,
    "hero_title_en" TEXT,
    "hero_title_bn" TEXT,
    "hero_subtitle_en" TEXT,
    "hero_subtitle_bn" TEXT,
    "hero_image_url" TEXT,
    "cta_label_en" TEXT,
    "cta_label_bn" TEXT,
    "cta_href" TEXT,
    "office_address" TEXT,
    "office_phone" TEXT,
    "office_email" TEXT,
    "slogan_en" TEXT,
    "slogan_bn" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "about_page_meta_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "about_page_meta_tenant_id_key" ON "about_page_meta"("tenant_id");

-- CreateTable: about_page_sections (ordered content blocks)
CREATE TABLE "about_page_sections" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" "AboutSectionType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "title_en" TEXT,
    "title_bn" TEXT,
    "subtitle_en" TEXT,
    "subtitle_bn" TEXT,
    "body_en" TEXT,
    "body_bn" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "about_page_sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "about_page_sections_tenant_id_type_order_idx" ON "about_page_sections"("tenant_id", "type", "order");
CREATE INDEX "about_page_sections_deleted_at_idx" ON "about_page_sections"("deleted_at");

-- CreateTable: ceo_messages
CREATE TABLE "ceo_messages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image_url" TEXT,
    "body_en" TEXT NOT NULL,
    "body_bn" TEXT,
    "signature_en" TEXT,
    "signature_bn" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ceo_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ceo_messages_tenant_id_is_active_idx" ON "ceo_messages"("tenant_id", "is_active");
CREATE INDEX "ceo_messages_deleted_at_idx" ON "ceo_messages"("deleted_at");
