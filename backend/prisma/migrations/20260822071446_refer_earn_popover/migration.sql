-- CreateTable: refer_earn_popovers (singleton per tenant, owner-editable)
CREATE TABLE "refer_earn_popovers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "badge_text_en" TEXT,
    "badge_text_bn" TEXT,
    "title_en" TEXT,
    "title_bn" TEXT,
    "body_en" TEXT,
    "body_bn" TEXT,
    "reward_amount_en" TEXT,
    "reward_amount_bn" TEXT,
    "reward_label_en" TEXT,
    "reward_label_bn" TEXT,
    "currency_code" TEXT NOT NULL DEFAULT 'BDT',
    "cta_text_en" TEXT,
    "cta_text_bn" TEXT,
    "cta_href" TEXT,
    "image_url" TEXT,
    "icon_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "delay_seconds" INTEGER NOT NULL DEFAULT 8,
    "dismiss_days" INTEGER NOT NULL DEFAULT 7,
    "show_on_paths" TEXT NOT NULL DEFAULT '/',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refer_earn_popovers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "refer_earn_popovers_tenant_id_key" ON "refer_earn_popovers"("tenant_id");
