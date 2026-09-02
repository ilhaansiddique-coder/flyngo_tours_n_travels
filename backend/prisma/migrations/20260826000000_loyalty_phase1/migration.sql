-- Phase 1 loyalty ledger. Point balances are denormalized on users and are
-- changed only in the same transaction that writes point_transactions.

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "pending_points" INTEGER NOT NULL DEFAULT 0;

DO $$ BEGIN
  CREATE TYPE "PointTransactionType" AS ENUM (
    'REFERRAL_SIGNUP', 'BOOKING_CONFIRMED', 'BOOKING_COMPLETED',
    'REDEMPTION', 'ADMIN_ADJUSTMENT', 'REVERSAL'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PointTransactionStatus" AS ENUM ('PENDING', 'POSTED', 'REVERSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PointReferenceType" AS ENUM ('BOOKING', 'REFERRAL', 'REDEMPTION', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "point_transactions" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" "PointTransactionType" NOT NULL,
  "amount" INTEGER NOT NULL,
  "status" "PointTransactionStatus" NOT NULL DEFAULT 'POSTED',
  "reference_type" "PointReferenceType" NOT NULL,
  "reference_id" TEXT NOT NULL,
  "idempotency_key" TEXT NOT NULL,
  "balance_after" JSONB NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "point_transactions_idempotency_key_key"
  ON "point_transactions"("idempotency_key");
CREATE UNIQUE INDEX IF NOT EXISTS "point_transactions_reference_type_reference_id_type_key"
  ON "point_transactions"("reference_type", "reference_id", "type");
CREATE INDEX IF NOT EXISTS "point_transactions_user_id_created_at_idx"
  ON "point_transactions"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "point_transactions_user_id_type_created_at_idx"
  ON "point_transactions"("user_id", "type", "created_at");

DO $$ BEGIN
  ALTER TABLE "point_transactions"
    ADD CONSTRAINT "point_transactions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Preserve existing loyalty history when moving the write path to the new
-- ledger. Legacy rows are imported as immutable posted entries; their original
-- identifiers remain in metadata because the old table had no idempotency key.
INSERT INTO "point_transactions" (
  "id", "user_id", "type", "amount", "status", "reference_type", "reference_id",
  "idempotency_key", "balance_after", "metadata", "created_at"
)
SELECT
  CONCAT('legacy-', lt."id"),
  la."user_id",
  CASE lt."type"
    WHEN 'referral_signup' THEN 'REFERRAL_SIGNUP'::"PointTransactionType"
    WHEN 'booking_confirmation' THEN 'BOOKING_CONFIRMED'::"PointTransactionType"
    WHEN 'booking_completion' THEN 'BOOKING_COMPLETED'::"PointTransactionType"
    WHEN 'redemption' THEN 'REDEMPTION'::"PointTransactionType"
    WHEN 'refund' THEN 'REVERSAL'::"PointTransactionType"
    ELSE 'ADMIN_ADJUSTMENT'::"PointTransactionType"
  END,
  lt."points",
  'POSTED'::"PointTransactionStatus",
  CASE WHEN lt."booking_id" IS NOT NULL THEN 'BOOKING'::"PointReferenceType"
       WHEN lt."referral_id" IS NOT NULL THEN 'REFERRAL'::"PointReferenceType"
       ELSE 'ADMIN'::"PointReferenceType"
  END,
  lt."id",
  CONCAT('legacy:', lt."id"),
  jsonb_build_object(
    'lifetime', u."lifetime_points",
    'available', u."available_points",
    'pending', u."pending_points"
  ),
  jsonb_build_object(
    'legacyTransactionId', lt."id",
    'legacyBookingId', lt."booking_id",
    'legacyReferralId', lt."referral_id",
    'legacyType', lt."type"
  ) || COALESCE(lt."metadata", '{}'::jsonb),
  lt."created_at"
FROM "loyalty_transactions" lt
JOIN "loyalty_accounts" la ON la."id" = lt."account_id"
JOIN "users" u ON u."id" = la."user_id"
WHERE NOT EXISTS (
  SELECT 1 FROM "point_transactions" pt WHERE pt."idempotency_key" = CONCAT('legacy:', lt."id")
);
