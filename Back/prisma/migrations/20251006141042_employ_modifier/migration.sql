/*
  Warnings:

  - You are about to drop the column `employeId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Employe` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_employeId_fkey`;

-- DropIndex
DROP INDEX `User_employeId_key` ON `User`;

-- AlterTable
ALTER TABLE `Employe` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `employeId`;

-- CreateIndex
CREATE UNIQUE INDEX `Employe_userId_key` ON `Employe`(`userId`);

-- AddForeignKey
ALTER TABLE `Employe` ADD CONSTRAINT `Employe_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
