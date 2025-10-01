// ==================== PAIEMENT SERVICE ====================
import { PaiementRepo } from "../repository/PaiementRepo";
import { StatutPayslip } from "@prisma/client";

export class PaiementService {
    private paiementRepo: PaiementRepo;

    constructor() {
        this.paiementRepo = new PaiementRepo();
    }


    getAllPaiement() {
        return this.paiementRepo.findAll();
    }

    getOnePaiement(id: number) {
        return this.paiementRepo.findById(id);
    }

    async createPaiement(data: any) {
        const paiement = await this.paiementRepo.create(data);

        const payslip = await this.paiementRepo.findPayslipWithPaiements(data.payslipId);

        if (payslip) {
            const totalPaye = payslip.paiements.reduce((sum: number, p: any) => sum + p.montant, 0);
            const montantRestant = payslip.montant - totalPaye;

            const nouveauStatut = this.determinerStatut(payslip.montant, totalPaye);

            await this.paiementRepo.updatePayslipStatus(data.payslipId, nouveauStatut);
        }

        return paiement;
    }

    updatePaiement(id: number, data: any) {
        return this.paiementRepo.update(id, data);
    }

    deletePaiement(id: number) {
        return this.paiementRepo.delete(id);
    }

  
    async getPayslipsEntreprise(caisseId: number) {
        const payslips = await this.paiementRepo.findPayslipsByCaisse(caisseId);

        return payslips.map(payslip => {
            const totalPaye = payslip.paiements?.reduce((sum: number, p: any) => sum + p.montant, 0) || 0;
            const montantRestant = payslip.montant - totalPaye;
            const statut = this.determinerStatut(payslip.montant, totalPaye);

            return {
                ...payslip,
                totalPaye,
                montantRestant,
                statut
            };
        });
    }


    async getStatistiques(caisseId: number, mois?: string) {
        const payslips = await this.paiementRepo.findPayslipsForStats(caisseId, mois);

        let paiementsEnAttente = 0;
        let paiementsEffectues = 0;
        let paiementsPartiels = 0;
        let montantTotal = 0;
        let montantPayé = 0;

        payslips.forEach(payslip => {
            const totalPaye = payslip.paiements?.reduce((sum: number, p: any) => sum + p.montant, 0) || 0;
            const statut = this.determinerStatut(payslip.montant, totalPaye);

            montantTotal += payslip.montant;
            montantPayé += totalPaye;

            if (statut === StatutPayslip.PAYE) {
                paiementsEffectues++;
            } else if (statut === StatutPayslip.PARTIEL) {
                paiementsPartiels++;
            } else {
                paiementsEnAttente++;
            }
        });

        return {
            paiementsEnAttente,
            paiementsEffectues,
            paiementsPartiels,
            montantTotal,
            montantPayé
        };
    }

 
    async getHistoriquePaiements(filters: any) {
        return await this.paiementRepo.findHistoriqueWithFilters(filters);
    }

    private determinerStatut(montantTotal: number, montantPaye: number): StatutPayslip {
        if (montantPaye === 0) {
            return StatutPayslip.EN_ATTENTE;
        }
        if (montantPaye >= montantTotal) {
            return StatutPayslip.PAYE;
        }
        return StatutPayslip.PARTIEL;
    }
}