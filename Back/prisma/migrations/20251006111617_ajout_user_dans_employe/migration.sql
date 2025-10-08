/*
  Warnings:

  - A unique constraint covering the columns `[employeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `employeId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_employeId_key` ON `User`(`employeId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_employeId_fkey` FOREIGN KEY (`employeId`) REFERENCES `Employe`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
