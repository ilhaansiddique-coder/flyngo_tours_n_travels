ALTER TABLE "media"
  ADD COLUMN "is_private" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "uploaded_by_id" TEXT,
  ADD COLUMN "upload_token_hash" TEXT,
  ADD COLUMN "upload_token_expires_at" TIMESTAMP(3),
  ADD COLUMN "legacy_url" TEXT;
CREATE INDEX "media_tenant_id_is_private_idx" ON "media"("tenant_id", "is_private");
