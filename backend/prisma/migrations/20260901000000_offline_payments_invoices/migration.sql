-- AlterTable tenant_settings: public bKash wallet + payment instructions
ALTER TABLE "tenant_settings" ADD COLUMN "bkash_wallet_number" TEXT;
ALTER TABLE "tenant_settings" ADD COLUMN "bkash_merchant_name" TEXT;
ALTER TABLE "tenant_settings" ADD COLUMN "payment_instructions" TEXT;

-- AlterTable payments: offline confirmation fields
ALTER TABLE "payments" ALTER COLUMN "booking_id" DROP NOT NULL;
ALTER TABLE "payments" ADD COLUMN "hajj_umrah_booking_id" TEXT;
ALTER TABLE "payments" ADD COLUMN "bkash_trx_id" TEXT;
ALTER TABLE "payments" ADD COLUMN "bank_account_id" TEXT;
ALTER TABLE "payments" ADD COLUMN "receipt_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "payments" ADD COLUMN "sender_name" TEXT;
ALTER TABLE "payments" ADD COLUMN "sender_account" TEXT;
ALTER TABLE "payments" ADD COLUMN "payer_phone" TEXT;
ALTER TABLE "payments" ADD COLUMN "notes" TEXT;
ALTER TABLE "payments" ADD COLUMN "verified_at" TIMESTAMP(3);
ALTER TABLE "payments" ADD COLUMN "verified_by_id" TEXT;

-- CreateTable bank_accounts
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "branch" TEXT,
    "routing_number" TEXT,
    "swift_code" TEXT,
    "instructions" TEXT,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable invoices
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "user_id" TEXT,
    "booking_id" TEXT,
    "hajj_umrah_booking_id" TEXT,
    "payment_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'issued',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "line_items" JSONB NOT NULL,
    "notes" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_accounts_tenant_id_is_active_idx" ON "bank_accounts"("tenant_id", "is_active");

CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
CREATE UNIQUE INDEX "invoices_payment_id_key" ON "invoices"("payment_id");
CREATE INDEX "invoices_tenant_id_user_id_idx" ON "invoices"("tenant_id", "user_id");
CREATE INDEX "invoices_booking_id_idx" ON "invoices"("booking_id");

CREATE INDEX "payments_tenant_id_hajj_umrah_booking_id_idx" ON "payments"("tenant_id", "hajj_umrah_booking_id");
CREATE UNIQUE INDEX "payments_tenant_id_bkash_trx_id_key" ON "payments"("tenant_id", "bkash_trx_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_hajj_umrah_booking_id_fkey" FOREIGN KEY ("hajj_umrah_booking_id") REFERENCES "hajj_umrah_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_hajj_umrah_booking_id_fkey" FOREIGN KEY ("hajj_umrah_booking_id") REFERENCES "hajj_umrah_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
