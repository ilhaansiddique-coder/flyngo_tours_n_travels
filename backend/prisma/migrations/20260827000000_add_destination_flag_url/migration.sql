-- Add flagUrl to destinations so the global country autocomplete can show flags.
ALTER TABLE "destinations" ADD COLUMN "flag_url" TEXT;
