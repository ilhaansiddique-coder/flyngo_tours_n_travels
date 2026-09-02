-- Referrer signup reward is now configurable and defaults to OFF (0). The
-- previous behaviour hardcoded 500 points to the referrer on signup, which was
-- farm-prone and only fired for OAuth signups. The referrer's real earning is
-- the conversion commission on the referee's actual purchases.
ALTER TABLE "referral_settings"
  ADD COLUMN IF NOT EXISTS "referrer_signup_points" INTEGER NOT NULL DEFAULT 0;
