/*
  Warnings:

  - Made the column `trust_badges` on table `tracking_settings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "affiliates_tenant_id_affiliate_type_idx";

-- AlterTable
ALTER TABLE "affiliate_referrals" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "tracking_settings" ALTER COLUMN "trust_badges" SET NOT NULL;

-- CreateIndex
CREATE INDEX "affiliate_referrals_tenant_id_affiliate_id_idx" ON "affiliate_referrals"("tenant_id", "affiliate_id");

-- AddForeignKey
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_accounts" ADD CONSTRAINT "loyalty_accounts_current_tier_id_fkey" FOREIGN KEY ("current_tier_id") REFERENCES "loyalty_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "loyalty_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
