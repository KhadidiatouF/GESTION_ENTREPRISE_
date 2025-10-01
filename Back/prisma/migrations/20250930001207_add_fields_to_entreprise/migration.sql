/*
  Warnings:

  - Made the column `nom` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `prenom` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Entreprise` ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `site` VARCHAR(191) NULL,
    ADD COLUMN `telephone` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `nom` VARCHAR(191) NOT NULL,
    MODIFY `prenom` VARCHAR(191) NOT NULL;
