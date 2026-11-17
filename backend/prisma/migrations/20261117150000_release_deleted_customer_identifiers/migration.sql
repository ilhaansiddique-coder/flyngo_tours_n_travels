-- Release derived phone keys held by previously deleted accounts. Keep their
-- contact details and account IDs for history and possible restoration.
UPDATE "users" SET "phone_key" = NULL
WHERE "deleted_at" IS NOT NULL AND "phone_key" IS NOT NULL;
