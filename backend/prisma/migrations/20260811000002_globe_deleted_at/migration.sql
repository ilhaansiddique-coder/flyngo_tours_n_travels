-- AlterTable
ALTER TABLE "globe_cities" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "globe_routes" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "globe_cities_deleted_at_idx" ON "globe_cities"("deleted_at");
CREATE INDEX "globe_routes_deleted_at_idx" ON "globe_routes"("deleted_at");