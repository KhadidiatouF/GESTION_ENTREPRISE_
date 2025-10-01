import { AuthRepository, Connexion } from "../repository/AuthRepo"


export class AuthService{

    static async login(connexion: Connexion){
        return await AuthRepository.auth(connexion)
    }

    static async refreshToken(refreshToken : string){
        return await AuthRepository.refreshToken(refreshToken)

    }
    
}