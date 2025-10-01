import { EmployRepo } from "../repository/EmployRepo";


export class EmployService{
    private employRepo : EmployRepo;

    constructor(){
        this.employRepo = new EmployRepo();
    }

    getAllEmploy(){
        return  this.employRepo.findAll()
    }

    getOneEmploy(id: number){
        return this.employRepo.findById(id);
    }

    createEmploy(data: any){
        return this.employRepo.create(data)
    }

    updateEmploy(id:number, data: any){
        return this.employRepo.update(id, data)
    }

    deleteEmploy(id:number){
        return this.employRepo.delete(id)
    }
}