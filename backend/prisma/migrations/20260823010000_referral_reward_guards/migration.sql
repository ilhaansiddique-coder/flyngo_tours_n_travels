-- Prevent referral discounts from being reused and commissions from duplicating.

ALTER TABLE "affiliate_referrals"
  ADD COLUMN IF NOT EXISTS "discount_used_at" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "affiliate_commissions_tenant_id_booking_id_key"
  ON "affiliate_commissions"("tenant_id", "booking_id");
