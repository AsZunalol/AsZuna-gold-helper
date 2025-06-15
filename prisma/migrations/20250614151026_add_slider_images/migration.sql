-- DropIndex
DROP INDEX `Guide_authorId_fkey` ON `guide`;

-- AlterTable
ALTER TABLE `guide` ADD COLUMN `slider_images` TEXT NULL;

-- AddForeignKey
ALTER TABLE `Guide` ADD CONSTRAINT `Guide_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
