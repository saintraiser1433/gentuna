import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to seed 100 entries...')
  
  const entries = []
  const batchSize = 100
  
  for (let i = 1; i <= 100; i++) {
    entries.push({
      name: `Entry ${i}`,
    })
    
    // Insert in batches for better performance
    if (entries.length === batchSize || i === 100) {
      await prisma.entry.createMany({
        data: entries,
      })
      console.log(`Created ${i} entries...`)
      entries.length = 0 // Clear array
    }
  }
  
  const totalEntries = await prisma.entry.count()
  console.log(`✅ Successfully seeded! Total entries in database: ${totalEntries}`)
}

main()
  .catch((e) => {
    console.error('Error seeding entries:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


