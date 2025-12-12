import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.winner.deleteMany()
  await prisma.draw.deleteMany()
  await prisma.entry.deleteMany()

  // Create sample entries
  const entries = await Promise.all([
    prisma.entry.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        weight: 1.0,
      },
    }),
    prisma.entry.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        weight: 1.5,
      },
    }),
    prisma.entry.create({
      data: {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        weight: 1.0,
      },
    }),
    prisma.entry.create({
      data: {
        name: 'Diana Prince',
        email: 'diana@example.com',
        weight: 2.0,
      },
    }),
    prisma.entry.create({
      data: {
        name: 'Eve Wilson',
        email: 'eve@example.com',
        weight: 1.0,
      },
    }),
    prisma.entry.create({
      data: {
        name: 'Frank Miller',
        weight: 1.0,
      },
    }),
    prisma.entry.create({
      data: {
        name: 'Grace Lee',
        email: 'grace@example.com',
        weight: 1.5,
      },
    }),
    prisma.entry.create({
      data: {
        name: 'Henry Davis',
        weight: 1.0,
      },
    }),
  ])

  console.log(`✅ Created ${entries.length} entries`)

  // Create a sample draw
  const draw = await prisma.draw.create({
    data: {
      numWinners: 2,
      seed: 'demo-seed-123',
      winners: {
        create: [
          {
            entryId: entries[0].id,
            position: 1,
          },
          {
            entryId: entries[3].id,
            position: 2,
          },
        ],
      },
    },
  })

  console.log(`✅ Created 1 sample draw with ${draw.numWinners} winners`)
  console.log('🎉 Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })


