import { z } from "zod";

export const PointageSchema = z.object({
  employeId: z.number().int().positive(),
  scanneParId: z.number().int().positive().optional().nullable(),
  heureArrivee: z.string().datetime().optional()
});