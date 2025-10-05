import { z } from "zod";

export const PayrunSchema = z.object({
  dateDebut: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date de début invalide"
  }),
  dateFin: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Date de fin invalide"
  }),
  salaire: z.number().positive("Le salaire doit être positif"),
  typeContrat: z.enum(["JOURNALIER", "MENSUELLE", "HEBDOMADAIRE"]),
  joursTravailles: z.number().int().positive().optional(),
  entrepriseId: z.number().int().positive("ID entreprise requis")
}).refine(
  (data) => {
    if (data.typeContrat === "JOURNALIER") {
      return data.joursTravailles !== undefined && data.joursTravailles > 0;
    }
    return true;
  },
  {
    message: "Le nombre de jours travaillés est requis pour un contrat journalier",
    path: ["joursTravailles"]
  }
);