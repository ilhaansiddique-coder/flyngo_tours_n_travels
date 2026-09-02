-- User-uploaded profile documents/images (metadata; binary lives in media storage).
CREATE TABLE "user_documents" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT,
    "size" INTEGER,
    "kind" TEXT NOT NULL DEFAULT 'document',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_documents_user_id_deleted_at_idx" ON "user_documents"("user_id", "deleted_at");

ALTER TABLE "user_documents"
  ADD CONSTRAINT "user_documents_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
