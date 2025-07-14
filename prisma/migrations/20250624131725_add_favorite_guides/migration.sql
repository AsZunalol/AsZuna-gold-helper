-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "imageUrl" VARCHAR(191),
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'active',
    "region" TEXT,
    "realm" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "expansion" TEXT,
    "is_route" BOOLEAN NOT NULL DEFAULT false,
    "is_transmog" BOOLEAN NOT NULL DEFAULT false,
    "guide_type" TEXT,
    "map_image_url" VARCHAR(1024),
    "recommended_addons" JSONB,
    "macro_string" TEXT,
    "gold_sessions" JSONB,
    "description" TEXT,
    "steps" TEXT,
    "thumbnail_url" VARCHAR(1024),
    "video_thumbnail_path" VARCHAR(1024),
    "youtube_video_id" TEXT,
    "time_to_complete" TEXT,
    "recommended_class" TEXT,
    "required_items" TEXT,
    "items_of_note" JSONB,
    "gold_pr_hour" TEXT,
    "tsm_import_string" TEXT,
    "route_string" TEXT,
    "slider_images" TEXT,
    "tags" TEXT,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPrice" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "region" VARCHAR(10) NOT NULL,
    "realmSlug" VARCHAR(35) NOT NULL,
    "userRealmPrice" INTEGER,
    "regionalAvgPrice" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WowTokenPrice" (
    "id" SERIAL NOT NULL,
    "region" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "trend" TEXT NOT NULL DEFAULT 'stable',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WowTokenPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WowTokenPriceHistory" (
    "id" SERIAL NOT NULL,
    "region" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WowTokenPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogEntry" (
    "id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPriceHistory" (
    "id" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "realmSlug" TEXT NOT NULL,
    "userRealmPrice" INTEGER NOT NULL,
    "regionalAvgPrice" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apiLog" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apiLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FavoriteGuides" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FavoriteGuides_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");

-- CreateIndex
CREATE INDEX "ItemPrice_itemId_region_realmSlug_idx" ON "ItemPrice"("itemId", "region", "realmSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ItemPrice_itemId_region_realmSlug_key" ON "ItemPrice"("itemId", "region", "realmSlug");

-- CreateIndex
CREATE UNIQUE INDEX "WowTokenPrice_region_key" ON "WowTokenPrice"("region");

-- CreateIndex
CREATE INDEX "WowTokenPriceHistory_region_idx" ON "WowTokenPriceHistory"("region");

-- CreateIndex
CREATE INDEX "_FavoriteGuides_B_index" ON "_FavoriteGuides"("B");

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoriteGuides" ADD CONSTRAINT "_FavoriteGuides_A_fkey" FOREIGN KEY ("A") REFERENCES "Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FavoriteGuides" ADD CONSTRAINT "_FavoriteGuides_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
