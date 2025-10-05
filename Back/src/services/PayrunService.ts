import { PrismaClient, ContratType, StatutPayslip } from "@prisma/client";

const prisma = new PrismaClient();

export class PayrunService {
  
  async getAllPayrun() {
    return await prisma.payrun.findMany({
      include: {
        entreprise: true,
        payslips: {
          include: {
            employe: true
          }
        }
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
            paiements: true
          }
        }
      }
    });
  }

  async createPayrun(data: any) {
    const { dateDebut, dateFin, salaire, typeContrat, joursTravailles, entrepriseId } = data;

    // Créer le payrun
    const payrun = await prisma.payrun.create({
      data: {
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        salaire,
        typeContrat,
        joursTravailles: typeContrat === ContratType.JOURNALIER ? joursTravailles : null,
        entrepriseId
      }
    });

    // Générer automatiquement les payslips pour les employés concernés
    await this.genererPayslips(payrun.id, entrepriseId, typeContrat, salaire, joursTravailles);

    return await this.getOnePayrun(payrun.id);
  }

  private async genererPayslips(
    payrunId: number,
    entrepriseId: number,
    typeContrat: ContratType,
    salaire: number,
    joursTravailles?: number
  ) {
    // Récupérer les employés actifs avec le même type de contrat
    const employes = await prisma.employe.findMany({
      where: {
        entrepriseId,
        typeContrat,
        estActif: true
      }
    });

    // Créer un payslip pour chaque employé
    const payslipsData = employes.map(employe => {
      let montant = Number(salaire);
      let jours = joursTravailles || 0;

      // Calcul du montant selon le type de contrat
      if (typeContrat === ContratType.JOURNALIER && joursTravailles) {
        montant = Number(salaire) * joursTravailles;
        jours = joursTravailles;
      }

      return {
        employeId: employe.id,
        payrunId,
        jourTravaille: jours,
        montant,
        totalPaye: 0,
        montantRestant: montant,
        statut: StatutPayslip.EN_ATTENTE
      };
    });

    // Créer tous les payslips en une seule transaction
    if (payslipsData.length > 0) {
      await prisma.payslip.createMany({
        data: payslipsData
      });
    }

    return payslipsData.length;
  }

    async updatePayrun(id: number, data: any) {
    const { dateDebut, dateFin, salaire, typeContrat, joursTravailles } = data;

    return await prisma.payrun.update({
        where: { id },
        data: {
        ...(dateDebut ? { dateDebut: new Date(dateDebut) } : {}),
        ...(dateFin ? { dateFin: new Date(dateFin) } : {}),
        ...(salaire !== undefined ? { salaire } : {}),
        ...(typeContrat !== undefined ? { typeContrat } : {}),
        ...(typeContrat === ContratType.JOURNALIER 
            ? { joursTravailles } 
            : { joursTravailles: null }),
        }
    });
    }


  async deletePayrun(id: number) {
    // Supprimer d'abord les payslips associés
    await prisma.payslip.deleteMany({
      where: { payrunId: id }
    });

    return await prisma.payrun.delete({
      where: { id }
    });
  }

  async getPayslipsByPayrun(payrunId: number) {
    return await prisma.payslip.findMany({
      where: { payrunId },
      include: {
        employe: true,
        paiements: true
      }
    });
  }

  async genererBulletinsManuel(payrunId: number) {
  // Vérifier si le payrun existe
  const payrun = await prisma.payrun.findUnique({
    where: { id: payrunId }
  });
  
  if (!payrun) {
    throw { status: 404, message: "Cycle de paie non trouvé" };
  }
  
  // Vérifier s'il y a déjà des bulletins
  const existingPayslips = await prisma.payslip.count({
    where: { payrunId }
  });
  
  if (existingPayslips > 0) {
    throw { status: 400, message: "Les bulletins ont déjà été générés pour ce cycle" };
  }
  
  // Générer les payslips
  return await this.genererPayslips(
    payrun.id,
    payrun.entrepriseId,
    payrun.typeContrat,
    Number(payrun.salaire),
    payrun.joursTravailles || undefined
  );
}
}