-- Hajj/Umrah compliance + per-occupancy pricing + real booking system (Phase 1).

-- 1. Per-occupancy pricing + compliance policy on Hajj packages
ALTER TABLE "hajj_packages"
  ADD COLUMN "quad_price"      DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "triple_price"    DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "double_price"    DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "balance_due_date" TIMESTAMP(3),
  ADD COLUMN "require_mahram_for_females" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "passport_validity_months"  INTEGER NOT NULL DEFAULT 6;

-- 2. Per-occupancy pricing + compliance policy on Umrah packages
ALTER TABLE "umrah_packages"
  ADD COLUMN "quad_price"      DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "triple_price"    DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "double_price"    DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "balance_due_date" TIMESTAMP(3),
  ADD COLUMN "require_mahram_for_females" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "passport_validity_months"  INTEGER NOT NULL DEFAULT 6;

-- 3. Compliance capture on pre-registrations (lead form)
ALTER TABLE "hajj_pre_registrations"
  ADD COLUMN "passport_expiry" TIMESTAMP(3),
  ADD COLUMN "gender" TEXT,
  ADD COLUMN "mahram_relation" TEXT;

-- 4. Hajj/Umrah bookings
CREATE TABLE "hajj_umrah_bookings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "package_title" TEXT NOT NULL,
    "package_slug" TEXT NOT NULL,
    "departure_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3),
    "duration_days" INTEGER NOT NULL DEFAULT 0,
    "occupancy_type" TEXT NOT NULL DEFAULT 'quad',
    "num_pilgrims" INTEGER NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "per_person_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "advance_paid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balance_due" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balance_due_date" TIMESTAMP(3),
    "payment_plan" TEXT NOT NULL DEFAULT 'full',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_status" TEXT NOT NULL DEFAULT 'unpaid',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hajj_umrah_bookings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "hajj_umrah_bookings_tenant_id_user_id_idx" ON "hajj_umrah_bookings"("tenant_id", "user_id");
CREATE INDEX "hajj_umrah_bookings_tenant_id_kind_status_idx" ON "hajj_umrah_bookings"("tenant_id", "kind", "status");
CREATE INDEX "hajj_umrah_bookings_tenant_id_package_id_idx" ON "hajj_umrah_bookings"("tenant_id", "package_id");

ALTER TABLE "hajj_umrah_bookings" ADD CONSTRAINT "hajj_umrah_bookings_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. Pilgrims
CREATE TABLE "pilgrims" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "passport_number" TEXT NOT NULL,
    "passport_expiry" TIMESTAMP(3) NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'male',
    "mahram_relation" TEXT,
    "relationship_to_lead" TEXT,

    CONSTRAINT "pilgrims_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "pilgrims_booking_id_idx" ON "pilgrims"("booking_id");

ALTER TABLE "pilgrims" ADD CONSTRAINT "pilgrims_booking_id_fkey"
  FOREIGN KEY ("booking_id") REFERENCES "hajj_umrah_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
