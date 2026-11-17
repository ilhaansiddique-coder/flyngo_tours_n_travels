-- CreateTable
CREATE TABLE "newsletter_subscriptions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "consent_version" TEXT NOT NULL,
    "confirmation_hash" TEXT,
    "confirmation_expires_at" TIMESTAMP(3),
    "unsubscribe_hash" TEXT NOT NULL,
    "last_requested_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "unsubscribed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_confirmation_hash_key" ON "newsletter_subscriptions"("confirmation_hash");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_unsubscribe_hash_key" ON "newsletter_subscriptions"("unsubscribe_hash");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_tenant_id_status_idx" ON "newsletter_subscriptions"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_tenant_id_email_key" ON "newsletter_subscriptions"("tenant_id", "email");

-- AddForeignKey
ALTER TABLE "newsletter_subscriptions" ADD CONSTRAINT "newsletter_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Replace only known application-generated marketing claims, preserving custom CMS copy.
UPDATE "hero_sections" SET "badge_text_en" = 'Plan your next journey'
WHERE "badge_text_en" = 'Trusted by 50,000+ travelers';
UPDATE "hero_sections" SET "badge_text_bn" = 'আপনার পরবর্তী ভ্রমণের পরিকল্পনা করুন'
WHERE "badge_text_bn" = '৫০,০০০+ যাত্রীর বিশ্বস্ত পছন্দ';
UPDATE "hero_sections" SET "stats" = '[]'::jsonb
WHERE "stats" = '[{"value":"500+","labelEn":"Destinations","labelBn":"গন্তব্য"},{"value":"50K+","labelEn":"Happy travelers","labelBn":"খুশি যাত্রী"},{"value":"1K+","labelEn":"Tour packages","labelBn":"ট্যুর প্যাকেজ"},{"value":"24/7","labelEn":"Concierge","labelBn":"পরিষেবা"}]'::jsonb;
