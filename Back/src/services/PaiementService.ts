import { PrismaClient, StatutPayslip } from "@prisma/client";

const prisma = new PrismaClient();

export class PaiementService {

  async getAllPaiement() {
    return await prisma.paiement.findMany({
      include: {
        caisse: true,
        payslip: {
          include: {
            employe: true,
            payrun: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  async getOnePaiement(id: number) {
    return await prisma.paiement.findUnique({
      where: { id },
      include: {
        caisse: true,
        payslip: {
          include: {
            employe: true,
            payrun: true
          }
        }
      }
    });
  }

  async createPaiement(data: any) {
    const { payslipId, caisseId, montant, methode, reference, note, reçuUrl } = data;

    
    const payslip = await prisma.payslip.findUnique({
      where: { id: payslipId }
    });

    if (!payslip) {
      throw new Error("Bulletin de paie non trouvé");
    }

    if (Number(montant) > Number(payslip.montantRestant)) {
      throw new Error("Le montant du paiement dépasse le montant restant");
    }

    return await prisma.$transaction(async (tx) => {
      const paiement = await tx.paiement.create({
        data: {
          payslipId,
          caisseId,
          montant,
          methode,
          reference,
          note,
          reçuUrl
        }
      });

      
      const nouveauTotalPaye = Number(payslip.totalPaye) + Number(montant);
      const nouveauMontantRestant = Number(payslip.montant) - nouveauTotalPaye;

      let nouveauStatut: StatutPayslip = StatutPayslip.EN_ATTENTE;

      if (nouveauMontantRestant === 0) {
        nouveauStatut = StatutPayslip.PAYE;
      } else if (nouveauTotalPaye > 0) {
        nouveauStatut = StatutPayslip.PARTIEL;
      }

      await tx.payslip.update({
        where: { id: payslipId },
        data: {
          totalPaye: nouveauTotalPaye,
          montantRestant: nouveauMontantRestant,
          statut: nouveauStatut
        }
      });

      return paiement;
    });
  }

  async updatePaiement(id: number, data: any) {
    const { montant, methode, reference, note, reçuUrl } = data;

    return await prisma.paiement.update({
      where: { id },
      data: {
        montant,
        methode,
        reference,
        note,
        reçuUrl
      }
    });
  }

  async deletePaiement(id: number) {
    return await prisma.paiement.delete({
      where: { id }
    });
  }

  async getPayslipsEntreprise(caisseId: number) {
    const caisse = await prisma.user.findUnique({
      where: { id: caisseId },
      select: { entrepriseId: true }
    });

    if (!caisse?.entrepriseId) {
      throw new Error("Entreprise non trouvée pour ce caissier");
    }

    return await prisma.payslip.findMany({
      where: {
        employe: {
          entrepriseId: caisse.entrepriseId
        }
      },
      include: {
        employe: true,
        payrun: true,
        paiements: {
          include: {
            caisse: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
  }

  async getStatistiques(caisseId: number, mois?: string) {
    const caisse = await prisma.user.findUnique({
      where: { id: caisseId },
      select: { entrepriseId: true }
    });

    if (!caisse?.entrepriseId) {
      throw new Error("Entreprise non trouvée");
    }

    let dateFilter = {};
    if (mois) {
      const [year, month] = mois.split('-');
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    // Récupérer les statistiques
    const payslips = await prisma.payslip.findMany({
      where: {
        employe: {
          entrepriseId: caisse.entrepriseId
        }
      },
      include: {
        paiements: {
          where: dateFilter
        }
      }
    });

    const stats = {
      paiementsEnAttente: payslips.filter(p => p.statut === StatutPayslip.EN_ATTENTE).length,
      paiementsEffectues: payslips.filter(p => p.statut === StatutPayslip.PAYE).length,
      paiementsPartiels: payslips.filter(p => p.statut === StatutPayslip.PARTIEL).length,
      montantTotal: payslips.reduce((sum, p) => sum + Number(p.montant), 0),
      montantPayé: payslips.reduce((sum, p) => sum + Number(p.totalPaye), 0)
    };

    return stats;
  }

  async getHistoriquePaiements(filters: any) {
    const { caisseId, dateDebut, dateFin, employeId, methode } = filters;

    const whereClause: any = {};

    if (caisseId) whereClause.caisseId = Number(caisseId);
    if (employeId) whereClause.payslip = { employeId: Number(employeId) };
    if (methode) whereClause.methode = methode;
    
    if (dateDebut && dateFin) {
      whereClause.date = {
        gte: new Date(dateDebut as string),
        lte: new Date(dateFin as string)
      };
    }

    return await prisma.paiement.findMany({
      where: whereClause,
      include: {
        caisse: true,
        payslip: {
          include: {
            employe: true,
            payrun: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  }
}