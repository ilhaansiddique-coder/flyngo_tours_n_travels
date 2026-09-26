-- CreateTable
CREATE TABLE "curated_experiences_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "eyebrow_en" TEXT DEFAULT 'Curated Experiences',
    "eyebrow_bn" TEXT DEFAULT 'বাছাইকৃত অভিজ্ঞতা',
    "title_prefix_en" TEXT DEFAULT 'Beyond booking.',
    "title_highlight_en" TEXT DEFAULT 'Beyond ordinary.',
    "title_prefix_bn" TEXT DEFAULT 'বুকিংয়ের চেয়েও বেশি।',
    "title_highlight_bn" TEXT DEFAULT 'সাধারণের চেয়েও অনন্য।',
    "subtitle_en" TEXT DEFAULT 'Bespoke itineraries designed for those who value time, texture, and the quiet luxury of detail in their global travels.',
    "subtitle_bn" TEXT DEFAULT 'যারা বিশ্বভ্রমণে সময়, গুণমান ও আভিজাত্যকে মূল্যায়ন করেন—তাদের জন্যই আমাদের বিশেষ পরিকল্পনা।',
    "action_label_en" TEXT DEFAULT 'View all experiences',
    "action_label_bn" TEXT DEFAULT 'সব অভিজ্ঞতা দেখুন',
    "action_href" TEXT DEFAULT '/destinations',
    "status_text_en" TEXT DEFAULT 'live · updated daily',
    "status_text_bn" TEXT DEFAULT 'লাইভ · প্রতিদিন আপডেট',
    "items" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curated_experiences_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "curated_experiences_configs_tenant_id_key" ON "curated_experiences_configs"("tenant_id");
