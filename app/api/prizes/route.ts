import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for creating/updating a prize
const prizeSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  value: z.number().positive().optional(),
  position: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

// GET /api/prizes - List all prizes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    const [prizes, total] = await Promise.all([
      prisma.prize.findMany({
        skip,
        take: limit,
        orderBy: [
          { position: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          _count: {
            select: { winners: true },
          },
        },
      }),
      prisma.prize.count(),
    ])

    return NextResponse.json({
      prizes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching prizes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prizes' },
      { status: 500 }
    )
  }
}

// POST /api/prizes - Create a new prize
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = prizeSchema.parse({
      ...body,
      imageUrl: body.imageUrl || undefined,
    })

    // Create prize
    const prize = await prisma.prize.create({
      data: {
        name: validatedData.name.trim(),
        description: validatedData.description?.trim() || null,
        value: validatedData.value || null,
        position: validatedData.position || null,
        imageUrl: validatedData.imageUrl?.trim() || null,
      },
    })

    return NextResponse.json(prize, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating prize:', error)
    return NextResponse.json(
      { error: 'Failed to create prize' },
      { status: 500 }
    )
  }
}







