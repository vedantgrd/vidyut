import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const scholarship = await prisma.scholarship.create({
    data: {
      slug: "demo-no-documents-scholarship",
      name: "Vidyut Demo Scholarship",
      provider: "Vidyut Foundation",
      description:
        "A simple demo scholarship for testing the Vidyut application flow. No documents are required.",
      shortDescription:
        "Demo scholarship with no document requirements.",
      amount: 10000,
      amountDescription: "₹10,000",
      scholarshipCategory: "MERIT",
      tags: ["Demo", "Merit"],
      isFeatured: true,
      isNational: true,
      states: [],
      deadline: new Date("2026-12-31T23:59:59.000Z"),
      openDate: new Date(),
      closingDate: new Date("2026-12-31T23:59:59.000Z"),
      officialWebsite: null,
      applicationUrl: null,
      status: "ACTIVE",

      // No eligibility rules
      eligibilityRules: {
        create: [],
      },

      // No required documents
      requiredDocuments: {
        create: [],
      },
    },
  });

  console.log("Demo scholarship created:");
  console.log(scholarship.name);
  console.log(scholarship.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());