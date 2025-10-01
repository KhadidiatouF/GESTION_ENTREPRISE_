import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"
import {generateAccessToken, generateRefreshToken, JwtPayload, verifyRefreshToken} from "../auth/jwt";


const prisma = new PrismaClient();

export interface Connexion{
 
    login: string;
    password: string;
}


export interface AuthReponse {
    user: {
        id: number;
        nom: string;
        prenom: string;
        login: string;
        email: string;
        adresse: string | null;
        role: string;
        estActif: boolean;
        entrepriseId: number | null

    };
    accessToken: string;
    refreshToken: string;
  
}


export class AuthRepository{
 
    static async auth(connexion : Connexion): Promise<AuthReponse>{
        
        const {login, password} = connexion;

        const userTrouve = await prisma.user.findUnique({where: {login}});

        if (!userTrouve) {
            throw new Error("Login ou mot de passe incorrect");
        }

        const estPassword = await bcrypt.compare(password, userTrouve.password);
        if (!estPassword) {
            throw new Error("Login ou mot de passe incorrect");
        }

        const payload: JwtPayload ={
            login: userTrouve.login,
            password: userTrouve.password
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const {password: _password, ...userwithoutpassword} = userTrouve;


        return {accessToken, refreshToken , user: userwithoutpassword}



    }

    static async refreshToken(refreshToken: string): Promise<{accessToken:string}> {
        const  payload = verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new Error("Refresh token invalide");
        }
        const accessToken = generateAccessToken(payload)
        return { accessToken };
    }

}