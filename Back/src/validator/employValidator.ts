import {z} from "zod";


// export const EmployeSchema = z.object({ 
//     prenom: z.string().min(2, "Prénom trop court"),
//     nom: z.string().min(2, "Nom trop court"),
//     fonction: z.string().optional(),
//     matricule: z.string().optional(),
//     estActif: z.boolean().default(true),
//     entrepriseId: z.number().int().positive(),
//     typeContrat: z.enum(["MENSUELLE", "HEBDOMADAIRE", "JOURNALIER"]) 
// });

// export const updateEmploySchema = EmployeSchema; 


export const EmployeSchema = z.object({ 
  prenom: z.string().min(2, "Prénom trop court"),
  nom: z.string().min(2, "Nom trop court"),
  fonction: z.string().optional(),
  matricule: z.string().optional(),
  estActif: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(true)),
  entrepriseId: z.preprocess((val) => Number(val), z.number().int().positive()),
  typeContrat: z.enum(["MENSUELLE", "HEBDOMADAIRE", "JOURNALIER"]) 
});
export const updateEmploySchema = EmployeSchema; 
