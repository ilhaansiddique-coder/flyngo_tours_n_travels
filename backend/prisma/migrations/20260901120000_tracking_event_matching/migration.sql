-- Advanced matching + consent fields for Meta CAPI (tracking_events)
ALTER TABLE "tracking_events" ADD COLUMN "email" TEXT;
ALTER TABLE "tracking_events" ADD COLUMN "phone" TEXT;
ALTER TABLE "tracking_events" ADD COLUMN "full_name" TEXT;
ALTER TABLE "tracking_events" ADD COLUMN "external_id" TEXT;
ALTER TABLE "tracking_events" ADD COLUMN "fbp" TEXT;
ALTER TABLE "tracking_events" ADD COLUMN "fbc" TEXT;
ALTER TABLE "tracking_events" ADD COLUMN "consent" TEXT;

-- Consent & LDU switches (tracking_settings) — off by default
ALTER TABLE "tracking_settings" ADD COLUMN "require_marketing_consent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tracking_settings" ADD COLUMN "meta_ldu_enabled" BOOLEAN NOT NULL DEFAULT false;