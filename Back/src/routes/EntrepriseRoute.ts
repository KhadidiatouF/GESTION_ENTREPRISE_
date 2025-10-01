import { Router } from "express";
import { EntrepriseController } from "../controllers/EntrepriseController";
import { upload } from "../middlewares/upload";

const router = Router();


router.get("/", EntrepriseController.getAllEntreprise)
router.get("/:id", EntrepriseController.getOneEntreprise)
router.post("/",upload.single("logo"), EntrepriseController.createEntreprise)
router.put("/:id", EntrepriseController.updateEntreprise)
router.delete("/:id", EntrepriseController.deleteEntreprise)



export default router

