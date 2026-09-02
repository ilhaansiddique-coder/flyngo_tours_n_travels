-- Allow guest bookings (no linked user account)
ALTER TABLE "bookings" ALTER COLUMN "user_id" DROP NOT NULL;
