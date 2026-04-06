import "server-only";

import path from "path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma";

function resolveSqlitePath(): string {
  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const without = raw.replace(/^file:/, "");
  return path.isAbsolute(without)
    ? without
    : path.join(
        /* turbopackIgnore: true */ process.cwd(),
        without,
      );
}

function createClient() {
  const adapter = new PrismaBetterSqlite3({ url: resolveSqlitePath() });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
