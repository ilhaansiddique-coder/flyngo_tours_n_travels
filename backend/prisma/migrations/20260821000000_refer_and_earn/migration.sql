-- =============================================================================
-- Refer & Earn + Tracking + Ads + Hajj inventory + Mahram + Payment milestones
-- =============================================================================

-- ===== users (referral attribution) =====
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "referred_by_code" TEXT,
  ADD COLUMN IF NOT EXISTS "referral_code" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "users_referral_code_key" ON "users"("referral_code");

-- ===== bookings (referral + UTM + Hajj) =====
ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "referred_by_code" TEXT,
  ADD COLUMN IF NOT EXISTS "referral_discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "referral_processed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "utm_source" TEXT,
  ADD COLUMN IF NOT EXISTS "utm_medium" TEXT,
  ADD COLUMN IF NOT EXISTS "utm_campaign" TEXT,
  ADD COLUMN IF NOT EXISTS "utm_content" TEXT,
  ADD COLUMN IF NOT EXISTS "utm_term" TEXT,
  ADD COLUMN IF NOT EXISTS "gclid" TEXT,
  ADD COLUMN IF NOT EXISTS "fbclid" TEXT,
  ADD COLUMN IF NOT EXISTS "msclkid" TEXT,
  ADD COLUMN IF NOT EXISTS "landing_path" TEXT,
  ADD COLUMN IF NOT EXISTS "departure_city" TEXT,
  ADD COLUMN IF NOT EXISTS "group_type" TEXT,
  ADD COLUMN IF NOT EXISTS "package_slug" TEXT;

-- ===== booking_travelers (Mahram + passport) =====
ALTER TABLE "booking_travelers"
  ADD COLUMN IF NOT EXISTS "passport_number" TEXT,
  ADD COLUMN IF NOT EXISTS "nationality" TEXT,
  ADD COLUMN IF NOT EXISTS "date_of_birth" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "gender" TEXT,
  ADD COLUMN IF NOT EXISTS "mahram_full_name" TEXT,
  ADD COLUMN IF NOT EXISTS "mahram_relation" TEXT;

-- ===== hajj_packages (seats, deposit, dates, SEO) =====
ALTER TABLE "hajj_packages"
  ADD COLUMN IF NOT EXISTS "total_seats" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "seats_booked" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "deposit_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "visa_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "final_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "departure_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "return_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "departure_cities" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "meta_title" TEXT,
  ADD COLUMN IF NOT EXISTS "meta_description" TEXT,
  ADD COLUMN IF NOT EXISTS "meta_image" TEXT;

-- ===== umrah_packages (seats, deposit, dates, walking-distance, SEO) =====
ALTER TABLE "umrah_packages"
  ADD COLUMN IF NOT EXISTS "total_seats" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "seats_booked" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "deposit_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "visa_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "final_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "departure_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "return_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "departure_cities" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "meta_title" TEXT,
  ADD COLUMN IF NOT EXISTS "meta_description" TEXT,
  ADD COLUMN IF NOT EXISTS "meta_image" TEXT,
  ADD COLUMN IF NOT EXISTS "walking_distance_to_haram" INTEGER,
  ADD COLUMN IF NOT EXISTS "walking_distance_to_prophet" INTEGER,
  ADD COLUMN IF NOT EXISTS "preferred_route" TEXT;

-- ===== referral_settings =====
CREATE TABLE IF NOT EXISTS "referral_settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "referrer_reward_type" TEXT NOT NULL DEFAULT 'percentage',
    "referrer_reward_value" DECIMAL(10,2) NOT NULL DEFAULT 5.0,
    "referrer_max_reward" DECIMAL(10,2),
    "referee_reward_type" TEXT NOT NULL DEFAULT 'percentage',
    "referee_reward_value" DECIMAL(10,2) NOT NULL DEFAULT 5.0,
    "referee_max_reward" DECIMAL(10,2),
    "cookie_window_days" INTEGER NOT NULL DEFAULT 30,
    "min_payout_amount" DECIMAL(10,2) NOT NULL DEFAULT 20.0,
    "payout_currency" TEXT NOT NULL DEFAULT 'USD',
    "conversion_statuses" TEXT[] DEFAULT ARRAY['confirmed','in_progress','completed']::TEXT[],
    "hero_title" TEXT,
    "hero_subtitle" TEXT,
    "terms_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "referral_settings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "referral_settings_tenant_id_key" ON "referral_settings"("tenant_id");

-- ===== referral_payouts =====
CREATE TABLE IF NOT EXISTS "referral_payouts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" TEXT NOT NULL,
    "details" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "processed_by" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "referral_payouts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "referral_payouts_tenant_id_affiliate_id_idx" ON "referral_payouts"("tenant_id","affiliate_id");
CREATE INDEX IF NOT EXISTS "referral_payouts_tenant_id_status_idx" ON "referral_payouts"("tenant_id","status");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'referral_payouts_affiliate_id_fkey') THEN
    ALTER TABLE "referral_payouts" ADD CONSTRAINT "referral_payouts_affiliate_id_fkey"
      FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- ===== referral_ledger =====
CREATE TABLE IF NOT EXISTS "referral_ledger" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "booking_id" TEXT,
    "referred_user_id" TEXT,
    "payout_id" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "referral_ledger_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "referral_ledger_tenant_id_affiliate_id_idx" ON "referral_ledger"("tenant_id","affiliate_id");
CREATE INDEX IF NOT EXISTS "referral_ledger_tenant_id_created_at_idx" ON "referral_ledger"("tenant_id","created_at");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'referral_ledger_affiliate_id_fkey') THEN
    ALTER TABLE "referral_ledger" ADD CONSTRAINT "referral_ledger_affiliate_id_fkey"
      FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- ===== affiliate_referrals (snapshots + unique) =====
ALTER TABLE "affiliate_referrals"
  ADD COLUMN IF NOT EXISTS "registered_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "converted_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "referrer_reward" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "referee_reward" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS "affiliate_referrals_tenant_id_referred_user_id_key"
    ON "affiliate_referrals"("tenant_id","referred_user_id");

-- ===== affiliate_commissions (currency + rate) =====
ALTER TABLE "affiliate_commissions"
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS "rate" DECIMAL(5,2);

CREATE INDEX IF NOT EXISTS "affiliate_commissions_tenant_id_affiliate_id_idx"
    ON "affiliate_commissions"("tenant_id","affiliate_id");

-- ===== tracking_events =====
CREATE TABLE IF NOT EXISTS "tracking_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'web',
    "event_id" TEXT,
    "user_id" TEXT,
    "session_id" TEXT,
    "url" TEXT,
    "referrer" TEXT,
    "user_agent" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,
    "gclid" TEXT,
    "fbclid" TEXT,
    "msclkid" TEXT,
    "value" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "items" JSONB,
    "content_name" TEXT,
    "content_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "payload" JSONB,
    "forwarded_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "error_msg" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tracking_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "tracking_events_tenant_id_event_name_idx" ON "tracking_events"("tenant_id","event_name");
CREATE INDEX IF NOT EXISTS "tracking_events_tenant_id_created_at_idx" ON "tracking_events"("tenant_id","created_at");
CREATE INDEX IF NOT EXISTS "tracking_events_tenant_id_utm_campaign_idx" ON "tracking_events"("tenant_id","utm_campaign");

-- ===== leads =====
CREATE TABLE IF NOT EXISTS "leads" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "campaign" TEXT,
    "form_slug" TEXT,
    "package_slug" TEXT,
    "travelers" INTEGER DEFAULT 1,
    "departure_city" TEXT,
    "budget" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "assigned_to" TEXT,
    "notes" TEXT,
    "meta_lead_id" TEXT,
    "meta_synced_at" TIMESTAMP(3),
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,
    "fbclid" TEXT,
    "gclid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "leads_tenant_id_status_idx" ON "leads"("tenant_id","status");
CREATE INDEX IF NOT EXISTS "leads_tenant_id_created_at_idx" ON "leads"("tenant_id","created_at");

-- ===== landing_pages =====
CREATE TABLE IF NOT EXISTS "landing_pages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "hero_image" TEXT,
    "body" JSONB,
    "cta_label" TEXT,
    "cta_href" TEXT,
    "form_slug" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_image" TEXT,
    "campaign" TEXT,
    "utm_source" TEXT,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "bookings" INTEGER NOT NULL DEFAULT 0,
    "revenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "landing_pages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "landing_pages_tenant_id_slug_key" ON "landing_pages"("tenant_id","slug");

-- ===== tracking_settings =====
CREATE TABLE IF NOT EXISTS "tracking_settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "meta_pixel_id" TEXT,
    "meta_capi_token" TEXT,
    "meta_capi_test_code" TEXT,
    "meta_capi_enabled" BOOLEAN NOT NULL DEFAULT false,
    "ga4_measurement_id" TEXT,
    "ga4_api_secret" TEXT,
    "gtm_container_id" TEXT,
    "google_ads_conversion_id" TEXT,
    "google_ads_conversion_label" TEXT,
    "tiktok_pixel_id" TEXT,
    "snapchat_pixel_id" TEXT,
    "x_pixel_id" TEXT,
    "whatsapp_number" TEXT,
    "whatsapp_greeting" TEXT,
    "trust_badges" JSONB DEFAULT '[]',
    "customer_count" INTEGER NOT NULL DEFAULT 0,
    "years_in_business" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tracking_settings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "tracking_settings_tenant_id_key" ON "tracking_settings"("tenant_id");

-- ===== payment_milestones =====
CREATE TABLE IF NOT EXISTS "payment_milestones" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "payment_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payment_milestones_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "payment_milestones_tenant_id_booking_id_idx" ON "payment_milestones"("tenant_id","booking_id");
CREATE INDEX IF NOT EXISTS "payment_milestones_tenant_id_status_idx" ON "payment_milestones"("tenant_id","status");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payment_milestones_booking_id_fkey') THEN
    ALTER TABLE "payment_milestones" ADD CONSTRAINT "payment_milestones_booking_id_fkey"
      FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
