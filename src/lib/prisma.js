// src/lib/prisma.js
import { PrismaClient } from "@prisma/client";

// This is the standard singleton pattern for Prisma Client in a serverless environment.
// It prevents the creation of too many database connections, which causes crashes.

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
