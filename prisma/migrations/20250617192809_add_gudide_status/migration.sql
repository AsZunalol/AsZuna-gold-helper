-- DropIndex
DROP INDEX `Guide_authorId_fkey` ON `guide`;

-- AlterTable
ALTER TABLE `guide` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT';

-- AddForeignKey
ALTER TABLE `Guide` ADD CONSTRAINT `Guide_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
