import { PayslipRepo } from "../repository/PayslipRepo";



export class PayslipService{
    private payslipRepo : PayslipRepo;

    constructor(){
        this.payslipRepo = new PayslipRepo();
    }

    getAllPayslip(){
        return this.payslipRepo.findAll();
    }

    getOnePayslip(id: number){
        return this.payslipRepo.findById(id);
    }

    createPayslip(data: any){
        return this.payslipRepo.create(data)
    }

    updatePayslip(id: number, data: any){
        return this.payslipRepo.update(id, data)
    }

    deletePayslip(id:number){
        return this.payslipRepo.delete(id)
    }
}