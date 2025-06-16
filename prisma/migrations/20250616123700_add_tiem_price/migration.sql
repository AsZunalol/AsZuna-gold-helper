-- DropIndex
DROP INDEX `Guide_authorId_fkey` ON `guide`;

-- CreateTable
CREATE TABLE `ItemPrice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NOT NULL,
    `region` VARCHAR(10) NOT NULL,
    `realmSlug` VARCHAR(35) NOT NULL,
    `userRealmPrice` INTEGER NULL,
    `regionalAvgPrice` INTEGER NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ItemPrice_itemId_region_realmSlug_idx`(`itemId`, `region`, `realmSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Guide` ADD CONSTRAINT `Guide_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
