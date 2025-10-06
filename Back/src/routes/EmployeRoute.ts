import { Router } from "express";
import { EmployeController } from "../controllers/EmployController";

const router = Router();


router.get("/", EmployeController.getAllEmploye)
router.get("/:id", EmployeController.getOneEmploye)
router.post("/", EmployeController.createEmploye)
router.put("/:id", EmployeController.updateEmploye)
router.delete("/:id", EmployeController.deleteEmploye)

router.get("/:id/qrcode", EmployeController.getQRCode);
router.post("/:id/regenerate-qrcode", EmployeController.regenerateQRCode);

export default router





