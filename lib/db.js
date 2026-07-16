import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { Pool } from 'pg'
import Database from 'better-sqlite3'

const globalForPrisma = globalThis

function getPrisma() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'

  if (databaseUrl.startsWith('postgres')) {
    const pool = new Pool({ connectionString: databaseUrl })
    return new PrismaClient({ adapter: new PrismaPg(pool) })
  }

  return new PrismaClient({
    adapter: new PrismaBetterSqlite3(new Database(databaseUrl.replace('file:', ''))),
  })
}

export const prisma = globalForPrisma.prisma ?? getPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
