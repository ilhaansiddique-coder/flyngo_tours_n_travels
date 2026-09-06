-- AlterTable
ALTER TABLE "Registration" ADD COLUMN "bkashTrxId" TEXT;
ALTER TABLE "Registration" ADD COLUMN "receipt" TEXT;
ALTER TABLE "Registration" ADD COLUMN "adminNote" TEXT;
ALTER TABLE "Registration" ADD COLUMN "approvedAt" TIMESTAMP(3);