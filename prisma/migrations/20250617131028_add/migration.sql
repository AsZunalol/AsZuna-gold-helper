-- DropIndex
DROP INDEX `Guide_authorId_fkey` ON `guide`;

-- AlterTable
ALTER TABLE `guide` ADD COLUMN `is_transmog` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `Guide` ADD CONSTRAINT `Guide_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
