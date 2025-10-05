import express from "express";
import { scanEmployee, getScansByDate } from "../controllers/PointageController";

const router = express.Router();

router.post("/vigile/scan", scanEmployee);
router.get("/vigile/scans", getScansByDate);

export default router;
