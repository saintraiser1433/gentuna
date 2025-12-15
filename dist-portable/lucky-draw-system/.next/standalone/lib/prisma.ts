import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/nextjs-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure database URL is properly resolved for SQLite
let databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'

// If using relative path, resolve it to absolute path for SQLite
// SQLite on Windows sometimes has issues with relative paths
if (databaseUrl.startsWith('file:./') || databaseUrl.startsWith('file:../')) {
  const relativePath = databaseUrl.replace('file:', '')
  const absolutePath = path.resolve(process.cwd(), relativePath)
  const dbDir = path.dirname(absolutePath)
  
  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  
  // Update process.env so Prisma can read it
  process.env.DATABASE_URL = `file:${absolutePath}`
  databaseUrl = process.env.DATABASE_URL
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma



