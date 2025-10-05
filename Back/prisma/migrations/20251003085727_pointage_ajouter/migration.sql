/*
  Warnings:

  - A unique constraint covering the columns `[qrCode]` on the table `Employe` will be added. If there are existing duplicate values, this will fail.
  - Made the column `typeContrat` on table `Payrun` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Employe` ADD COLUMN `qrCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Payrun` MODIFY `typeContrat` ENUM('JOURNALIER', 'MENSUELLE', 'HEBDOMADAIRE') NOT NULL;

-- CreateTable
CREATE TABLE `Pointage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `heureArrivee` DATETIME(3) NOT NULL,
    `statut` ENUM('PRESENT', 'RETARD', 'ABSENT') NOT NULL,

    INDEX `Pointage_employeId_date_idx`(`employeId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Employe_qrCode_key` ON `Employe`(`qrCode`);

-- AddForeignKey
ALTER TABLE `Pointage` ADD CONSTRAINT `Pointage_employeId_fkey` FOREIGN KEY (`employeId`) REFERENCES `Employe`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
