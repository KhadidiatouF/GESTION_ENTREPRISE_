import type { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { FormaterResponse } from "../middlewares/FormateReponse";
import { HttpCode } from "../enums/codeError";
import { ZodError } from "zod";
import { userSchema } from "../validator/userValidator";

const userService = new UserService();

export class UserController{
 
    static async getAllUsers(req: Request, res: Response, next: NextFunction){
        try {
            const users = await userService.getAllUser();
            if (users) {
                FormaterResponse.success(res, users, "Users récupérés  avec succès", 200 )
            }else{
               FormaterResponse.failed(res, "Utilisateurs non trouvés",404)
            }
        } catch (error) {
            next(error);
        }
    }

    static async getOneUser(req: Request, res:Response, next: NextFunction){
        try {
            const id: number = Number (req.params.id)
            const user = await userService.getOneUser(id)

            if (user) {
                FormaterResponse.success(res, user, "Utilisateur trouvé avec succès", 200)
                res.status(HttpCode.OK).json(user)
            }else{
                FormaterResponse.failed(res,"Utilisateur non trouvé", 404)
            }

        } catch (error) {
            next(error)
            
        }
    }

    static async createUser(req: Request, res: Response, next: NextFunction) {
      try {

        const data = userSchema.parse(req.body);
        const userC = await userService.createUser(data);

        return FormaterResponse.success(res, userC, "Utilisateur créé avec succès", HttpCode.CREATED);

     } catch (error: any) {


        if (error.code === "P2002")
        {
            console.error("Erreur Zod:", error);

            return FormaterResponse.failed(res,"Le login doit etre unique", HttpCode.CONFLICT,
            );
        }

      if (error instanceof ZodError) {
            const firstError = error.issues[0]?.message || "Erreur de validation";
            return FormaterResponse.failed(res, firstError, HttpCode.BAD_REQUEST);
        }

        return FormaterResponse.failed(res,"Erreur server",HttpCode.INTERNAL_SERVER_ERROR
        );
       }
    }

    static async updateUser(req:Request, res: Response, next: NextFunction){
        try {
            const id: number = Number (req.params.id)
            const data = userSchema.parse(req.body); 
            const userU = await userService.updateUser(id, data)
            if (userU) {
              FormaterResponse.success(res, userU, "User Modifié  avec succès", 200 )
            }
        } catch (error: any) {
            return (FormaterResponse.failed(res,"Utilisateur non trouvé", 404))

        }
    }

    static async deleteUser(req:Request, res: Response){
        try {
            const id: number = Number (req.params.id);
            await userService.deleteUser(id)
            res.status(HttpCode.NO_CONTENT).send()
        }catch (error: any) {
            return (FormaterResponse.failed(res,"utilisateur non trouvé", 404))
        }
    }


}