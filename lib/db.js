import 'dotenv/config'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { Pool } from 'pg'

const globalForPrisma = globalThis

function getPrisma() {
  let databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'

  if (databaseUrl.startsWith('postgres')) {
    const pool = new Pool({ connectionString: databaseUrl })
    return new PrismaClient({ adapter: new PrismaPg(pool) })
  }

  // Normaliza caminhos Windows para SQLite interpretar corretamente
  if (databaseUrl.startsWith('file:')) {
    const dbPath = databaseUrl.slice(5)
    if (path.isAbsolute(dbPath)) {
      databaseUrl = 'file:' + path.normalize(dbPath).replace(/\\/g, '/')
    }
  }

  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
  })
}

export const prisma = globalForPrisma.prisma ?? getPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
