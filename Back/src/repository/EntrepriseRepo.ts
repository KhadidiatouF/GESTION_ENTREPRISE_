import {  Entreprise, PrismaClient } from "@prisma/client";
import { IRepository } from "./IRepository";



export class EntrepriseRepo implements IRepository <Entreprise>{
    private prisma : PrismaClient = new PrismaClient();
    
    async findAll(): Promise<Entreprise[]> {
        return await this.prisma.entreprise.findMany({include: {
    employes: true, // 🔹 inclut la liste des employés
  }});
    }

    async findById(id: number): Promise<any> {
        return await this.prisma.entreprise.findUnique({where: {id}});
    }

    async create(data: Omit<Entreprise, "id">): Promise<Entreprise> {
        return await this.prisma.entreprise.create({data});
    }

    async update(id: number, data: Entreprise): Promise<Entreprise> {
        return await this.prisma.entreprise.update({where: {id}, data});
    }

    async delete(id: number): Promise<void> {
        await this.prisma.entreprise.delete({where:{id}})
    }

}