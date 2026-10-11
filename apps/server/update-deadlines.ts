import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const scholarships = await prisma.scholarship.findMany({
    orderBy: { name: "asc" },
  });

  const now = new Date();

  for (let i = 0; i < scholarships.length; i++) {
    const deadline = new Date(now);
    deadline.setDate(now.getDate() + 30 + i * 5);

    await prisma.scholarship.update({
      where: { id: scholarships[i].id },
      data: {
        deadline,
        closingDate: deadline,
        status: "ACTIVE",
      },
    });

    console.log(
      `${scholarships[i].name} → ${deadline.toISOString()}`
    );
  }

  console.log(`Updated ${scholarships.length} scholarships.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());