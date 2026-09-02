-- Loyalty points columns for Hajj/Umrah bookings (mirrors the generic Booking).
ALTER TABLE "hajj_umrah_bookings"
  ADD COLUMN IF NOT EXISTS "points_awarded_confirmation" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "points_awarded_completion" INTEGER NOT NULL DEFAULT 0;
