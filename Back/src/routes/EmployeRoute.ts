import { Router } from "express";
import { EmployController } from "../controllers/EmployController";

const router = Router();


router.get("/", EmployController.getAllEmploys)
router.get("/:id", EmployController.getOneEmploy)
router.post("/", EmployController.createEmploy)
router.put("/:id", EmployController.updateEmploy)
router.delete("/:id", EmployController.deleteEmploy)

export default router





