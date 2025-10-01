import jwt from "jsonwebtoken"
import {config} from "../config/env"

const JWT_SECRET = config.JWT_SECRET;
const JWT_REFRESH_SECRET = config.JWT_REFRESH_SECRET;

// export interface JwtPayload{
   
//     login: string; 
//     password: string;
// }


export interface JwtPayload{

    login: string; 
    password: string;
}

export const generateAccessToken = (payload: JwtPayload): string =>{
    return jwt.sign(payload,JWT_SECRET, {expiresIn: "1h"} )
} 

export const generateRefreshToken = (payload: JwtPayload): string =>{
    return jwt.sign(payload,JWT_REFRESH_SECRET, {expiresIn: "7d"} )
}

export const verifyAccessToken= (token: string): JwtPayload =>{
    return jwt.verify(token, JWT_SECRET) as JwtPayload;

}

export const verifyRefreshToken= (token: string): JwtPayload =>{
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;

}