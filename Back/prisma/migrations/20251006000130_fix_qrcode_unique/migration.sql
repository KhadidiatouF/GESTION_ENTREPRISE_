/*
  Warnings:

  - You are about to alter the column `qrCode` on the `Employe` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `Employe` MODIFY `qrCode` VARCHAR(100) NULL;
