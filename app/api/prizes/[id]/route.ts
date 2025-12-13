import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updatePrizeSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  value: z.number().positive().optional(),
  position: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

// GET /api/prizes/[id] - Get a specific prize
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const prize = await prisma.prize.findUnique({
      where: { id },
      include: {
        winners: {
          include: {
            draw: true,
            entry: true,
          },
        },
        _count: {
          select: { winners: true },
        },
      },
    })

    if (!prize) {
      return NextResponse.json(
        { error: 'Prize not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(prize)
  } catch (error) {
    console.error('Error fetching prize:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prize' },
      { status: 500 }
    )
  }
}

// PATCH /api/prizes/[id] - Update a prize
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const validatedData = updatePrizeSchema.parse(body)

    const prize = await prisma.prize.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name.trim() }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description?.trim() || null,
        }),
        ...(validatedData.value && { value: validatedData.value }),
        ...(validatedData.position !== undefined && {
          position: validatedData.position || null,
        }),
        ...(validatedData.imageUrl !== undefined && {
          imageUrl: validatedData.imageUrl?.trim() || null,
        }),
      },
    })

    return NextResponse.json(prize)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating prize:', error)
    return NextResponse.json(
      { error: 'Failed to update prize' },
      { status: 500 }
    )
  }
}

// DELETE /api/prizes/[id] - Delete a prize
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.prize.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prize:', error)
    return NextResponse.json(
      { error: 'Failed to delete prize' },
      { status: 500 }
    )
  }
}



