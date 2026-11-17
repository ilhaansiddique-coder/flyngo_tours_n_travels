-- Existing accounts remain unknown; do not invent historical creators.
ALTER TABLE "users"
  ADD COLUMN "creation_source" TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN "created_by_user_id" TEXT;

CREATE INDEX "users_created_by_user_id_idx" ON "users"("created_by_user_id");
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_user_id_fkey"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
