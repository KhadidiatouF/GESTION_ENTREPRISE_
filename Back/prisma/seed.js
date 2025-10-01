import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Entreprises
  await prisma.entreprise.createMany({
    data: [
      { nom: "Tech Solutions", adresse: "Dakar", logo: "logo1.png" },
      { nom: "Digital Services", adresse: "Thiès", logo: "logo2.png" },
    ],
  });

  // 2. Utilisateurs
  await prisma.user.createMany({
    data: [
      {
        login: "superadmin",
        password: await bcrypt.hash("pass12", 10),
        email: "admin@tech.com",
        role: "SUPER_ADMIN",
        entrepriseId: 1,
      },
      {
        login: "admin1",
        password: await bcrypt.hash("pass11", 10),
        email: "admin@digital.com",
        role: "ADMIN",
        entrepriseId: 2,
      },
      {
        login: "caissier1",
        password: await bcrypt.hash("pass3", 10),
        email: "cashier@tech.com",
        role: "CASSIER",
        entrepriseId: 1,
      },
    ],
  });

  // 3. Employés
  await prisma.employe.createMany({
    data: [
      {
        prenom: "Amadou",
        nom: "Diallo",
        fonction: "Développeur",
        matricule: "EMP001",
        estActif: true,
        typeContrat: "MENSUELLE",
        entrepriseId: 1,
      },
      {
        prenom: "Awa",
        nom: "Sow",
        fonction: "Designer",
        matricule: "EMP002",
        estActif: true,
        typeContrat: "JOURNALIER",
        entrepriseId: 1,
      },
      {
        prenom: "Moussa",
        nom: "Ndiaye",
        fonction: "Comptable",
        matricule: "EMP003",
        estActif: true,
        typeContrat: "HEBDOMADAIRE",
        entrepriseId: 2,
      },
    ],
  });

  // 4. Payruns
  await prisma.payrun.createMany({
    data: [
      {
        dateDebut: new Date("2025-09-01"),
        dateFin: new Date("2025-09-30"),
        salaire: 300000,
        entrepriseId: 1,
      },
      {
        dateDebut: new Date("2025-09-01"),
        dateFin: new Date("2025-09-15"),
        salaire: 150000,
        entrepriseId: 1,
      },
    ],
  });

  // 5. Payslips
  await prisma.payslip.createMany({
    data: [
      {
        jourTravaille: 20,
        montant: 300000,
        montantPaye: 250000,
        employeId: 1,
        payrunId: 1,
      },
      {
        jourTravaille: 15,
        montant: 150000,
        montantPaye: 150000,
        employeId: 2,
        payrunId: 2,
      },
    ],
  });

//   // 6. Paiements
//   await prisma.payment.createMany({
//     data: [
//       {
//         amount: 200000,
//         paymentMethod: "ESPECES",
//         reference: "REF123",
//         receiptNumber: "REC001",
//         payslipId: 1,
//       },
//       {
//         amount: 50000,
//         paymentMethod: "VIREMENT_BANCAIRE",
//         reference: "REF124",
//         receiptNumber: "REC002",
//         payslipId: 1,
//       },
//       {
//         amount: 150000,
//         paymentMethod: "ORANGE_MONEY",
//         reference: "REF200",
//         receiptNumber: "REC010",
//         payslipId: 2,
//       },
//     ],
//   });

  console.log("✅ Données insérées avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});
