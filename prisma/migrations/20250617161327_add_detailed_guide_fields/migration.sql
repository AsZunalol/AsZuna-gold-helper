/*
  Warnings:

  - You are about to drop the column `addons` on the `guide` table. All the data in the column will be lost.
  - You are about to drop the column `map_image_path` on the `guide` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Guide_authorId_fkey` ON `guide`;

-- AlterTable
ALTER TABLE `guide` DROP COLUMN `addons`,
    DROP COLUMN `map_image_path`,
    ADD COLUMN `gold_sessions` JSON NULL,
    ADD COLUMN `guide_type` VARCHAR(191) NULL,
    ADD COLUMN `macro_string` TEXT NULL,
    ADD COLUMN `map_image_url` VARCHAR(1024) NULL,
    ADD COLUMN `recommended_addons` JSON NULL;

-- AddForeignKey
ALTER TABLE `Guide` ADD CONSTRAINT `Guide_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
