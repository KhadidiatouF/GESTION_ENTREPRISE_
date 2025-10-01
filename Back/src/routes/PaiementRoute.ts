import { Router } from "express";
import { PaiementController } from "../controllers/PaiementController";

const router = Router();



router.get("/payslips", PaiementController.getPayslipsEntreprise);
router.get("/statistiques", PaiementController.getStatistiques);
router.get("/historique", PaiementController.getHistoriquePaiements);


router.get("/", PaiementController.getAllPaiement)
router.get("/:id", PaiementController.getOnePaiement)
router.post("/", PaiementController.createPaiement)
router.put("/:id", PaiementController.updateEntreprise)
router.delete("/:id", PaiementController.deleteEntreprise)




export default router





