-- The schema declares Booking.userId String? (guests may book), but the column
-- was NOT NULL in the DB — a drift that made every null-user booking fail with
-- a P2011 null-constraint error. Align the DB with the schema.
ALTER TABLE "bookings" ALTER COLUMN "user_id" DROP NOT NULL;
