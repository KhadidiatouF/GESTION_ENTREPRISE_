import { PrismaClient, ContratType, StatutPayslip } from "@prisma/client";
import { PointageService } from "./PointageService";

const prisma = new PrismaClient();
const pointageService = new PointageService();

export class PayrunService {

  async getAllPayruns(entrepriseId: number) {
    return await prisma.payrun.findMany({
      where: { entrepriseId },
      include: {
        entreprise: true,
        payslips: {
          include: {
            employe: true,
            paiements: true
          }
        }
      },
      orderBy: {
        dateDebut: 'desc'
      }
    });
  }

  async getOnePayrun(id: number) {
    return await prisma.payrun.findUnique({
      where: { id },
      include: {
        entreprise: true,
        payslips: {
          include: {
            employe: true,
            paiements: {
              include: {
                caisse: true
              }
            }
          }
        }
      }
    });
  }

  async createPayrun(data: any) {
    const { dateDebut, dateFin, salaire, typeContrat, entrepriseId } = data;

    const employes = await prisma.employe.findMany({
      where: {
        entrepriseId,
        typeContrat,
        estActif: true
      }
    });

    if (employes.length === 0) {
      throw new Error(`Aucun employé actif avec le contrat ${typeContrat}`);
    }

    return await prisma.$transaction(async (tx) => {
      const payrun = await tx.payrun.create({
        data: {
          dateDebut: new Date(dateDebut),
          dateFin: new Date(dateFin),
          salaire,
          typeContrat,
          entrepriseId
        }
      });

      const payslipsData = await Promise.all(
        employes.map(async (employe) => {
          let jourTravaille = 0;
          let montant = Number(salaire);

          if (typeContrat === ContratType.JOURNALIER) {
            jourTravaille = await pointageService.getJoursPresents(
              employe.id,
              new Date(dateDebut),
              new Date(dateFin)
            );
            montant = jourTravaille * Number(salaire);
          } else if (typeContrat === ContratType.HEBDOMADAIRE) {
            const diffTime = Math.abs(new Date(dateFin).getTime() - new Date(dateDebut).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            jourTravaille = Math.ceil(diffDays / 7);
          } else if (typeContrat === ContratType.MENSUELLE) {
            jourTravaille = 1;
          }

          return {
            employeId: employe.id,
            payrunId: payrun.id,
            jourTravaille,
            montant,
            totalPaye: 0,
            montantRestant: montant,
            statut: StatutPayslip.EN_ATTENTE
          };
        })
      );

      await tx.payslip.createMany({
        data: payslipsData
      });

      return await tx.payrun.findUnique({
        where: { id: payrun.id },
        include: {
          payslips: {
            include: {
              employe: true
            }
          }
        }
      });
    });
  }

  async updatePayrun(id: number, data: any) {
    const { dateDebut, dateFin, salaire } = data;

    return await prisma.payrun.update({
      where: { id },
      data: {
        dateDebut: dateDebut ? new Date(dateDebut) : undefined,
        dateFin: dateFin ? new Date(dateFin) : undefined,
        salaire
      }
    });
  }

  async deletePayrun(id: number) {
    return await prisma.$transaction(async (tx) => {
      await tx.payslip.deleteMany({
        where: { payrunId: id }
      });

      return await tx.payrun.delete({
        where: { id }
      });
    });
  }

  async recalculerPayslips(payrunId: number) {
    const payrun = await prisma.payrun.findUnique({
      where: { id: payrunId },
      include: {
        payslips: {
          include: {
            employe: true
          }
        }
      }
    });

    if (!payrun) {
      throw new Error("Payrun non trouvé");
    }

    const updates = await Promise.all(
      payrun.payslips.map(async (payslip) => {
        if (payrun.typeContrat === ContratType.JOURNALIER) {
          const joursPresents = await pointageService.getJoursPresents(
            payslip.employeId,
            payrun.dateDebut,
            payrun.dateFin
          );

          const nouveauMontant = joursPresents * Number(payrun.salaire);
          const nouveauMontantRestant = nouveauMontant - Number(payslip.totalPaye);

          return prisma.payslip.update({
            where: { id: payslip.id },
            data: {
              jourTravaille: joursPresents,
              montant: nouveauMontant,
              montantRestant: nouveauMontantRestant
            }
          });
        }
        return payslip;
      })
    );

    return updates;
  }

  async getStatistiques(entrepriseId: number) {
    const payruns = await prisma.payrun.findMany({
      where: { entrepriseId },
      include: {
        payslips: true
      }
    });

    const stats = {
      totalPayruns: payruns.length,
      totalEmployes: await prisma.employe.count({
        where: { entrepriseId, estActif: true }
      }),
      totalPayslips: await prisma.payslip.count({
        where: {
          payrun: {
            entrepriseId
          }
        }
      }),
      montantTotal: payruns.reduce((sum, pr) => 
        sum + pr.payslips.reduce((s, ps) => s + Number(ps.montant), 0), 0
      ),
      montantPaye: payruns.reduce((sum, pr) => 
        sum + pr.payslips.reduce((s, ps) => s + Number(ps.totalPaye), 0), 0
      )
    };

    return stats;
  }
}