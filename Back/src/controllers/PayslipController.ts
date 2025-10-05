import { NextFunction, Response, Request } from "express";
import { FormaterResponse } from "../middlewares/FormateReponse";
import { HttpCode } from "../enums/codeError";
import { ZodError } from "zod";
import { PayslipService } from "../services/PayslipService";
import { PaiementSchema } from "../validator/paiementValidator";
import { PayslipSchema } from "../validator/PayslipValidator";

const payslipService = new PayslipService();

export class PayslipController{

    static async getAllPayslip(req: Request, res: Response, next: NextFunction){
        try {
            const payslips = await payslipService.getAllPayslip()
            if (payslips) {
                FormaterResponse.success(res, payslips, "Paylips récupérés avec succès", 200)
            }else{
                FormaterResponse.failed(res, "Paylips non trouvés", 404)
            }
            
        } catch (error) {
            next(error)
        }
    }

    static async getOnePayslip(req:Request, res: Response, next: NextFunction){
        try {
            const id: number = Number(req.params.id)
            const payslip = await payslipService.getOnePayslip(id)
            if (payslip) {
                FormaterResponse.success(res,payslip,"payslip récupéré avec succès", 200)
            }else{
                FormaterResponse.failed(res,"payslip non trouvé", 404)
            }
        } catch (error) {
            next(error)
        }
    }


    static async createPaylips(req: Request, res: Response, next:NextFunction){
        try {

            const data = PaiementSchema.parse(req.body);
            const payslipC = await payslipService.createPayslip(data)

            if (payslipC) {
                FormaterResponse.success(res,payslipC,"payslip créé avec succès", HttpCode.CREATED)
            }else{
                FormaterResponse.failed(res, "payslip non créé", HttpCode.NOT_FOUND)
            }
        }catch (error: any) {


        if (error.code === "P2002")
        {
            return FormaterResponse.failed(res,"Cet payslip existe déja", HttpCode.CONFLICT,
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

    static async updatePayslip(req: Request, res: Response, next : NextFunction){
        try {
            const id : number = Number(req.params.id)
            const data = PayslipSchema.parse(req.body)
            const payslipU = await payslipService.updatePayslip(id, data)

            if (payslipU) {
                FormaterResponse.success(res, payslipU, "Mise à jour réussi !", HttpCode.OK)
            }else{
                FormaterResponse.failed(res, "Echec de la mise à jour", HttpCode.INTERNAL_SERVER_ERROR)
            }
        } catch (error) {
            next(error)
        }
    }

    static async deletePayslip(req: Request, res: Response, next: NextFunction ){
        try {
            const id : number = Number(req.params.id)
            const payslipD = await payslipService.deletePayslip(id)
            FormaterResponse.success(res, payslipD,"Payslip supprimé avec succès", HttpCode.NO_CONTENT)
        } catch (error) {
            FormaterResponse.failed(res, "Payslip non trouvé", HttpCode.NOT_FOUND)
            
        }
    }

}

