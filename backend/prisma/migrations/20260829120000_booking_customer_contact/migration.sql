-- Structured customer name + phone on every booking (guest or signed-in), so
-- the admin bookings table can show who booked without relying on a user link.
ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "customer_name"  TEXT,
  ADD COLUMN IF NOT EXISTS "customer_phone" TEXT;
