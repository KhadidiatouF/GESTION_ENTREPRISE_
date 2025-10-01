import { EntrepriseRepo } from "../repository/EntrepriseRepo";



export class EntrepriseService{
    private entrepriseRepo : EntrepriseRepo;

    constructor(){
        this.entrepriseRepo = new EntrepriseRepo();
    }

    getAllEntreprise(){
        return this.entrepriseRepo.findAll();
    }

    getOneEntreprise(id: number){
        return this.entrepriseRepo.findById(id);
    }

    createEntreprise(data: any){
        return this.entrepriseRepo.create(data)
    }

    updateEntreprise(id: number, data: any){
        return this.entrepriseRepo.update(id, data)
    }

    deleteEntreprise(id:number){
        return this.entrepriseRepo.delete(id)
    }
}