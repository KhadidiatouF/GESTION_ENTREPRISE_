import {  PrismaClient, User } from "@prisma/client";
import { IRepository } from "./IRepository";



export class UserRepo implements IRepository <User>{
    private prisma : PrismaClient = new PrismaClient();
    
    async findAll(): Promise<User[]> {
        return await this.prisma.user.findMany({});
    }

    async findById(id: number): Promise<any> {
        return await this.prisma.user.findUnique({where: {id}});
    }

    async create(data: Omit<User, "id">): Promise<User> {
        return await this.prisma.user.create({data});
    }

    async update(id: number, data: User): Promise<User> {
        return await this.prisma.user.update({where: {id}, data});
    }

    async delete(id: number): Promise<void> {
        await this.prisma.user.delete({where:{id}})
    }

}