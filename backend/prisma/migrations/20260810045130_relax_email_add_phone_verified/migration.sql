-- DropIndex
DROP INDEX "users_tenant_id_email_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone_verified_at" TIMESTAMP(3),
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "users_tenant_id_email_idx" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "users_tenant_id_phone_idx" ON "users"("tenant_id", "phone");
