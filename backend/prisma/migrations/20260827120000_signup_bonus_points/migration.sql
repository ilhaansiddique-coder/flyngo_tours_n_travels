-- Signup bonus: every new user receives loyalty points on registration.
-- New ledger vocabulary + a configurable amount on the referral settings.

ALTER TYPE "PointTransactionType" ADD VALUE IF NOT EXISTS 'SIGNUP_BONUS';
ALTER TYPE "PointReferenceType" ADD VALUE IF NOT EXISTS 'SIGNUP';

ALTER TABLE "referral_settings"
  ADD COLUMN IF NOT EXISTS "signup_bonus_points" INTEGER NOT NULL DEFAULT 100;
