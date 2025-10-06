import { NextFunction, Response, Request } from "express";
import { FormaterResponse } from "../middlewares/FormateReponse";
import { HttpCode } from "../enums/codeError";
import { ZodError } from "zod";
import { PayrunService } from "../services/PayrunService";
import { PayrunSchema } from "../validator/PayrunValidator";

const payrunService = new PayrunService();

export class PayrunController {

static async getAllPayrun(req: Request, res: Response, next: NextFunction) {
  try {
    const entrepriseId = Number(req.query.entrepriseId);

    // ✅ Vérifie la présence et la validité
    if (!entrepriseId || isNaN(entrepriseId)) {
      return FormaterResponse.failed(
        res,
        "Le paramètre entrepriseId est manquant ou invalide",
        HttpCode.BAD_REQUEST
      );
    }

    const payruns = await payrunService.getAllPayruns(entrepriseId);

    if (payruns && payruns.length > 0) {
      FormaterResponse.success(res, payruns, "Payruns récupérés avec succès", HttpCode.OK);
    } else {
      FormaterResponse.failed(res, "Aucun payrun trouvé pour cette entreprise", HttpCode.NOT_FOUND);
    }
  } catch (error) {
    next(error);
  }
}


  static async getOnePayrun(req: Request, res: Response, next: NextFunction) {
    try {
      const id: number = Number(req.params.id);
      const payrun = await payrunService.getOnePayrun(id);
      if (payrun) {
        FormaterResponse.success(res, payrun, "Payrun récupéré avec succès", HttpCode.OK);
      } else {
        FormaterResponse.failed(res, "Payrun non trouvé", HttpCode.NOT_FOUND);
      }
    } catch (error) {
      next(error);
    }
  }

  static async createPayrun(req: Request, res: Response, next: NextFunction) {
    try {
      const data = PayrunSchema.parse(req.body);
      const payrunC = await payrunService.createPayrun(data);

      if (payrunC) {
        FormaterResponse.success(
          res,
          payrunC,
          "Cycle de paie créé avec succès et bulletins générés",
          HttpCode.CREATED
        );
      } else {
        FormaterResponse.failed(res, "Cycle de paie non créé", HttpCode.NOT_FOUND);
      }
    } catch (error: any) {
      if (error.code === "P2002") {
        return FormaterResponse.failed(
          res,
          "Ce cycle de paie existe déjà",
          HttpCode.CONFLICT
        );
      }

      if (error instanceof ZodError) {
        return FormaterResponse.failed(
          res,
          "Données invalides: " + error.issues.map(e => e.message).join(", "),
          HttpCode.BAD_REQUEST
        );
      }

      return FormaterResponse.failed(
        res,
        "Erreur serveur",
        HttpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  static async updatePayrun(req: Request, res: Response, next: NextFunction) {
    try {
      const id: number = Number(req.params.id);
      const data = PayrunSchema.parse(req.body);
      const payrunU = await payrunService.updatePayrun(id, data);

      if (payrunU) {
        FormaterResponse.success(res, payrunU, "Mise à jour réussie !", HttpCode.OK);
      } else {
        FormaterResponse.failed(res, "Échec de la mise à jour", HttpCode.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      next(error);
    }
  }

  static async deletePayrun(req: Request, res: Response, next: NextFunction) {
    try {
      const id: number = Number(req.params.id);
      const payrunD = await payrunService.deletePayrun(id);
      FormaterResponse.success(
        res,
        payrunD,
        "Cycle de paie supprimé avec succès",
        HttpCode.NO_CONTENT
      );
    } catch (error) {
      FormaterResponse.failed(res, "Cycle de paie non trouvé", HttpCode.NOT_FOUND);
    }
  }

  // ✅ Méthode corrigée pour récupérer les bulletins d’une payrun
  static async getPayslipsByPayrun(req: Request, res: Response, next: NextFunction) {
    try {
      const payrunId: number = Number(req.params.id);

      const payrun = await payrunService.getOnePayrun(payrunId);
      const payslips = payrun?.payslips || [];

      if (payslips.length > 0) {
        FormaterResponse.success(
          res,
          payslips,
          "Bulletins de paie récupérés avec succès",
          HttpCode.OK
        );
      } else {
        FormaterResponse.failed(res, "Bulletins non trouvés", HttpCode.NOT_FOUND);
      }
    } catch (error) {
      next(error);
    }
  }

  // // Méthode pour générer les bulletins manuellement
  // static async genererBulletins(req: Request, res: Response) {
  //   try {
  //     const payrunId = Number(req.params.id);

  //     const result = await payrunService.genererBulletinsManuel(payrunId);

  //     const payslips = await payrunService.getOnePayrun(payrunId);
      
  //     res.status(201).json({
  //       success: true,
  //       message: `${result} bulletin(s) généré(s) avec succès`,
  //       data: payslips?.payslips || []
  //     });
  //   } catch (error: any) {
  //     res.status(error.status || 500).json({
  //       success: false,
  //       message: error.message || "Erreur serveur"
  //     });
  //   }
  // }
}
