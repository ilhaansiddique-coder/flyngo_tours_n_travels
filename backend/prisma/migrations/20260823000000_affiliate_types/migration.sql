-- Affiliate program: two affiliation types with admin-configurable conditions
-- 01. fixed_commission  — earns cash commission per converted booking
-- 02. commission_less   — points-only referrer (no cash commissions, no payouts)

ALTER TABLE "affiliates" ADD COLUMN IF NOT EXISTS "affiliate_type" TEXT NOT NULL DEFAULT 'fixed_commission';

ALTER TABLE "referral_settings" ADD COLUMN IF NOT EXISTS "default_affiliate_type" TEXT NOT NULL DEFAULT 'fixed_commission';
ALTER TABLE "referral_settings" ADD COLUMN IF NOT EXISTS "fixed_commission_type" TEXT NOT NULL DEFAULT 'percentage';
ALTER TABLE "referral_settings" ADD COLUMN IF NOT EXISTS "fixed_commission_value" DECIMAL(10,2) NOT NULL DEFAULT 5.0;
ALTER TABLE "referral_settings" ADD COLUMN IF NOT EXISTS "commissionless_signup_points" INTEGER NOT NULL DEFAULT 500;

CREATE INDEX IF NOT EXISTS "affiliates_tenant_id_affiliate_type_idx" ON "affiliates"("tenant_id", "affiliate_type");
