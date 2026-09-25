-- CreateTable vendors
CREATE TABLE IF NOT EXISTS "vendors" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "service_type" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable vendor_submissions
CREATE TABLE IF NOT EXISTS "vendor_submissions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "done_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "amount" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "reference" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vendor_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "vendors_tenant_id_idx" ON "vendors"("tenant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "vendors_tenant_id_name_key" ON "vendors"("tenant_id", "name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "vendor_submissions_tenant_id_idx" ON "vendor_submissions"("tenant_id");
CREATE INDEX IF NOT EXISTS "vendor_submissions_vendor_id_idx" ON "vendor_submissions"("vendor_id");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'vendor_submissions_vendor_id_fkey'
    ) THEN
        ALTER TABLE "vendor_submissions" ADD CONSTRAINT "vendor_submissions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
