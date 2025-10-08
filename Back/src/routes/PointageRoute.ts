// routes/pointageRoutes.ts
import { Router } from 'express';
import { PointageController } from '../controllers/PointageController';

const router = Router();

router.post('/marquer-presence', PointageController.marquerPresence);

router.get('/employe/:employeId', PointageController.getPointagesEmploye);

router.get('/aujourd-hui', PointageController.getPointage);

router.get('/filtres', PointageController.getPointagesAvecFiltres);
// Exemple d’une route statistiques
router.get('/employe/:employeId/statistiques', PointageController.getStatistiques);


export default router;