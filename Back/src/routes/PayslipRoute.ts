import { Router } from "express";
import { PayslipController } from "../controllers/PayslipController";

const router = Router();

router.get("/", PayslipController.getAllPayslip)
router.get("/:id", PayslipController.getOnePayslip)
router.post("/",PayslipController.createPaylips)
router.put("/:id", PayslipController.updatePayslip)
router.delete("/:id", PayslipController.deletePayslip)

export default router

