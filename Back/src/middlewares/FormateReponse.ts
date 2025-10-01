import  {  Response } from "express";

export class FormaterResponse{
    static success(res: Response, data: any, message: string, status: number){
        return res.status(status).json({
            success: true,
            message,
            data
        })
    }


    static failed(res: Response,message: string, status: number){
        return res.status(status).json({
            success: false,
            message,
            data: []
        })
    }
}