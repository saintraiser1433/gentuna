import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Simple API key check (in production, use proper authentication)
function checkApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.DRAW_API_KEY
  
  // If no key is set or key is the default placeholder, allow access (for local development)
  if (!expectedKey || expectedKey === 'your-secret-api-key-here') {
    return true
  }
  
  // If key is set, require it to match
  return apiKey === expectedKey
}

// Validation schema for running a draw
const runDrawSchema = z.object({
  numWinners: z.number().int().positive().max(1000),
  seed: z.string().optional(),
  excludePreviousWinners: z.boolean().optional().default(false),
  prizeAssignments: z.array(z.object({
    prizeId: z.string(),
    count: z.number().int().positive(),
  })).optional(),
})

// Random selection without replacement (all entries have equal weight)
function weightedRandomSelect<T>(
  items: T[],
  count: number,
  seed?: string
): T[] {
  if (items.length === 0 || count === 0) return []
  if (count >= items.length) return [...items]

  // Simple seeded random number generator
  let seedValue = seed ? hashString(seed) : Date.now()
  function seededRandom() {
    seedValue = (seedValue * 9301 + 49297) % 233280
    return seedValue / 233280
  }

  const selected: T[] = []
  const available = [...items]

  for (let i = 0; i < count && available.length > 0; i++) {
    // Simple random selection (all items have equal weight)
    const randomIndex = Math.floor(seededRandom() * available.length)
    selected.push(available[randomIndex])
    available.splice(randomIndex, 1)
  }

  return selected
}

// Simple string hash function for seed
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// GET /api/draws - List all draws
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [draws, total] = await Promise.all([
      prisma.draw.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          winners: {
            include: {
              entry: true,
              prize: true,
            },
            orderBy: { position: 'asc' },
          },
          _count: {
            select: { winners: true },
          },
        },
      }),
      prisma.draw.count(),
    ])

    return NextResponse.json({
      draws,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching draws:', error)
    return NextResponse.json(
      { error: 'Failed to fetch draws' },
      { status: 500 }
    )
  }
}

// POST /api/draws - Run a new draw
export async function POST(request: NextRequest) {
  try {
    // Check API key for security
    if (!checkApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = runDrawSchema.parse(body)

    // Get all available entries
    let entries = await prisma.entry.findMany()

    // Exclude previous winners if requested
    if (validatedData.excludePreviousWinners) {
      const previousWinnerIds = await prisma.winner.findMany({
        select: { entryId: true },
        distinct: ['entryId'],
      })
      const winnerIds = new Set(previousWinnerIds.map((w) => w.entryId))
      entries = entries.filter((e) => !winnerIds.has(e.id))
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No entries available for draw' },
        { status: 400 }
      )
    }

    if (entries.length < validatedData.numWinners) {
      return NextResponse.json(
        {
          error: `Not enough entries. Available: ${entries.length}, Requested: ${validatedData.numWinners}`,
        },
        { status: 400 }
      )
    }

    // Run the weighted random selection
    const winners = weightedRandomSelect(
      entries,
      validatedData.numWinners,
      validatedData.seed
    )

    // Validate prize assignments if provided
    let prizeMap: Map<number, string> | null = null
    if (validatedData.prizeAssignments && validatedData.prizeAssignments.length > 0) {
      // Calculate total winners assigned
      const totalAssigned = validatedData.prizeAssignments.reduce((sum, a) => sum + a.count, 0)
      
      if (totalAssigned > validatedData.numWinners) {
        return NextResponse.json(
          { error: `Total winners assigned to prizes (${totalAssigned}) cannot exceed number of winners (${validatedData.numWinners})` },
          { status: 400 }
        )
      }

      // Get all unique prize IDs
      const prizeIds = validatedData.prizeAssignments.map(a => a.prizeId)
      
      // Verify all prize IDs exist
      const existingPrizes = await prisma.prize.findMany({
        where: { id: { in: prizeIds } },
        select: { id: true },
      })

      if (existingPrizes.length !== prizeIds.length) {
        return NextResponse.json(
          { error: 'One or more prize IDs are invalid' },
          { status: 400 }
        )
      }

      // Create a map of position to prize ID based on assignments
      // First X winners get prize 1, next Y winners get prize 2, etc.
      prizeMap = new Map()
      let currentPosition = 1
      
      for (const assignment of validatedData.prizeAssignments) {
        for (let i = 0; i < assignment.count; i++) {
          prizeMap.set(currentPosition, assignment.prizeId)
          currentPosition++
        }
      }
    }

    // Create draw and winners in a transaction
    const draw = await prisma.$transaction(async (tx) => {
      const newDraw = await tx.draw.create({
        data: {
          numWinners: validatedData.numWinners,
          seed: validatedData.seed || null,
        },
      })

      const winnerRecords = await Promise.all(
        winners.map((entry, index) => {
          const position = index + 1
          const prizeId = prizeMap?.get(position) || null

          return tx.winner.create({
            data: {
              drawId: newDraw.id,
              entryId: entry.id,
              position,
              prizeId,
            },
            include: {
              entry: true,
              prize: true,
            },
          })
        })
      )

      return {
        ...newDraw,
        winners: winnerRecords,
      }
    })

    return NextResponse.json(draw, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error running draw:', error)
    return NextResponse.json(
      { error: 'Failed to run draw' },
      { status: 500 }
    )
  }
}

// DELETE /api/draws - Delete all draws and winners (reset draw history)
export async function DELETE(request: NextRequest) {
  try {
    // Check API key for security
    if (!checkApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete all draws (winners will be cascade deleted)
    const result = await prisma.draw.deleteMany({})

    return NextResponse.json({ 
      success: true,
      deletedCount: result.count 
    })
  } catch (error) {
    console.error('Error deleting all draws:', error)
    return NextResponse.json(
      { error: 'Failed to reset draws' },
      { status: 500 }
    )
  }
}

