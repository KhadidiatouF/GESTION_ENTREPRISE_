import {   Payrun, PrismaClient } from "@prisma/client";
import { IRepository } from "./IRepository";



export class PayrunRepo implements IRepository <Payrun>{
    private prisma : PrismaClient = new PrismaClient();
    
    async findAll(): Promise<Payrun[]> {
        return await this.prisma.payrun.findMany({});
    }

    async findById(id: number): Promise<any> {
        return await this.prisma.payrun.findUnique({where: {id}});
    }

    async create(data: Omit<Payrun, "id">): Promise<Payrun> {
        return await this.prisma.payrun.create({data});
    }

    async update(id: number, data: Payrun): Promise<Payrun> {
        return await this.prisma.payrun.update({where: {id}, data});
    }

    async delete(id: number): Promise<void> {
        await this.prisma.payrun.delete({where:{id}})
    }

}