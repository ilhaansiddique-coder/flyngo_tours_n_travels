-- AlterTable
ALTER TABLE "Registration" ADD COLUMN "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Registration_mobile_key" ON "Registration"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_email_key" ON "Registration"("email");