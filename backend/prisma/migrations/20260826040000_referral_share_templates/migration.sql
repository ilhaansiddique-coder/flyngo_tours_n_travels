-- Per-channel share message templates. Each tenant stores its own copy;
-- default templates are seeded by the application when a row is missing.
ALTER TABLE "referral_settings"
  ADD COLUMN "share_message_templates" JSONB;
