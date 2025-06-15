/*
  Warnings:

  - You are about to drop the column `gathermate2_string` on the `guide` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Guide_authorId_fkey` ON `guide`;

-- AlterTable
ALTER TABLE `guide` DROP COLUMN `gathermate2_string`,
    ADD COLUMN `route_string` TEXT NULL;

-- AddForeignKey
ALTER TABLE `Guide` ADD CONSTRAINT `Guide_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
