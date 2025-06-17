/*
  Warnings:

  - A unique constraint covering the columns `[itemId,region,realmSlug]` on the table `ItemPrice` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Guide_authorId_fkey` ON `guide`;

-- CreateIndex
CREATE UNIQUE INDEX `ItemPrice_itemId_region_realmSlug_key` ON `ItemPrice`(`itemId`, `region`, `realmSlug`);

-- AddForeignKey
ALTER TABLE `Guide` ADD CONSTRAINT `Guide_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
