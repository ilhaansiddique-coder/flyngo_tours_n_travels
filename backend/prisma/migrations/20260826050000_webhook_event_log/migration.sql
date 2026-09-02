-- Webhook event log for payment-gateway idempotency. A retried Stripe or
-- bKash webhook carrying the same event id must not process the payment twice.
CREATE TABLE "webhook_event_logs" (
    "id"         TEXT NOT NULL,
    "tenant_id"  TEXT,
    "provider"   TEXT NOT NULL,
    "event_id"   TEXT NOT NULL,
    "event_type" TEXT,
    "payload"    JSONB,
    "processed"  BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_event_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "webhook_event_logs_provider_event_id_key"
  ON "webhook_event_logs"("provider", "event_id");
CREATE INDEX "webhook_event_logs_provider_created_at_idx"
  ON "webhook_event_logs"("provider", "created_at");
