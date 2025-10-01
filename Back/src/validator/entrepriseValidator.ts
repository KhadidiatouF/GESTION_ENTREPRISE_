import { z } from "zod";

export const EntrepriseSchema = z.object({
    nom: z.string().min(2, "Le nom doit avoir au moins 2 caractères"),
    adresse: z.string().optional(), 
    logo: z.string().optional(), 
    email: z.string(),
    site: z.string(),
    telephone: z.string().min(9).max(13)
});


export const updateEntrepriseSchema = EntrepriseSchema; 
