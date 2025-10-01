/*
  Warnings:

  - You are about to drop the column `montantPaye` on the `Payslip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Paiement` ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `reference` VARCHAR(191) NULL,
    ADD COLUMN `reçuUrl` VARCHAR(191) NULL,
    MODIFY `methode` ENUM('ESPECES', 'VIREMENT', 'CHEQUE', 'ORANGE_MONEY', 'WAVE', 'AUTRE') NOT NULL;

-- AlterTable
ALTER TABLE `Payslip` DROP COLUMN `montantPaye`,
    ADD COLUMN `montantRestant` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `statut` ENUM('EN_ATTENTE', 'PARTIEL', 'PAYE') NOT NULL DEFAULT 'EN_ATTENTE',
    ADD COLUMN `totalPaye` DECIMAL(10, 2) NOT NULL DEFAULT 0;
