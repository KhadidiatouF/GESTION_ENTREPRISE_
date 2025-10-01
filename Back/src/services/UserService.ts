import { UserRepo } from "../repository/UserRepo";
import bcrypt from "bcryptjs";


export class UserService{
    private userRepo : UserRepo;

    constructor(){
        this.userRepo = new UserRepo();
    }

    getAllUser(){
        return this.userRepo.findAll();
    }

    getOneUser(id: number){
        return this.userRepo.findById(id);
    }
    
    // createUser(data: any){
    //     return this.userRepo.create(data)
    // }

    async createUser(data: any) {
        if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
        }
        return this.userRepo.create(data);
    }


    updateUser(id: number, data: any){
        return this.userRepo.update(id, data)
    }

    deleteUser(id: number){
        return this.userRepo.delete(id)
    }
}