import {z} from "zod";

export const userSchema = z.object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    login: z.string().min(1,"Le login doit contenir au moins un caractère").max(10, "Le login doit comporter max 10 caractères"),
    password: z.string().min(6,"Le password doit contenir minimum 6 caractere"),
    adresse: z.string().optional(),
    email: z.string().email("Email invalide"),
    estActif: z.boolean().default(true),
    entrepriseId: z.number().int().positive().optional(),
    role: z.enum(["ADMIN", "SUPER_ADMIN", "CASSIER","VIGILE", "EMPLOYE"])

})

export const updateUserSchema = userSchema; 