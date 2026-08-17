-- CreateEnum: NavLinkType (INTERNAL route, EXTERNAL absolute url, SECTION in-page anchor)
CREATE TYPE "NavLinkType" AS ENUM ('INTERNAL', 'EXTERNAL', 'SECTION');

-- CreateTable: nav_menus (header navigation tree, owner-managed)
CREATE TABLE "nav_menus" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "label_bn" TEXT,
    "translation_key" TEXT,
    "href" TEXT NOT NULL,
    "link_type" "NavLinkType" NOT NULL DEFAULT 'INTERNAL',
    "icon_name" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "open_in_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "nav_menus_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "nav_menus_tenant_id_parent_id_order_idx" ON "nav_menus"("tenant_id", "parent_id", "order");
CREATE INDEX "nav_menus_deleted_at_idx" ON "nav_menus"("deleted_at");
CREATE INDEX "nav_menus_parent_id_idx" ON "nav_menus"("parent_id");

ALTER TABLE "nav_menus"
    ADD CONSTRAINT "nav_menus_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "nav_menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: footer_configs (singleton per tenant, owner-managed columns + contact + socials)
CREATE TABLE "footer_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tagline_en" TEXT,
    "tagline_bn" TEXT,
    "accent_label_en" TEXT,
    "accent_label_bn" TEXT,
    "columns" JSONB NOT NULL DEFAULT '[]',
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "contact_note_en" TEXT,
    "contact_note_bn" TEXT,
    "copyright_text_en" TEXT,
    "copyright_text_bn" TEXT,
    "show_language_toggle" BOOLEAN NOT NULL DEFAULT true,
    "show_share_button" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "footer_configs_tenant_id_key" ON "footer_configs"("tenant_id");