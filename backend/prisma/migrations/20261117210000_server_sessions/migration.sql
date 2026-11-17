CREATE TABLE "auth_sessions" (
  "id" TEXT PRIMARY KEY,
  "tenant_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3)
);
CREATE INDEX "auth_sessions_tenant_id_user_id_idx" ON "auth_sessions"("tenant_id", "user_id");
CREATE TABLE "session_refresh_tokens" (
  "id" TEXT PRIMARY KEY,
  "session_id" TEXT NOT NULL REFERENCES "auth_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "token_hash" TEXT NOT NULL UNIQUE,
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "session_refresh_tokens_session_id_idx" ON "session_refresh_tokens"("session_id");
-- Retire the previous unused token field. Existing stateless credentials cannot migrate safely.
UPDATE "users" SET "refresh_token" = NULL WHERE "refresh_token" IS NOT NULL;
