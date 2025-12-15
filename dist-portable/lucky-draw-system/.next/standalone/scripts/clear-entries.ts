import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Clearing all entries...')
  
  // Check current count
  const beforeCount = await prisma.entry.count()
  console.log(`📊 Current entries in database: ${beforeCount}`)
  
  if (beforeCount === 0) {
    console.log('✅ Database is already empty.')
    return
  }
  
  // Use raw SQL to delete entries (bypasses Prisma constraints)
  // First enable foreign keys for SQLite
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`
  
  // Delete all winners first (to avoid foreign key issues)
  await prisma.$executeRaw`DELETE FROM Winner;`
  console.log('✅ Deleted all winners')
  
  // Delete all entries using raw SQL
  await prisma.$executeRaw`DELETE FROM Entry;`
  console.log('✅ Deleted all entries using raw SQL')
  
  // Verify deletion
  const afterCount = await prisma.entry.count()
  console.log(`✅ All entries cleared. Total entries in database: ${afterCount}`)
  
  if (afterCount > 0) {
    console.error(`⚠️  Warning: ${afterCount} entries still remain. There may be a database connection issue.`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error clearing entries:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

