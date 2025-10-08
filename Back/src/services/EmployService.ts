import { PrismaClient, Role } from "@prisma/client";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export class EmployeService {

     async getEmployeByUserId(userId: number) {
    return await prisma.employe.findUnique({
      where: { userId },
      include: {
        entreprise: true,
        user: true,
      },
    });
  }

  async getAllEmploye(entrepriseId: number) {
    return await prisma.employe.findMany({
      where: { entrepriseId },
      include: {
        entreprise: true,
        user: true,
        payslips: {
          include: {
            payrun: true,
            paiements: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });
  }

  async getOneEmploye(id: number) {
    return await prisma.employe.findUnique({
      where: { id },
      include: {
        entreprise: true,
        user: true,
        payslips: {
          include: {
            payrun: true,
            paiements: true,
          },
        },
        pointages: {
          orderBy: { date: "desc" },
          take: 30,
        },
      },
    });
  }

  

  async createEmploye(data: any) {
    const {
      prenom,
      nom,
      fonction,
      matricule,
      estActif,
      typeContrat,
      entrepriseId,
      email,
      password,
    } = data;

    const employe = await prisma.employe.create({
      data: {
        prenom,
        nom,
        fonction,
        matricule,
        estActif,
        typeContrat,
        entreprise: { connect: { id: entrepriseId } }, 
        user: {
          create: {
            login: matricule,
            password: await bcrypt.hash(password || "123456", 10),
            nom,
            prenom,
            email: `${matricule.toLowerCase()}@entreprise.local`,
            role: Role.EMPLOYE, 
            estActif: true,
            entreprise: { connect: { id: entrepriseId } }, 
          },
        },
      },
      include: {
        user: true,
        entreprise: true,
      },
    });

    // 🧾 Génération du QR code
    const qrCodeString = await QRCode.toDataURL(matricule, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
    });

    // 📌 Mise à jour du champ qrCode
    const employeWithQR = await prisma.employe.update({
      where: { id: employe.id },
      data: { qrCode: qrCodeString },
      include: {
        user: true,
        entreprise: true,
      },
    });

    return employeWithQR;
  }

  // ✏️ Mise à jour d’un employé
  async updateEmploye(id: number, data: any) {
    const { prenom, nom, fonction, matricule, estActif, typeContrat, email } = data;

    // on met à jour aussi les infos du user lié si nécessaire
    return await prisma.employe.update({
      where: { id },
      data: {
        prenom,
        nom,
        fonction,
        matricule,
        estActif,
        typeContrat,
        user: {
          update: {
            nom,
            prenom,
            email,
          },
        },
      },
      include: {
        user: true,
        entreprise: true,
      },
    });
  }

  async deleteEmploye(id: number) {
    const employe = await prisma.employe.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employe) throw new Error("Employé non trouvé");

    if (employe.userId) {
      await prisma.user.delete({ where: { id: employe.userId } });
    }

    return await prisma.employe.delete({ where: { id } });
  }

  async generateQRCodeFromEmploye(employe: any): Promise<string> {
    const qrCodeString = await QRCode.toDataURL(employe.matricule, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
    });

    return qrCodeString;
  }

  async generateQRCode(employeId: number): Promise<string> {
    const employe = await prisma.employe.findUnique({
      where: { id: employeId },
      include: { entreprise: true },
    });

    if (!employe) throw new Error("Employé non trouvé");

    return this.generateQRCodeFromEmploye(employe);
  }

  async getQRCode(employeId: number) {
    const employe = await prisma.employe.findUnique({
      where: { id: employeId },
      select: { qrCode: true, prenom: true, nom: true, matricule: true },
    });

    if (!employe) throw new Error("Employé non trouvé");

    if (!employe.qrCode) {
      const qrCode = await this.generateQRCode(employeId);
      await prisma.employe.update({
        where: { id: employeId },
        data: { qrCode },
      });
      return qrCode;
    }

    return employe.qrCode;
  }

  // Dans EmployeService.ts, ajoutez cette méthode

async getQRCodeByUserId(userId: number) {
  const employe = await prisma.employe.findUnique({
    where: { userId },
    select: { id: true, qrCode: true, prenom: true, nom: true, matricule: true },
  });

  if (!employe) throw new Error("Employé non trouvé");

  // Si le QR code n'existe pas, le générer
  if (!employe.qrCode) {
    const qrCode = await this.generateQRCode(employe.id);
    await prisma.employe.update({
      where: { id: employe.id },
      data: { qrCode },
    });
    return qrCode;
  }

  return employe.qrCode;
}

   

  async regenerateQRCode(employeId: number) {
    const qrCode = await this.generateQRCode(employeId);

    return await prisma.employe.update({
      where: { id: employeId },
      data: { qrCode },
    });
  }
}
