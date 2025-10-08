import { Router } from "express";
import { EmployeController } from "../controllers/EmployController";

const router = Router();

router.get("/by-user/:userId/qrcode", EmployeController.getQRCodeByUserId);
router.get("/:userId/qrcode", EmployeController.getQRCodeByUserId); // Ajouter cette ligne

router.get("/by-user/:userId", EmployeController.getEmployeIdByUserId);

router.get("/:id/qrcode", EmployeController.getQRCode);
router.post("/:id/regenerate-qrcode", EmployeController.regenerateQRCode);
router.get("/", EmployeController.getAllEmploye)
router.get("/:id", EmployeController.getOneEmploye)
router.post("/", EmployeController.createEmploye)
router.put("/:id", EmployeController.updateEmploye)
router.delete("/:id", EmployeController.deleteEmploye)



export default router





