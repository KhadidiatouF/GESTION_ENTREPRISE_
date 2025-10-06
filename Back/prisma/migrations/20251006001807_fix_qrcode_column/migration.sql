-- DropIndex
DROP INDEX `Employe_qrCode_key` ON `Employe`;

-- AlterTable
ALTER TABLE `Employe` MODIFY `qrCode` TEXT NULL;
