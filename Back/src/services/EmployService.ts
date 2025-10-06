import { PrismaClient } from "@prisma/client";
import QRCode from "qrcode";

const prisma = new PrismaClient();

export class EmployeService {
  
  async getAllEmploye(entrepriseId: number) {
    return await prisma.employe.findMany({
      where: { entrepriseId },
      include: {
        entreprise: true,
        payslips: {
          include: {
            payrun: true,
            paiements: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
  }

  async getOneEmploye(id: number) {
    return await prisma.employe.findUnique({
      where: { id },
      include: {
        entreprise: true,
        payslips: {
          include: {
            payrun: true,
            paiements: true
          }
        },
        pointages: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    });
  }



async createEmploye(data: any) {
  const { prenom, nom, fonction, matricule, estActif, typeContrat, entrepriseId } = data;

  const employe = await prisma.employe.create({
    data: {
      prenom,
      nom,
      fonction,
      matricule,
      estActif,
      typeContrat,
      entrepriseId
    },
    include: {
      entreprise: true  
    }
  });

  const qrCodeString = await QRCode.toDataURL(matricule, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  const employeWithQR = await prisma.employe.update({
    where: { id: employe.id },
    data: { qrCode: qrCodeString },
    include: {
      entreprise: true
    }
  });

  return employeWithQR; 
}

  async updateEmploye(id: number, data: any) {
    const { prenom, nom, fonction, matricule, estActif, typeContrat } = data;

    return await prisma.employe.update({
      where: { id },
      data: {
        prenom,
        nom,
        fonction,
        matricule,
        estActif,
        typeContrat
      }
    });
  }

  async deleteEmploye(id: number) {
    return await prisma.employe.delete({
      where: { id }
    });
  }

 async generateQRCodeFromEmploye(employe: any): Promise<string> {
  const qrCodeString = await QRCode.toDataURL(employe.matricule, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  return qrCodeString;
}

async generateQRCode(employeId: number): Promise<string> {
  const employe = await prisma.employe.findUnique({
    where: { id: employeId },
    include: { entreprise: true }
  });

  if (!employe) {
    throw new Error("Employé non trouvé");
  }

  return this.generateQRCodeFromEmploye(employe);
}
  async getQRCode(employeId: number) {
    const employe = await prisma.employe.findUnique({
      where: { id: employeId },
      select: { qrCode: true, prenom: true, nom: true, matricule: true }
    });

    if (!employe) {
      throw new Error("Employé non trouvé");
    }

    if (!employe.qrCode) {
      const qrCode = await this.generateQRCode(employeId);
      await prisma.employe.update({
        where: { id: employeId },
        data: { qrCode }
      });
      return qrCode;
    }

    return employe.qrCode;
  }

  async regenerateQRCode(employeId: number) {
    const qrCode = await this.generateQRCode(employeId);
    
    return await prisma.employe.update({
      where: { id: employeId },
      data: { qrCode }
    });
  }
}