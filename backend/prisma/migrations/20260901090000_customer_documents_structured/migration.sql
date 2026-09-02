-- AlterTable: add structured identity / travel document fields to users.
-- NID (national id) number + front/back copy, passport number + copy.

ALTER TABLE "users" ADD COLUMN "national_id" TEXT,
ADD COLUMN "national_id_front_url" TEXT,
ADD COLUMN "national_id_back_url" TEXT,
ADD COLUMN "passport_number" TEXT,
ADD COLUMN "passport_url" TEXT;
