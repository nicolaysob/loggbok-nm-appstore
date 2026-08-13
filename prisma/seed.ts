import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const users = [
  {
    username: "nicolay",
    name: "Nicolay",
    password: "3467",
    role: "ADMIN" as const,
    legacyUsernames: ["admin"],
    legacyEmails: ["admin@loggbok.no"],
  },
  {
    username: "magnus",
    name: "Magnus",
    password: "4639",
    role: "EMPLOYEE" as const,
    legacyUsernames: ["ansatt"],
    legacyEmails: ["ansatt@loggbok.no"],
  },
  {
    username: "aleksandrs",
    name: "Aleksandrs",
    password: "5773",
    role: "EMPLOYEE" as const,
    legacyUsernames: [] as string[],
    legacyEmails: [] as string[],
  },
  {
    username: "victor",
    name: "Victor",
    password: "4342",
    role: "EMPLOYEE" as const,
    legacyUsernames: [] as string[],
    legacyEmails: [] as string[],
  },
];

async function main() {
  for (const user of users) {
    const passwordHash = await hash(user.password, 10);

    const existing =
      (await prisma.user.findUnique({ where: { username: user.username } })) ??
      (await prisma.user.findFirst({
        where: {
          OR: [
            { username: { in: user.legacyUsernames } },
            { email: { in: user.legacyEmails } },
          ],
        },
      }));

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          username: user.username,
          name: user.name,
          passwordHash,
          role: user.role,
          email: null,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          username: user.username,
          name: user.name,
          passwordHash,
          role: user.role,
        },
      });
    }

    console.log(`Klar ${user.role}: ${user.username}`);
  }

  const jobTypes = [
    "Plenklipp",
    "Snømåking",
    "Renhold",
    "Maling",
    "Portkontroll",
  ];
  for (const [index, name] of jobTypes.entries()) {
    await prisma.jobType.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: index + 1 },
    });
  }
  console.log(`Klar ${jobTypes.length} oppdragstyper`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
