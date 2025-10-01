import { NextFunction, Response, Request } from "express";
import { EmployService } from "../services/EmployService";
import { FormaterResponse } from "../middlewares/FormateReponse";
import { EmployeSchema } from "../validator/employValidator";
import { HttpCode } from "../enums/codeError";
import { ZodError } from "zod";

const employService = new EmployService();

export class EmployController{

    static async getAllEmploys(req: Request, res: Response, next: NextFunction){
        try {
            const employs = await employService.getAllEmploy()
            if (employs) {
                FormaterResponse.success(res, employs, "Employés récupérés avec succès", 200)
            }else{
                FormaterResponse.failed(res, "Employés non trouvés", 404)
            }
            
        } catch (error) {
            next(error)
        }
    }

    static async getOneEmploy(req:Request, res: Response, next: NextFunction){
        try {
            const id: number = Number(req.params.id)
            const employ = await employService.getOneEmploy(id)
            if (employ) {
                FormaterResponse.success(res,employ,"Employé récupéré avec succès", 200)
            }else{
                FormaterResponse.failed(res,"Employé non trouvé", 404)
            }
        } catch (error) {
            next(error)
        }
    }


    static async createEmploy(req: Request, res: Response, next:NextFunction){
        try {

            const data = EmployeSchema.parse(req.body);
            const employC = await employService.createEmploy(data)

            if (employC) {
                FormaterResponse.success(res,employC,"Employé créé avec succès", HttpCode.CREATED)
            }else{
                FormaterResponse.failed(res, "Employé non créé", HttpCode.NOT_FOUND)
            }
        }catch (error: any) {


        if (error.code === "P2002")
        {
            return FormaterResponse.failed(res,"Cet employé existe déja", HttpCode.CONFLICT,
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

    static async updateEmploy(req: Request, res: Response, next : NextFunction){
        try {
            const id : number = Number(req.params.id)
            const data = EmployeSchema.parse(req.body)
            const employU = await employService.updateEmploy(id, data)

            if (employU) {
                FormaterResponse.success(res, employU, "Mise à jour réussi !", HttpCode.OK)
            }else{
                FormaterResponse.failed(res, "Echec de la mise à jour", HttpCode.INTERNAL_SERVER_ERROR)
            }
        } catch (error) {
            next(error)
        }
    }

    static async deleteEmploy(req: Request, res: Response, next: NextFunction ){
        try {
            const id : number = Number(req.params.id)
            const employD = await employService.deleteEmploy(id)
            FormaterResponse.success(res, employD,"Employé supprimé avec succès", HttpCode.NO_CONTENT)
        } catch (error) {
            FormaterResponse.failed(res, "Employé non trouvé", HttpCode.NOT_FOUND)
            
        }
    }

}

