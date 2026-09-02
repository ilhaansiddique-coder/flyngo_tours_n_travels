-- Referral: one-time referee discount on the first Hajj/Umrah booking made
-- through a referral link. Columns added to the existing table (no new table).
ALTER TABLE "hajj_umrah_bookings"
  ADD COLUMN "referral_discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "discount_amount"   DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "referred_by_code"  TEXT;
