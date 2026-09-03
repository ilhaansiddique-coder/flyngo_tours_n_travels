-- CreateTable mobile_wallets
CREATE TABLE "mobile_wallets" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "wallet_number" TEXT NOT NULL,
    "account_type" TEXT NOT NULL DEFAULT 'personal',
    "instructions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "mobile_wallets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mobile_wallets_tenant_id_is_active_idx" ON "mobile_wallets"("tenant_id", "is_active");

ALTER TABLE "payments" ADD COLUMN "mobile_wallet_id" TEXT;

ALTER TABLE "payments" ADD CONSTRAINT "payments_mobile_wallet_id_fkey" FOREIGN KEY ("mobile_wallet_id") REFERENCES "mobile_wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
