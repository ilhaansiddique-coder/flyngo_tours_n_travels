-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT 'saint-martin-trip-2026',
    "tag" TEXT NOT NULL DEFAULT 'saintmartin',
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "emergency" TEXT,
    "organization" TEXT,
    "bloodGroup" TEXT,
    "address" TEXT,
    "reference" TEXT,
    "fbProfile" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Registration_slug_idx" ON "Registration"("slug");

-- CreateIndex
CREATE INDEX "Registration_tag_idx" ON "Registration"("tag");