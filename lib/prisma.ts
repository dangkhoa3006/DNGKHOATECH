import { resolve } from "path";

import { PrismaClient, Prisma } from "./generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl?.startsWith("file:")) {
  const filePath = databaseUrl.replace("file:", "");
  if (filePath.startsWith("./")) {
    const absolute = resolve(process.cwd(), filePath);
    process.env.DATABASE_URL = `file:${absolute}`;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { Prisma };

