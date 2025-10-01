import {  Employe, PrismaClient } from "@prisma/client";
import { IRepository } from "./IRepository";



export class EmployRepo implements IRepository <Employe>{
    
    private prisma : PrismaClient = new PrismaClient();
    
    async findAll(): Promise<Employe[]> {
        return await this.prisma.employe.findMany({});
    }

    async findById(id: number): Promise<any> {
        return await this.prisma.employe.findUnique({where: {id}});
    }

    async create(data: Omit<Employe, "id">): Promise<Employe> {
        return await this.prisma.employe.create({data});
    }

    async update(id: number, data: Employe): Promise<Employe> {
        return await this.prisma.employe.update({where: {id}, data});
    }

    async delete(id: number): Promise<void> {
        await this.prisma.employe.delete({where:{id}})
    }

}