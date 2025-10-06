import { NextFunction, Response, Request } from "express";
import { FormaterResponse } from "../middlewares/FormateReponse";
import { HttpCode } from "../enums/codeError";
import { ZodError } from "zod";
import { EmployeService } from "../services/EmployService";
import { PrismaClient } from '@prisma/client';
import { EmployeSchema } from "../validator/employValidator";

const prisma = new PrismaClient();
const employeService = new EmployeService();

export class EmployeController {


static async getAllEmploye(req: Request, res: Response, next: NextFunction) {
    try {
      // Récupérer l'entrepriseId depuis les query params OU depuis le token
      const entrepriseId = Number(req.query.entrepriseId) 

      if (!entrepriseId) {
        return res.status(400).json({
          success: false,
          message: 'entrepriseId requis',
          data: []
        });
      }

      const employes = await prisma.employe.findMany({
        where: { entrepriseId },
        include: {
          entreprise: true
        }
      });

      return res.status(200).json({
        success: true,
        data: employes
      });
    } catch (error: any) {
      console.error('Erreur dans getAllEmploye:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
        data: []
      });
    }
  }

  static async getOneEmploye(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const employe = await employeService.getOneEmploye(id);

      if (employe) {
        FormaterResponse.success(res, employe, "Employé trouvé", HttpCode.OK);
      } else {
        FormaterResponse.failed(res, "Employé non trouvé", HttpCode.NOT_FOUND);
      }
    } catch (error) {
      next(error);
    }
  }

  // static async createEmploye(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const data = EmployeSchema.parse(req.body);
  //     const employe = await employeService.createEmploye(data);

    
  //     if (employe) {
  //       FormaterResponse.success(res, employe, "Employé créé avec succès", HttpCode.CREATED);
  //     }
  //   } catch (error: any) {
  //     if (error.code === "P2002") {
  //       return FormaterResponse.failed(
  //         res, 
  //         "Ce matricule existe déjà", 
  //         HttpCode.CONFLICT
  //       );
  //     }

  //     if (error instanceof ZodError) {
  //       return FormaterResponse.failed(
  //         res, 
  //         "Données invalides", 
  //         HttpCode.BAD_REQUEST
  //       );
  //     }

  //     return FormaterResponse.failed(
  //       res, 
  //       "Erreur serveur", 
  //       HttpCode.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }

  static async createEmploye(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body;
    console.log('📥 Données reçues:', data); // Debug
    
    const employe = await employeService.createEmploye(data);
    console.log('✅ Employé créé avec QR:', employe.qrCode ? 'OUI' : 'NON'); // Debug

    if (employe) {
      FormaterResponse.success(res, employe, "Employé créé avec succès", HttpCode.CREATED);
    }
  } catch (error: any) {
    console.error('❌ Erreur complète:', error);
    
    if (error.code === "P2002") {
      return FormaterResponse.failed(
        res, 
        "Ce matricule existe déjà", 
        HttpCode.CONFLICT
      );
    }

    if (error instanceof ZodError) {
      return FormaterResponse.failed(
        res, 
        "Données invalides", 
        HttpCode.BAD_REQUEST
      );
    }

    return FormaterResponse.failed(
      res, 
      error.message || "Erreur serveur", 
      HttpCode.INTERNAL_SERVER_ERROR
    );
  }
}

  static async updateEmploye(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = req.body;

      const employe = await employeService.updateEmploye(id, data);

      if (employe) {
        FormaterResponse.success(res, employe, "Employé mis à jour", HttpCode.OK);
      }
    } catch (error: any) {
      if (error.code === "P2002") {
        return FormaterResponse.failed(
          res, 
          "Ce matricule existe déjà", 
          HttpCode.CONFLICT
        );
      }
      next(error);
    }
  }

  static async deleteEmploye(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await employeService.deleteEmploye(id);

      FormaterResponse.success(res, null, "Employé supprimé", HttpCode.NO_CONTENT);
    } catch (error) {
      FormaterResponse.failed(res, "Employé non trouvé", HttpCode.NOT_FOUND);
    }
  }
// GET /employes/:id/qrcode
static async getQRCode(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const employe = await prisma.employe.findUnique({ where: { id: Number(id) } });
    if (!employe || !employe.qrCode) {
      return res.status(404).json({ success: false, message: "QR Code non trouvé" });
    }

    return res.json({ success: true, data: { qrCodeImage: employe.qrCode } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}


  static async regenerateQRCode(req: Request, res: Response, next: NextFunction) {
    try {
      const employeId = Number(req.params.id);
      const employe = await employeService.regenerateQRCode(employeId);

      FormaterResponse.success(res, employe, "QR Code régénéré", HttpCode.OK);
    } catch (error: any) {
      FormaterResponse.failed(res, error.message, HttpCode.NOT_FOUND);
    }
  }
}