-- AlterTable
ALTER TABLE "bookings"
  ADD COLUMN "hotel_id"        TEXT,
  ADD COLUMN "room_id"         TEXT,
  ADD COLUMN "hotel_name"      TEXT,
  ADD COLUMN "room_name"       TEXT,
  ADD COLUMN "rooms_count"     INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "adults"          INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "children"        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "child_ages"      INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  ADD COLUMN "meal_plan"       TEXT,
  ADD COLUMN "nights"          INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "price_per_night" DECIMAL(10, 2),
  ADD COLUMN "arrival_time"    TEXT,
  ADD COLUMN "flight_number"   TEXT;

-- CreateIndex
CREATE INDEX "bookings_hotel_id_idx" ON "bookings"("hotel_id");
CREATE INDEX "bookings_room_id_idx" ON "bookings"("room_id");

-- CreateTable
CREATE TABLE "booking_travelers" (
    "id"         TEXT NOT NULL,
    "tenant_id"  TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "is_lead"    BOOLEAN NOT NULL DEFAULT false,
    "full_name"  TEXT NOT NULL,
    "email"      TEXT,
    "phone"      TEXT,
    "age"        INTEGER,
    "type"       TEXT NOT NULL DEFAULT 'adult',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_travelers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_travelers_booking_id_idx" ON "booking_travelers"("booking_id");

-- AddForeignKey
ALTER TABLE "booking_travelers" ADD CONSTRAINT "booking_travelers_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
