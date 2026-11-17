CREATE TABLE "media_deletion_jobs" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "retry_after" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "media_deletion_jobs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "media_deletion_jobs_tenant_id_url_key" ON "media_deletion_jobs"("tenant_id", "url");
CREATE INDEX "media_deletion_jobs_retry_after_idx" ON "media_deletion_jobs"("retry_after");
