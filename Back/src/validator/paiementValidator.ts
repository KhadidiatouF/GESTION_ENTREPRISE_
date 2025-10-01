import { z } from "zod";

export const PaiementSchema = z.object({
    date: z.string().min(2, "Le nom doit avoir au moins 2 caractères"),
    montant: z.number().positive("Le montant doit être supérieur à 0").max(99999999.99, "Le montant est trop élevé"),
    methode: z.enum(["ESPECES", "VIREMENT", "CHEQUE", "ORANGE_MONEY", "WAVE", "AUTRE"]), 
    reference: z.string().max(100, "La référence ne peut dépasser 100 caractères").optional(),   
    note: z.string(),
    reçuUrl: z.string()
    .url("URL invalide")
    .max(255, "L'URL est trop longue")
    .optional()
});


export const updatePaiementSchema = PaiementSchema; 
