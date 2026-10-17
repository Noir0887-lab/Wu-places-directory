-- CreateTable
CREATE TABLE "PlaceImage" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "caption" VARCHAR(200) NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaceImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "placeId" INTEGER NOT NULL,
    "floor" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(30) NOT NULL DEFAULT '',
    "category" VARCHAR(50) NOT NULL DEFAULT 'ห้องเรียน',
    "capacity" INTEGER,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaceImage_placeId_sortOrder_idx" ON "PlaceImage"("placeId", "sortOrder");

-- CreateIndex
CREATE INDEX "Room_placeId_floor_idx" ON "Room"("placeId", "floor");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- AddForeignKey
ALTER TABLE "PlaceImage" ADD CONSTRAINT "PlaceImage_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: คัดลอกรูปเดิม (Place.imageUrl) เข้าตารางรูปภาพ เพื่อให้อาคารที่มีอยู่แล้วมีรูปแรกเป็นรูปปกเหมือนเดิม
INSERT INTO "PlaceImage" ("placeId", "url", "caption", "sortOrder")
SELECT "id", "imageUrl", '', 0 FROM "Place" WHERE "imageUrl" <> '';
