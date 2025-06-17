-- DropIndex
DROP INDEX `Guide_authorId_fkey` ON `guide`;

-- CreateTable
CREATE TABLE `ItemPriceHistory` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` INTEGER NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `realmSlug` VARCHAR(191) NOT NULL,
    `userRealmPrice` INTEGER NOT NULL,
    `regionalAvgPrice` INTEGER NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Guide` ADD CONSTRAINT `Guide_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
