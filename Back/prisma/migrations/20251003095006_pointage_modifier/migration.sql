/*
  Warnings:

  - A unique constraint covering the columns `[employeId,date]` on the table `Pointage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Pointage` ADD COLUMN `scanneParId` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('SUPER_ADMIN', 'ADMIN', 'CASSIER', 'VIGILE', 'EMPLOYE') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Pointage_employeId_date_key` ON `Pointage`(`employeId`, `date`);

-- AddForeignKey
ALTER TABLE `Pointage` ADD CONSTRAINT `Pointage_scanneParId_fkey` FOREIGN KEY (`scanneParId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
