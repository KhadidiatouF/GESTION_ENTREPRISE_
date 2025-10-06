import { Request, Response } from 'express';
import { FormaterResponse } from '../middlewares/FormateReponse';
import { HttpCode } from '../enums/codeError';
import { PrismaClient, StatutPointage } from '@prisma/client';

const prisma = new PrismaClient();

export class PointageController {
  
  static async marquerPresence(req: Request, res: Response) {
    try {
      const { matricule } = req.body;
      
      if (!matricule) {
        return FormaterResponse.failed(
          res,
          'Matricule requis',
          HttpCode.BAD_REQUEST
        );
      }

      const employe = await prisma.employe.findUnique({
        where: { matricule },
        include: { entreprise: true }
      });

      if (!employe) {
        return FormaterResponse.failed(
          res,
          'Employé non trouvé',
          HttpCode.NOT_FOUND
        );
      }

      if (!employe.estActif) {
        return FormaterResponse.failed(
          res,
          'Cet employé n\'est plus actif',
          HttpCode.FORBIDDEN
        );
      }

      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);
      const demain = new Date(aujourdhui);
      demain.setDate(demain.getDate() + 1);

      const pointageExistant = await prisma.pointage.findFirst({
        where: {
          employeId: employe.id,
          date: {
            gte: aujourdhui,
            lt: demain
          }
        },
        include: {
          employe: {
            include: {
              entreprise: true
            }
          }
        }
      });

      if (pointageExistant) {
        return FormaterResponse.failed(
          res,
          'Vous avez déjà pointé aujourd\'hui',
          HttpCode.CONFLICT,
        );
      }

      const heureActuelle = new Date();
      const heures = heureActuelle.getHours();
      const minutes = heureActuelle.getMinutes();
      const heureEnMinutes = heures * 60 + minutes;

      let statut: StatutPointage;
      let messageStatut: string;

      const HEURE_DEBUT_TRAVAIL = 360;   
      const HEURE_LIMITE_PRESENT = 510;  
      const HEURE_LIMITE_RETARD = 780;    

      if (heureEnMinutes < HEURE_DEBUT_TRAVAIL || heureEnMinutes >= HEURE_LIMITE_RETARD) {
        statut = StatutPointage.ABSENT;
        messageStatut = `${employe.prenom} ${employe.nom}, pointage hors des heures de travail. Marqué(e) absent(e).`;
      }
      else if (heureEnMinutes >= HEURE_DEBUT_TRAVAIL && heureEnMinutes < HEURE_LIMITE_PRESENT) {
        statut = StatutPointage.PRESENT;
        messageStatut = `Bienvenue ${employe.prenom} ${employe.nom} ! Vous êtes à l'heure.`;
      } 
      else {
        statut = StatutPointage.RETARD;
        messageStatut = `${employe.prenom} ${employe.nom}, vous êtes en retard.`;
      }

      const pointage = await prisma.pointage.create({
        data: {
          employeId: employe.id,
          date: new Date(),
          heureArrivee: new Date(),
          statut: statut
        },
        include: {
          employe: {
            include: {
              entreprise: true
            }
          }
        }
      });

      return FormaterResponse.success(
        res,
        pointage,
        messageStatut,
        HttpCode.CREATED
      );
    } catch (error: any) {
      console.error('Erreur lors du pointage:', error);
      return FormaterResponse.failed(
        res,
        error.message || 'Erreur serveur',
        HttpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getPointagesEmploye(req: Request, res: Response) {
    try {
      const { employeId } = req.params;
      const { mois, annee } = req.query;

      let dateFilter: any = {};

      if (mois && annee) {
        const debut = new Date(Number(annee), Number(mois) - 1, 1);
        const fin = new Date(Number(annee), Number(mois), 0, 23, 59, 59);
        dateFilter = {
          date: {
            gte: debut,
            lte: fin
          }
        };
      }

      const pointages = await prisma.pointage.findMany({
        where: {
          employeId: Number(employeId),
          ...dateFilter
        },
        include: {
          employe: true
        },
        orderBy: {
          date: 'desc'
        }
      });

      return FormaterResponse.success(
        res,
        pointages,
        'Pointages récupérés avec succès',
        HttpCode.OK
      );
    } catch (error: any) {
      console.error('Erreur:', error);
      return FormaterResponse.failed(
        res,
        error.message || 'Erreur serveur',
        HttpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getPointage(req: Request, res: Response) {
    try {
      const { date } = req.query;

      let dateDebut: Date;
      let dateFin: Date;

      if (date) {
        dateDebut = new Date(date as string);
        dateDebut.setHours(0, 0, 0, 0);
        dateFin = new Date(date as string);
        dateFin.setHours(23, 59, 59, 999);
      } else {
        dateDebut = new Date();
        dateDebut.setHours(0, 0, 0, 0);
        dateFin = new Date();
        dateFin.setHours(23, 59, 59, 999);
      }

      const pointages = await prisma.pointage.findMany({
        where: {
          date: {
            gte: dateDebut,
            lte: dateFin
          }
        },
        include: {
          employe: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              matricule: true,
              entreprise: {
                select: {
                  nom: true
                }
              }
            }
          }
        },
        orderBy: {
          heureArrivee: 'desc'
        }
      });

      const stats = {
        total: pointages.length,
        presents: pointages.filter(p => p.statut === StatutPointage.PRESENT).length,
        retards: pointages.filter(p => p.statut === StatutPointage.RETARD).length,
        absents: pointages.filter(p => p.statut === StatutPointage.ABSENT).length
      };

      return FormaterResponse.success(
        res,
        {
          pointages,
          stats,
          date: dateDebut.toISOString().split('T')[0]
        },
        'Pointages récupérés avec succès',
        HttpCode.OK
      );
    } catch (error: any) {
      console.error('Erreur lors de la récupération des pointages:', error);
      return FormaterResponse.failed(
        res,
        error.message || 'Erreur serveur',
        HttpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async getPointagesAvecFiltres(req: Request, res: Response) {
    try {
      const { 
        dateDebut, 
        dateFin, 
        statut, 
        entrepriseId,
        page = '1',
        limit = '50'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      
      let whereClause: any = {};

      if (dateDebut && dateFin) {
        whereClause.date = {
          gte: new Date(dateDebut as string),
          lte: new Date(dateFin as string)
        };
      }

      if (statut) {
        whereClause.statut = statut as StatutPointage;
      }

      if (entrepriseId) {
        whereClause.employe = {
          entrepriseId: Number(entrepriseId)
        };
      }

      const [pointages, total] = await Promise.all([
        prisma.pointage.findMany({
          where: whereClause,
          include: {
            employe: {
              include: {
                entreprise: true
              }
            }
          },
          orderBy: {
            heureArrivee: 'desc'
          },
          skip,
          take: Number(limit)
        }),
        prisma.pointage.count({ where: whereClause })
      ]);

      return FormaterResponse.success(
        res,
        {
          pointages,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
          }
        },
        'Pointages récupérés avec succès',
        HttpCode.OK
      );
    } catch (error: any) {
      console.error('Erreur:', error);
      return FormaterResponse.failed(
        res,
        error.message || 'Erreur serveur',
        HttpCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}