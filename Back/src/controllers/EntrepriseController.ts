import { NextFunction, Response, Request } from "express";
import { EntrepriseService } from "../services/EntrepriseService";
import { FormaterResponse } from "../middlewares/FormateReponse";
import { HttpCode } from "../enums/codeError";
import { EntrepriseSchema } from "../validator/entrepriseValidator";
import { ZodError } from "zod";



const entrepriseService = new EntrepriseService();

export class EntrepriseController{
    
    static async getAllEntreprise(req: Request, res: Response, next: NextFunction){
        try {
            const entreprises = await entrepriseService.getAllEntreprise()
            if (entreprises) {
                FormaterResponse.success(res, entreprises, "Entreprises trouvées avec succès", HttpCode.OK)
                
            }else{
                FormaterResponse.failed(res,"Entreprises non trouvées", HttpCode.NOT_FOUND)
            }
        } catch (error) {
            next(error)
        }
    }

    static async getOneEntreprise(req: Request, res: Response, next: NextFunction){
        try {
            const id: number = Number (req.params.id)
            const entreprise = await entrepriseService.getOneEntreprise(id)
            if (entreprise) {
                FormaterResponse.success(res, entreprise, "Entrprise trouvée ! ", HttpCode.OK)
            }else{
                FormaterResponse.failed(res,"Entreprise non trouvé", HttpCode.NOT_FOUND)
            }
        } catch (error) {
            next(error)
        }
    }

    static async createEntreprise(req: Request, res: Response, next: NextFunction) {
    try {
        const data = {
        ...req.body,
        logo: req.file ? `/uploads/${req.file.filename}` : null
        };

        const parsedData = EntrepriseSchema.parse(data);
        const entrepriseC = await entrepriseService.createEntreprise(parsedData);

        if (entrepriseC) {
        FormaterResponse.success(res, entrepriseC, "Entreprise créée avec succès", HttpCode.CREATED);
        } else {
        FormaterResponse.failed(res, "Erreur lors de la création de l'entreprise", HttpCode.INTERNAL_SERVER_ERROR);
        }
    } catch (error: any) {
        if (error.code === "P2002") {
        return FormaterResponse.failed(res, "Cet entreprise existe déjà", HttpCode.CONFLICT);
        }
        if (error instanceof ZodError) {
        return FormaterResponse.failed(res, "le nom doit avoir au moins 2 lettres", HttpCode.BAD_REQUEST);
        }
        return FormaterResponse.failed(res, "Erreur server", HttpCode.INTERNAL_SERVER_ERROR);
    }
    }


    
    // static async createEntreprise(req: Request, res: Response, next: NextFunction){
    //     try {

    //         console.log(req.body);
    //         console.log(req.file);
            
            
    //         const data = {
    //         ...req.body,
    //         logo: req.file? `/uploads/${req.file.filename}`: ""
    //     };
    //     const parsedData = EntrepriseSchema.parse(data);
    //     const entrepriseC = await entrepriseService.createEntreprise(parsedData);
    //         if (entrepriseC) {
    //             FormaterResponse.success(res, entrepriseC, "Entreprise créée avec succès", HttpCode.CREATED)
    //         }else {
    //             FormaterResponse.failed(res, "Erreur lors de la création de l'entreprise", HttpCode.INTERNAL_SERVER_ERROR)
    //         }
    //     } catch (error: any) {
          
    
    //         if (error.code === "P2002")
    //         {
    //             return FormaterResponse.failed(res,"Cet entreprise existe déja", HttpCode.CONFLICT,
    //             );
    //         }
    
    //         if (error instanceof ZodError) {
    
    //             return FormaterResponse.failed( res,"le nom doit avoir au moins 2 letrres", HttpCode.BAD_REQUEST
    //             );
    //         }
    
    //         return FormaterResponse.failed(res,"Erreur server",HttpCode.INTERNAL_SERVER_ERROR
    //         );
    //      }
    // }

    static async updateEntreprise(req: Request, res: Response, next:NextFunction){
        try {
            const id: number = Number(req.params.id)
            const data = EntrepriseSchema.parse(req.body)
            const entrepriseU = await entrepriseService.updateEntreprise(id, data)

            if (entrepriseU) {
                FormaterResponse.success(res, entrepriseU, "Mise à jour fait avec succès ! ", HttpCode.OK)
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
          const entrepriseD = await entrepriseService.deleteEntreprise(id)
    
         FormaterResponse.success(res,entrepriseD,"Entreprise supprimée avec succès", HttpCode.NO_CONTENT)
        } catch (error) {
            FormaterResponse.failed(res, "Entreprise non trouvée", HttpCode.NOT_FOUND)
            
        }
    }
    
}