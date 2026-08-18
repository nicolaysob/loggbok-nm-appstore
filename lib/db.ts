import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

// Versjonsnøkkel — økes når schema får nye modeller, så hot reload ikke
// gjenbruker en gammel klient uten f.eks. customerJob.
const PRISMA_VERSION = "staff-access-1";

const globalForPrisma = globalThis as unknown as {
  prismaVersion?: string;
  prisma?: ReturnType<typeof createPrismaClient>;
};

function getDb() {
  if (
    globalForPrisma.prisma &&
    globalForPrisma.prismaVersion === PRISMA_VERSION
  ) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();
  // Cache også i produksjon — uten dette lager Proxy-en ny PrismaClient
  // (og ny pool mot Supabase) på hvert property-oppslag, som gjør sider trege.
  globalForPrisma.prisma = client;
  globalForPrisma.prismaVersion = PRISMA_VERSION;
  return client;
}

// Proxy slik at hver tilgang går via getDb() — unngår at HMR holder
// på en gammel klientreferanse etter schema-endring.
export const db = new Proxy({} as ReturnType<typeof createPrismaClient>, {
  get(_target, prop, receiver) {
    const client = getDb();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
