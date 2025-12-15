import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/draws/[id] - Get a specific draw with winners
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const draw = await prisma.draw.findUnique({
      where: { id },
      include: {
        winners: {
          include: {
            entry: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!draw) {
      return NextResponse.json(
        { error: 'Draw not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(draw)
  } catch (error) {
    console.error('Error fetching draw:', error)
    return NextResponse.json(
      { error: 'Failed to fetch draw' },
      { status: 500 }
    )
  }
}

// DELETE /api/draws/[id] - Delete a draw (and its winners)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.draw.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting draw:', error)
    return NextResponse.json(
      { error: 'Failed to delete draw' },
      { status: 500 }
    )
  }
}





