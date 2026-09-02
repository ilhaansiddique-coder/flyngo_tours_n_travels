-- CreateTable tour_destinations
CREATE TABLE "tour_destinations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tour_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable hotel_destinations
CREATE TABLE "hotel_destinations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "hotel_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable visa_destinations
CREATE TABLE "visa_destinations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "visa_service_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "visa_destinations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tour_destinations_tour_id_destination_id_key" ON "tour_destinations"("tour_id", "destination_id");
CREATE INDEX "tour_destinations_destination_id_idx" ON "tour_destinations"("destination_id");

CREATE UNIQUE INDEX "hotel_destinations_hotel_id_destination_id_key" ON "hotel_destinations"("hotel_id", "destination_id");
CREATE INDEX "hotel_destinations_destination_id_idx" ON "hotel_destinations"("destination_id");

CREATE UNIQUE INDEX "visa_destinations_visa_service_id_destination_id_key" ON "visa_destinations"("visa_service_id", "destination_id");
CREATE INDEX "visa_destinations_destination_id_idx" ON "visa_destinations"("destination_id");

-- AddForeignKey
ALTER TABLE "tour_destinations" ADD CONSTRAINT "tour_destinations_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tour_destinations" ADD CONSTRAINT "tour_destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "hotel_destinations" ADD CONSTRAINT "hotel_destinations_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "hotel_destinations" ADD CONSTRAINT "hotel_destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "visa_destinations" ADD CONSTRAINT "visa_destinations_visa_service_id_fkey" FOREIGN KEY ("visa_service_id") REFERENCES "visa_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "visa_destinations" ADD CONSTRAINT "visa_destinations_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "destinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
