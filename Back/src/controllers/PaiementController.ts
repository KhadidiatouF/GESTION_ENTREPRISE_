import { NextFunction, Response, Request } from "express";
import { PaiementService } from "../services/PaiementService";
import { FormaterResponse } from "../middlewares/FormateReponse";
import { ZodError } from "zod";
import { HttpCode } from "../enums/codeError";
import { PaiementSchema } from "../validator/paiementValidator";




const paiementService = new PaiementService();

export class PaiementController{
    
    static async getAllPaiement(req: Request, res: Response, next: NextFunction){
        try {
            const paiements = await paiementService.getAllPaiement()
            if (paiements) {
                FormaterResponse.success(res, paiements, "Paiement trouvées avec succès", HttpCode.OK)
                
            }else{
                FormaterResponse.failed(res,"Paiement non trouvées", HttpCode.NOT_FOUND)
            }
        } catch (error) {
            next(error)
        }
    }

    static async getOnePaiement(req: Request, res: Response, next: NextFunction){
        try {
            const id: number = Number (req.params.id)
            const paiement = await paiementService.getOnePaiement(id)
            if (paiement) {
                FormaterResponse.success(res, paiement, "Entrprise trouvée ! ", HttpCode.OK)
            }else{
                FormaterResponse.failed(res,"Paiement non trouvé", HttpCode.NOT_FOUND)
            }
        } catch (error) {
            next(error)
        }
    }

    static async createPaiement(req: Request, res: Response, next:NextFunction){
        try {

            const data = PaiementSchema.parse(req.body);
            const paiementC = await paiementService.createPaiement(data)

            if (paiementC) {
                FormaterResponse.success(res,paiementC,"Paiement créé fait succès", HttpCode.CREATED)
            }else{
                FormaterResponse.failed(res, "Paiement non fait", HttpCode.NOT_FOUND)
            }
        }catch (error: any) {


        if (error.code === "P2002")
        {
            return FormaterResponse.failed(res,"Cet Paiement existe déja", HttpCode.CONFLICT,
            );
        }

        if (error instanceof ZodError) {

            return FormaterResponse.failed( res,"le nom doit avoir au moins 6 letrres", HttpCode.BAD_REQUEST
            );
        }

        return FormaterResponse.failed(res,"Erreur server",HttpCode.INTERNAL_SERVER_ERROR
        );
       }
    }



    static async updateEntreprise(req: Request, res: Response, next:NextFunction){
        try {
            const id: number = Number(req.params.id)
            const data = PaiementSchema.parse(req.body)
            const paiementU = await paiementService.updatePaiement(id, data)

            if (paiementU) {
                FormaterResponse.success(res, paiementU, "Mise à jour fait avec succès ! ", HttpCode.OK)
            }else {
                FormaterResponse.failed(res, "Mise à jour échouée ! ", HttpCode.INTERNAL_SERVER_ERROR)
            }
        } catch (error) {
            next(error)
        }
    }

    static async deleteEntreprise(req: Request, res: Response, next: NextFunction){
        try {
          const id : number = Number(req.params.id)
          const paiementD = await paiementService.deletePaiement(id)
    
         FormaterResponse.success(res,paiementD,"Entreprise supprimée avec succès", HttpCode.NO_CONTENT)
        } catch (error) {
            FormaterResponse.failed(res, "Entreprise non trouvée", HttpCode.NOT_FOUND)
            
        }
    }



      static async getPayslipsEntreprise(req: Request, res: Response, next: NextFunction) {
        try {
            const caisseId = req.query.caisseId as string;
            
            if (!caisseId) {
                return FormaterResponse.failed(res, "Le paramètre caisseId est requis", HttpCode.BAD_REQUEST);
            }

            const payslips = await paiementService.getPayslipsEntreprise(Number(caisseId));
            
            if (payslips) {
                FormaterResponse.success(res, payslips, "Payslips récupérés avec succès", HttpCode.OK);
            } else {
                FormaterResponse.failed(res, "Aucun payslip trouvé", HttpCode.NOT_FOUND);
            }
        } catch (error) {
            next(error);
        }
    }

    static async getStatistiques(req: Request, res: Response, next: NextFunction) {
        try {
            const caisseId = req.query.caisseId as string;
            const mois = req.query.mois as string;
            
            if (!caisseId) {
                return FormaterResponse.failed(res, "Le paramètre caisseId est requis", HttpCode.BAD_REQUEST);
            }

            const stats = await paiementService.getStatistiques(Number(caisseId), mois);
            
            if (stats) {
                FormaterResponse.success(res, stats, "Statistiques récupérées avec succès", HttpCode.OK);
            } else {
                FormaterResponse.failed(res, "Statistiques non disponibles", HttpCode.NOT_FOUND);
            }
        } catch (error) {
            next(error);
        }
    }

    static async getHistoriquePaiements(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = req.query;
            
            const historique = await paiementService.getHistoriquePaiements(filters);
            
            if (historique) {
                FormaterResponse.success(res, historique, "Historique récupéré avec succès", HttpCode.OK);
            } else {
                FormaterResponse.failed(res, "Aucun historique trouvé", HttpCode.NOT_FOUND);
            }
        } catch (error) {
            next(error);
        }
    }


    
}