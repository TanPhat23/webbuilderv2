import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV === "development") globalThis.prisma = prisma;

export default prisma;
