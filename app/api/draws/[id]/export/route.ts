import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/draws/[id]/export - Export winners as CSV
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

    // Generate CSV
    const headers = ['Position', 'Name', 'Email', 'Weight']
    const rows = draw.winners.map((winner) => [
      winner.position.toString(),
      winner.entry.name,
      winner.entry.email || '',
      winner.entry.weight.toString(),
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="draw-${draw.id}-winners.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting draw:', error)
    return NextResponse.json(
      { error: 'Failed to export draw' },
      { status: 500 }
    )
  }
}



