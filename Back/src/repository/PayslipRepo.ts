import {  Payslip, PrismaClient } from "@prisma/client";
import { IRepository } from "./IRepository";



export class PayslipRepo implements IRepository <Payslip>{
    private prisma : PrismaClient = new PrismaClient();
    
    async findAll(): Promise< Payslip[]> {
        return await this.prisma.payslip.findMany({});
    }

    async findById(id: number): Promise<any> {
        return await this.prisma.payslip.findUnique({where: {id}});
    }

    async create(data: Omit< Payslip, "id">): Promise< Payslip> {
        return await this.prisma.payslip.create({data});
    }

    async update(id: number, data:  Payslip): Promise< Payslip> {
        return await this.prisma.payslip.update({where: {id}, data});
    }

    async delete(id: number): Promise<void> {
        await this.prisma.payslip.delete({where:{id}})
    }

}