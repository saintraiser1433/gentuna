import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Deleting all existing entries...')
  
  // Delete all entries (winners will be cascade deleted if needed)
  const deleteResult = await prisma.entry.deleteMany({})
  console.log(`✅ Deleted ${deleteResult.count} entries`)
  
  console.log('Creating 10 new entries...')
  
  // Create 10 new entries
  const newEntries = []
  for (let i = 1; i <= 10; i++) {
    newEntries.push({
      name: `Entry ${i}`,
    })
  }
  
  await prisma.entry.createMany({
    data: newEntries,
  })
  
  const totalEntries = await prisma.entry.count()
  console.log(`✅ Successfully created 10 entries. Total entries in database: ${totalEntries}`)
}

main()
  .catch((e) => {
    console.error('Error resetting entries:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

