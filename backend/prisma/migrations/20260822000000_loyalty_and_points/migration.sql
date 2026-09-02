-- =============================================================================
-- Loyalty / Rewards system + per-product points
-- =============================================================================
-- Adds:
--   4 new tables: loyalty_tiers, loyalty_accounts, loyalty_transactions, product_points_rules
--   7 new fields on existing product tables (tours, hotels, flights, visa_services, hajj_packages, umrah_packages, transports)
--   4 new fields on bookings (points tracking)
--   5 new fields on users (denormalized loyalty state for fast badge rendering)
-- =============================================================================
-- Idempotent: every CREATE uses IF NOT EXISTS so this migration is safe to
-- re-run against a database that may have partial schema state.

-- =============================================================================
-- USERS — loyalty state
-- =============================================================================
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "lifetime_points"   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "available_points"  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "current_tier_id"   TEXT,
  ADD COLUMN IF NOT EXISTS "tier_achieved_at"  TIMESTAMP(3);

-- =============================================================================
-- TOURS
-- =============================================================================
ALTER TABLE "tours"
  ADD COLUMN IF NOT EXISTS "points_awarded" INTEGER NOT NULL DEFAULT 0;

-- =============================================================================
-- HOTELS
-- =============================================================================
ALTER TABLE "hotels"
  ADD COLUMN IF NOT EXISTS "points_awarded" INTEGER NOT NULL DEFAULT 0;

-- =============================================================================
-- FLIGHTS
-- =============================================================================
ALTER TABLE "flights"
  ADD COLUMN IF NOT EXISTS "points_awarded" INTEGER NOT NULL DEFAULT 0;

-- =============================================================================
-- VISA SERVICES
-- =============================================================================
ALTER TABLE "visa_services"
  ADD COLUMN IF NOT EXISTS "points_awarded" INTEGER NOT NULL DEFAULT 0;

-- =============================================================================
-- HAJJ PACKAGES
-- =============================================================================
ALTER TABLE "hajj_packages"
  ADD COLUMN IF NOT EXISTS "points_awarded" INTEGER NOT NULL DEFAULT 0;

-- =============================================================================
-- UMRAH PACKAGES
-- =============================================================================
ALTER TABLE "umrah_packages"
  ADD COLUMN IF NOT EXISTS "points_awarded" INTEGER NOT NULL DEFAULT 0;

-- =============================================================================
-- TRANSPORTS
-- =============================================================================
ALTER TABLE "transports"
  ADD COLUMN IF NOT EXISTS "points_awarded" INTEGER NOT NULL DEFAULT 0;

-- =============================================================================
-- BOOKINGS — points tracking + redemption
-- =============================================================================
ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "points_awarded_confirmation" INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "points_awarded_completion"   INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "points_redeemed"              INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "points_redemption_bdt"       DECIMAL(10,2) NOT NULL DEFAULT 0;

-- =============================================================================
-- LOYALTY TIERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS "loyalty_tiers" (
  "id"                     TEXT        NOT NULL,
  "tenant_id"              TEXT        NOT NULL,
  "name"                   TEXT        NOT NULL,
  "slug"                   TEXT        NOT NULL,
  "color"                  TEXT        NOT NULL,
  "star_count"             INTEGER     NOT NULL,
  "min_points"             INTEGER     NOT NULL,
  "redemption_multiplier"  DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  "benefits"               JSONB,
  "sort_order"             INTEGER     NOT NULL DEFAULT 0,
  "is_active"              BOOLEAN     NOT NULL DEFAULT true,
  "created_at"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"             TIMESTAMP(3) NOT NULL,
  CONSTRAINT "loyalty_tiers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_tiers_tenant_id_slug_key" ON "loyalty_tiers"("tenant_id","slug");
CREATE INDEX IF NOT EXISTS "loyalty_tiers_tenant_id_min_points_idx" ON "loyalty_tiers"("tenant_id","min_points");

-- =============================================================================
-- LOYALTY ACCOUNTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS "loyalty_accounts" (
  "id"                TEXT        NOT NULL,
  "tenant_id"         TEXT        NOT NULL,
  "user_id"           TEXT        NOT NULL,
  "lifetime_points"   INTEGER     NOT NULL DEFAULT 0,
  "available_points"  INTEGER     NOT NULL DEFAULT 0,
  "redeemed_points"   INTEGER     NOT NULL DEFAULT 0,
  "current_tier_id"   TEXT,
  "tier_achieved_at"  TIMESTAMP(3),
  "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"        TIMESTAMP(3) NOT NULL,
  CONSTRAINT "loyalty_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "loyalty_accounts_user_id_key" ON "loyalty_accounts"("user_id");
CREATE INDEX IF NOT EXISTS "loyalty_accounts_tenant_id_idx" ON "loyalty_accounts"("tenant_id");

-- =============================================================================
-- LOYALTY TRANSACTIONS (audit trail)
-- =============================================================================
CREATE TABLE IF NOT EXISTS "loyalty_transactions" (
  "id"           TEXT        NOT NULL,
  "tenant_id"    TEXT        NOT NULL,
  "account_id"   TEXT        NOT NULL,
  "type"         TEXT        NOT NULL,
  "points"       INTEGER     NOT NULL,
  "currency"     TEXT        DEFAULT 'BDT',
  "bdt_value"    DECIMAL(10,2),
  "booking_id"   TEXT,
  "referral_id"  TEXT,
  "description"  TEXT,
  "metadata"     JSONB,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "loyalty_transactions_tenant_id_account_id_idx" ON "loyalty_transactions"("tenant_id","account_id");
CREATE INDEX IF NOT EXISTS "loyalty_transactions_tenant_id_type_idx" ON "loyalty_transactions"("tenant_id","type");
CREATE INDEX IF NOT EXISTS "loyalty_transactions_tenant_id_created_at_idx" ON "loyalty_transactions"("tenant_id","created_at");

-- =============================================================================
-- PRODUCT POINTS RULES (per-category + per-product overrides)
-- =============================================================================
CREATE TABLE IF NOT EXISTS "product_points_rules" (
  "id"            TEXT        NOT NULL,
  "tenant_id"     TEXT        NOT NULL,
  "product_type"  TEXT        NOT NULL,
  "product_id"    TEXT,
  "product_name"  TEXT,
  "points_value"  INTEGER     NOT NULL DEFAULT 0,
  "max_points"    INTEGER,
  "min_spend"     DECIMAL(10,2),
  "is_active"     BOOLEAN     NOT NULL DEFAULT true,
  "starts_at"     TIMESTAMP(3),
  "ends_at"       TIMESTAMP(3),
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_points_rules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_points_rules_tenant_id_product_type_product_id_key"
  ON "product_points_rules"("tenant_id","product_type","product_id");
CREATE INDEX IF NOT EXISTS "product_points_rules_tenant_id_product_type_idx"
  ON "product_points_rules"("tenant_id","product_type");

-- =============================================================================
-- SEED: 5 default tiers (Silver, Gold, Platinum, Diamond, Ambassador)
-- =============================================================================
-- This block runs on every existing tenant at migration time. Idempotent.
-- The actual seed for new tenants happens via the LoyaltyService on first request.
--
-- Skipping in-migration seed because tenant IDs are unknown here.
-- Seed will be performed by backend LoyaltyService.ensureTiers() on first call.
