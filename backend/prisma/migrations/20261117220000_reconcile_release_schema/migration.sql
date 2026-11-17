-- Align migrations with the already-reviewed Prisma schema. No rows are removed.
-- Fresh migration-based release tests exposed these historical discrepancies.
BEGIN;
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_fkey";
ALTER TABLE "device_tokens" DROP CONSTRAINT "device_tokens_user_id_fkey";
ALTER TABLE "hajj_umrah_bookings" DROP CONSTRAINT "hajj_umrah_bookings_user_id_fkey";
ALTER TABLE "payments" DROP CONSTRAINT "payments_booking_id_fkey";
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";
DROP INDEX IF EXISTS "device_tokens_user_id_idx";
ALTER TABLE "device_tokens" ALTER COLUMN "platform" DROP NOT NULL;
ALTER TABLE "payments" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "tours" ALTER COLUMN "max_guests" DROP DEFAULT;
ALTER TABLE "vendor_submissions" ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "vendors" ALTER COLUMN "updated_at" DROP DEFAULT;
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "hajj_umrah_bookings" ADD CONSTRAINT "hajj_umrah_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;
