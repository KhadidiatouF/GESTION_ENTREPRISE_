import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 🟢 Route POST /pointage/vigile/scan
 * Permet au vigile de scanner le QR d’un employé
 */
export const scanEmployee = async (req: Request, res: Response) => {
  try {
    const { employeId, scanneParId } = req.body;

    if (!employeId || !scanneParId) {
      return res.status(400).json({ message: "employeId et scanneParId sont requis" });
    }

    const now = new Date();
    const heure = now.getHours();
    const minute = now.getMinutes();

    let statut: "PRESENT" | "RETARD" = "PRESENT";

    if (heure > 8 || (heure === 8 && minute > 30)) {
      statut = "RETARD";
    }

    // 🔍 Vérifie si un pointage existe déjà pour aujourd’hui
    const existingPointage = await prisma.pointage.findFirst({
      where: {
        employeId: Number(employeId),
        date: {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lte: new Date(now.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existingPointage) {
      return res.status(400).json({ message: "L’employé a déjà été scanné aujourd’hui." });
    }

    // ✅ Crée le pointage
    const pointage = await prisma.pointage.create({
      data: {
        employeId: Number(employeId),
        heureArrivee: new Date(),
        statut,
        scanneParId: Number(scanneParId),
      },
      include: { employe: true, scannePar: true },
    });

    return res.status(201).json({
      message: "Pointage enregistré avec succès.",
      pointage,
    });
  } catch (error: any) {
    console.error("Erreur scanEmployee:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * 🟣 Route GET /pointage/vigile/scans?date=YYYY-MM-DD
 * Liste tous les scans d’un jour donné
 */
export const getScansByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Le paramètre 'date' est requis." });
    }

    const dateDebut = new Date(`${date}T00:00:00.000Z`);
    const dateFin = new Date(`${date}T23:59:59.999Z`);

    const scans = await prisma.pointage.findMany({
      where: {
        date: {
          gte: dateDebut,
          lte: dateFin,
        },
      },
      include: {
        employe: true,
        scannePar: true,
      },
      orderBy: { heureArrivee: "asc" },
    });

    return res.status(200).json(scans);
  } catch (error: any) {
    console.error("Erreur getScansByDate:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
