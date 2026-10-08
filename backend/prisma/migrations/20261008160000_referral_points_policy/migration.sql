-- AlterTable: update referral_settings defaults to 100 pts signup, 250 pts referral, 0% referee discount
ALTER TABLE "referral_settings"
  ALTER COLUMN "referee_reward_value" SET DEFAULT 0.0,
  ALTER COLUMN "referrer_signup_points" SET DEFAULT 250,
  ALTER COLUMN "commissionless_signup_points" SET DEFAULT 250;

-- Update existing records to match new policy
UPDATE "referral_settings"
SET "referee_reward_value" = 0.0,
    "referrer_signup_points" = 250,
    "commissionless_signup_points" = 250,
    "signup_bonus_points" = 100;
