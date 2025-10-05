import { Router } from "express";
import { PayrunController } from "../controllers/PayrunController";

const router = Router();


router.get("/", PayrunController.getAllPayrun)
router.get("/:id", PayrunController.getOnePayrun)
router.post("/",PayrunController.createPayrun)
router.put("/:id", PayrunController.updatePayrun)
router.delete("/:id", PayrunController.deletePayrun)

router.post("/:id/generer-bulletins", PayrunController.genererBulletins)



export default router

