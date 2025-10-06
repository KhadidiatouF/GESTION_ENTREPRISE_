import { PrismaClient, StatutPointage } from "@prisma/client";
import { startOfDay, endOfDay, isAfter, isBefore, setHours, setMinutes } from "date-fns";

const prisma = new PrismaClient();

export class PointageService {

  async createPointage(data: any) {
    const { employeId, scanneParId, heureArrivee } = data;

    const employe = await prisma.employe.findUnique({
      where: { id: employeId }
    });

    if (!employe) {
      throw new Error("Employé non trouvé");
    }

    if (!employe.estActif) {
      throw new Error("Cet employé n'est plus actif");
    }

    const datePointage = startOfDay(new Date(heureArrivee));

    const pointageExistant = await prisma.pointage.findUnique({
      where: {
        employeId_date: {
          employeId,
          date: datePointage
        }
      }
    });

    if (pointageExistant) {
      throw new Error("Pointage déjà effectué pour ce jour");
    }

    const heureArriveeDate = new Date(heureArrivee);
    const statut = this.determinerStatut(heureArriveeDate);

    return await prisma.pointage.create({
      data: {
        employeId,
        date: datePointage,
        heureArrivee: heureArriveeDate,
        statut,
        scanneParId
      },
      include: {
        employe: {
          include: {
            entreprise: true
          }
        },
        scannePar: true
      }
    });
  }

  private determinerStatut(heureArrivee: Date): StatutPointage {
    const heureLimitePresent = setMinutes(setHours(heureArrivee, 8), 30);
    const heureLimiteRetard = setHours(heureArrivee, 13);

    if (isBefore(heureArrivee, heureLimitePresent)) {
      return StatutPointage.PRESENT;
    } else if (isBefore(heureArrivee, heureLimiteRetard)) {
      return StatutPointage.RETARD;
    } else {
      return StatutPointage.ABSENT;
    }
  }

  async getPointagesByEmploye(employeId: number, dateDebut?: Date, dateFin?: Date) {
    const whereClause: any = { employeId };

    if (dateDebut && dateFin) {
      whereClause.date = {
        gte: startOfDay(dateDebut),
        lte: endOfDay(dateFin)
      };
    }

    return await prisma.pointage.findMany({
      where: whereClause,
      include: {
        employe: true,
        scannePar: true
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  async getPointagesEntreprise(entrepriseId: number, dateDebut?: Date, dateFin?: Date) {
    const whereClause: any = {
      employe: {
        entrepriseId
      }
    };

    if (dateDebut && dateFin) {
      whereClause.date = {
        gte: startOfDay(dateDebut),
        lte: endOfDay(dateFin)
      };
    }

    return await prisma.pointage.findMany({
      where: whereClause,
      include: {
        employe: {
          include: {
            entreprise: true
          }
        },
        scannePar: true
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  async getJoursPresents(employeId: number, dateDebut: Date, dateFin: Date): Promise<number> {
    const pointages = await prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: startOfDay(dateDebut),
          lte: endOfDay(dateFin)
        },
        statut: StatutPointage.PRESENT
      }
    });

    return pointages.length;
  }

  async getStatistiquesPresence(employeId: number, dateDebut: Date, dateFin: Date) {
    const pointages = await prisma.pointage.findMany({
      where: {
        employeId,
        date: {
          gte: startOfDay(dateDebut),
          lte: endOfDay(dateFin)
        }
      }
    });

    const stats = {
      total: pointages.length,
      presents: pointages.filter(p => p.statut === StatutPointage.PRESENT).length,
      retards: pointages.filter(p => p.statut === StatutPointage.RETARD).length,
      absents: pointages.filter(p => p.statut === StatutPointage.ABSENT).length
    };

    return stats;
  }

  async getPointagesDuJour(entrepriseId: number) {
    const aujourdhui = startOfDay(new Date());

    return await prisma.pointage.findMany({
      where: {
        date: aujourdhui,
        employe: {
          entrepriseId
        }
      },
      include: {
        employe: true,
        scannePar: true
      },
      orderBy: {
        heureArrivee: 'asc'
      }
    });
  }

  async marquerAbsents(entrepriseId: number, date: Date) {
    const datePointage = startOfDay(date);
    const heureActuelle = new Date();

    if (heureActuelle.getHours() < 13) {
      throw new Error("Les absents ne peuvent être marqués qu'après 13h");
    }

    const employes = await prisma.employe.findMany({
      where: {
        entrepriseId,
        estActif: true,
        typeContrat: {
          in: ['JOURNALIER']
        }
      }
    });

    const pointagesExistants = await prisma.pointage.findMany({
      where: {
        date: datePointage,
        employe: {
          entrepriseId
        }
      },
      select: { employeId: true }
    });

    const employesPointes = new Set(pointagesExistants.map(p => p.employeId));
    const employesAbsents = employes.filter(e => !employesPointes.has(e.id));

    const pointagesAbsents = await prisma.pointage.createMany({
      data: employesAbsents.map(e => ({
        employeId: e.id,
        date: datePointage,
        heureArrivee: new Date(),
        statut: StatutPointage.ABSENT,
        scanneParId: null
      })),
      skipDuplicates: true
    });

    return pointagesAbsents;
  }

  async getEmployeInfo(employeId: number) {
    return await prisma.employe.findUnique({
      where: { id: employeId },
      include: {
        entreprise: true
      }
    });
  }
}