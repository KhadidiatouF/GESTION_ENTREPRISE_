import { PrismaClient, StatutPointage } from "@prisma/client";
import QRCode from "qrcode";
import crypto from "crypto";

const prisma = new PrismaClient();

export class PointageService {

  /**
   * Génère un code QR unique pour un employé
   */
  async genererQRCode(employeId: number): Promise<string> {
    const employe = await prisma.employe.findUnique({
      where: { id: employeId }
    });

    if (!employe) {
      throw new Error("Employé non trouvé");
    }

    // Générer un code unique sécurisé
    const qrCodeData = crypto.randomBytes(32).toString('hex');
    
    // Mettre à jour l'employé avec son code QR
    await prisma.employe.update({
      where: { id: employeId },
      data: { qrCode: qrCodeData }
    });

    // Générer l'image QR code en base64
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2
    });

    return qrCodeImage;
  }

  /**
   * Génère les QR codes pour tous les employés actifs d'une entreprise
   */
  async genererQRCodesPourEntreprise(entrepriseId: number) {
    const employes = await prisma.employe.findMany({
      where: {
        entrepriseId,
        estActif: true,
        qrCode: null
      }
    });

    const results = [];

    for (const employe of employes) {
      try {
        const qrCode = await this.genererQRCode(employe.id);
        results.push({
          employeId: employe.id,
          nom: `${employe.prenom} ${employe.nom}`,
          qrCode,
          success: true
        });
      } catch (error: any) {
        results.push({
          employeId: employe.id,
          nom: `${employe.prenom} ${employe.nom}`,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Enregistre un pointage via scan de QR code
   */
  async enregistrerPointage(
    qrCode: string, 
    scanneParId: number
  ): Promise<any> {
    // Trouver l'employé par son QR code
    const employe = await prisma.employe.findUnique({
      where: { qrCode },
      include: { entreprise: true }
    });

    if (!employe) {
      throw new Error("QR Code invalide");
    }

    if (!employe.estActif) {
      throw new Error("Cet employé n'est plus actif");
    }

    const maintenant = new Date();
    const dateAujourdhui = new Date(maintenant);
    dateAujourdhui.setHours(0, 0, 0, 0);

    // Vérifier si un pointage existe déjà pour aujourd'hui
    const pointageExistant = await prisma.pointage.findFirst({
      where: {
        employeId: employe.id,
        date: {
          gte: dateAujourdhui,
          lt: new Date(dateAujourdhui.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (pointageExistant) {
      throw new Error("Pointage déjà enregistré pour aujourd'hui");
    }

    // Déterminer le statut en fonction de l'heure
    const heures = maintenant.getHours();
    const minutes = maintenant.getMinutes();
    const totalMinutes = heures * 60 + minutes;
    const heureLimit = 8 * 60 + 30; // 8h30 en minutes

    let statut: StatutPointage;
    if (totalMinutes <= heureLimit) {
      statut = StatutPointage.PRESENT;
    } else {
      statut = StatutPointage.RETARD;
    }

    // Créer le pointage
    const pointage = await prisma.pointage.create({
      data: {
        employeId: employe.id,
        date: dateAujourdhui,
        heureArrivee: maintenant,
        statut,
        scanneParId
      },
      include: {
        employe: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            matricule: true,
            fonction: true
          }
        }
      }
    });

    return pointage;
  }

  /**
   * Marque les employés absents (à exécuter automatiquement après 16h)
   */
  async marquerAbsents(entrepriseId: number, date?: Date): Promise<number> {
    const datePointage = date || new Date();
    datePointage.setHours(0, 0, 0, 0);

    // Récupérer tous les employés actifs
    const employes = await prisma.employe.findMany({
      where: {
        entrepriseId,
        estActif: true
      }
    });

    // Récupérer les pointages existants pour cette date
    const pointagesExistants = await prisma.pointage.findMany({
      where: {
        date: {
          gte: datePointage,
          lt: new Date(datePointage.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      select: { employeId: true }
    });

    const employesPointes = new Set(pointagesExistants.map(p => p.employeId));

    // Créer des pointages "ABSENT" pour ceux qui n'ont pas pointé
    const absents = employes.filter(e => !employesPointes.has(e.id));

    const pointagesAbsents = await prisma.pointage.createMany({
      data: absents.map(employe => ({
        employeId: employe.id,
        date: datePointage,
        statut: StatutPointage.ABSENT,
        note: "Marqué automatiquement comme absent",
        heureArrivee: datePointage // ou new Date("1970-01-01T00:00:00Z")
      })),
      skipDuplicates: true
    });

    return pointagesAbsents.count;
  }

  /**
   * Récupère les pointages d'un employé
   */
  async getPointagesEmploye(
    employeId: number,
    dateDebut?: Date,
    dateFin?: Date
  ) {
    const whereClause: any = { employeId };

    if (dateDebut || dateFin) {
      whereClause.date = {};
      if (dateDebut) whereClause.date.gte = dateDebut;
      if (dateFin) whereClause.date.lte = dateFin;
    }

    return await prisma.pointage.findMany({
      where: whereClause,
      include: {
        employe: {
          select: {
            prenom: true,
            nom: true,
            matricule: true
          }
        },
        scannePar: {
          select: {
            prenom: true,
            nom: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  /**
   * Récupère les pointages d'une entreprise avec filtres
   */
  async getPointagesEntreprise(
    entrepriseId: number,
    filters: {
      dateDebut?: Date;
      dateFin?: Date;
      statut?: StatutPointage;
      employeId?: number;
    }
  ) {
    const whereClause: any = {
      employe: { entrepriseId }
    };

    if (filters.dateDebut || filters.dateFin) {
      whereClause.date = {};
      if (filters.dateDebut) whereClause.date.gte = filters.dateDebut;
      if (filters.dateFin) whereClause.date.lte = filters.dateFin;
    }

    if (filters.statut) {
      whereClause.statut = filters.statut;
    }

    if (filters.employeId) {
      whereClause.employeId = filters.employeId;
    }

    return await prisma.pointage.findMany({
      where: whereClause,
      include: {
        employe: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            matricule: true,
            fonction: true
          }
        },
        scannePar: {
          select: {
            prenom: true,
            nom: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { heureArrivee: 'asc' }
      ]
    });
  }

  /**
   * Obtient les statistiques de présence
   */
  async getStatistiquesPresence(
    entrepriseId: number,
    dateDebut?: Date,
    dateFin?: Date
  ) {
    const whereClause: any = {
      employe: { entrepriseId }
    };

    if (dateDebut || dateFin) {
      whereClause.date = {};
      if (dateDebut) whereClause.date.gte = dateDebut;
      if (dateFin) whereClause.date.lte = dateFin;
    }

    const pointages = await prisma.pointage.findMany({
      where: whereClause,
      include: {
        employe: true
      }
    });

    const stats = {
      total: pointages.length,
      presents: pointages.filter(p => p.statut === StatutPointage.PRESENT).length,
      retards: pointages.filter(p => p.statut === StatutPointage.RETARD).length,
      absents: pointages.filter(p => p.statut === StatutPointage.ABSENT).length,
      tauxPresence: 0,
      tauxRetard: 0,
      tauxAbsence: 0
    };

    if (stats.total > 0) {
      stats.tauxPresence = ((stats.presents / stats.total) * 100);
      stats.tauxRetard = ((stats.retards / stats.total) * 100);
      stats.tauxAbsence = ((stats.absents / stats.total) * 100);
    }

    // Statistiques par employé
    const parEmploye: any = {};
    pointages.forEach(p => {
      const key = p.employeId;
      if (!parEmploye[key]) {
        parEmploye[key] = {
          employe: {
            id: p.employe.id,
            nom: `${p.employe.prenom} ${p.employe.nom}`,
            matricule: p.employe.matricule
          },
          total: 0,
          presents: 0,
          retards: 0,
          absents: 0
        };
      }
      parEmploye[key].total++;
      if (p.statut === StatutPointage.PRESENT) parEmploye[key].presents++;
      if (p.statut === StatutPointage.RETARD) parEmploye[key].retards++;
      if (p.statut === StatutPointage.ABSENT) parEmploye[key].absents++;
    });

    return {
      global: stats,
      parEmploye: Object.values(parEmploye)
    };
  }

  /**
   * Obtient le pointage du jour pour un employé
   */
  async getPointageDuJour(employeId: number) {
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    return await prisma.pointage.findFirst({
      where: {
        employeId,
        date: {
          gte: aujourdhui,
          lt: new Date(aujourdhui.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: {
        employe: {
          select: {
            prenom: true,
            nom: true,
            matricule: true
          }
        }
      }
    });
  }
}