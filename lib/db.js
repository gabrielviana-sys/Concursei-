import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

function getPrisma() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'

  if (databaseUrl.startsWith('postgres')) {
    const { PrismaPg } = require('@prisma/adapter-pg')
    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: databaseUrl })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
  }

  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? getPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
