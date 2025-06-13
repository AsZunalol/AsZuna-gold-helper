-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Guide` (
    `id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `expansion` VARCHAR(191) NULL,
    `is_route` BOOLEAN NOT NULL DEFAULT false,
    `description` TEXT NULL,
    `steps` TEXT NULL,
    `addons` TEXT NULL,
    `thumbnail_url` VARCHAR(1024) NULL,
    `map_image_path` VARCHAR(1024) NULL,
    `video_thumbnail_path` VARCHAR(1024) NULL,
    `youtube_video_id` VARCHAR(191) NULL,
    `time_to_complete` VARCHAR(191) NULL,
    `recommended_class` VARCHAR(191) NULL,
    `required_items` TEXT NULL,
    `gold_pr_hour` VARCHAR(191) NULL,
    `tsm_import_string` TEXT NULL,
    `gathermate2_string` TEXT NULL,
    `authorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Guide` ADD CONSTRAINT `Guide_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
