import { z } from "zod";

export const PayslipSchema = z.object({
    jourTravaille: z.number(),
    montant: z.number(), 
    totalPaye: z.number(), 
    montantRestant: z.number(),
    statut: z.enum(["EN_ATTENTE", "PARTIEL","PAYE"]),
    entrepriseId: z.preprocess((val) => Number(val), z.number().int().positive()),
    payrunId: z.preprocess((val) => Number(val), z.number().int().positive()),


});


export const updatePayslipSchema =PayslipSchema; 

