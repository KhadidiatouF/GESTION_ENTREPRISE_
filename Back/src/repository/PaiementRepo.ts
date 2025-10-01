import { Paiement, PrismaClient, StatutPayslip } from "@prisma/client";
import { IRepository } from "./IRepository";

export class PaiementRepo implements IRepository<Paiement> {
    private prisma: PrismaClient = new PrismaClient();
    
    
    async findAll(): Promise<Paiement[]> {
        return await this.prisma.paiement.findMany({
            include: {
                payslip: {
                    include: {
                        employe: true,
                        payrun: true
                    }
                },
                caisse: true
            },
            orderBy: { date: 'desc' }
        });
    }

    async findById(id: number): Promise<any> {
        return await this.prisma.paiement.findUnique({
            where: { id },
            include: {
                payslip: {
                    include: {
                        employe: true,
                        payrun: true
                    }
                },
                caisse: true
            }
        });
    }

    async create(data: Omit<Paiement, "id">): Promise<Paiement> {
        return await this.prisma.paiement.create({
            data,
            include: {
                payslip: {
                    include: {
                        employe: true,
                        payrun: true
                    }
                },
                caisse: true
            }
        });
    }

    async update(id: number, data: Paiement): Promise<Paiement> {
        return await this.prisma.paiement.update({
            where: { id },
            data,
            include: {
                payslip: true,
                caisse: true
            }
        });
    }

    async delete(id: number): Promise<void> {
        await this.prisma.paiement.delete({ where: { id } });
    }

 
    async findPayslipsByCaisse(entrepriseId: number): Promise<any[]> {
        return await this.prisma.payslip.findMany({
            where: {
                payrun: {
                    entreprise: {
                         id: entrepriseId          
                    }
                }
            },
            include: {
                employe: {
                    select: {
                        id: true,
                        matricule: true,
                        nom: true,
                        prenom: true,
                        fonction: true
                    }
                },
                payrun: {
                    select: {
                        id: true,
                        dateDebut: true,
                        dateFin: true
                    }
                },
                paiements: {
                    select: {
                        id: true,
                        montant: true,
                        date: true,
                        methode: true
                    }
                }
            },
            orderBy: {
                payrun: {
                    dateFin: 'desc'
                }
            }
        });
    }

   
    async findPayslipsForStats(entrepriseId: number, mois?: string): Promise<any[]> {
        const whereClause: any = {
            payrun: {
                entreprise: {
                   id: entrepriseId          
                      }
            }
        };

        if (mois) {
            const [year, month] = mois.split('-');
            const startDate = new Date(`${year}-${month}-01`);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);

            whereClause.payrun.dateFin = {
                gte: startDate,
                lt: endDate
            };
        }

        return await this.prisma.payslip.findMany({
            where: whereClause,
            include: {
                paiements: {
                    select: {
                        montant: true
                    }
                }
            }
        });
    }

    /**
     * Récupérer l'historique des paiements avec filtres
     */
    async findHistoriqueWithFilters(filters: any): Promise<Paiement[]> {
        const whereClause: any = {};

        if (filters.caisseId) {
            whereClause.caisseId = Number(filters.caisseId);
        }

        if (filters.employeId) {
            whereClause.payslip = {
                employeId: Number(filters.employeId)
            };
        }

        if (filters.dateDebut && filters.dateFin) {
            whereClause.date = {
                gte: new Date(filters.dateDebut),
                lte: new Date(filters.dateFin)
            };
        }

        if (filters.methode) {
            whereClause.methode = filters.methode;
        }

        return await this.prisma.paiement.findMany({
            where: whereClause,
            include: {
                payslip: {
                    include: {
                        employe: true,
                        payrun: true
                    }
                },
                caisse: true
            },
            orderBy: { date: 'desc' }
        });
    }

  
    async updatePayslipStatus(payslipId: number, statut: StatutPayslip): Promise<any> {
        return await this.prisma.payslip.update({
            where: { id: payslipId },
            data: { statut }
        });
    }

 
    async findPayslipWithPaiements(payslipId: number): Promise<any> {
        return await this.prisma.payslip.findUnique({
            where: { id: payslipId },
            include: {
                paiements: true
            }
        });
    }
}
