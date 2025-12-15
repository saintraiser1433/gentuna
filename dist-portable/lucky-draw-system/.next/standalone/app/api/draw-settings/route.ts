import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Load draw settings
export async function GET() {
  try {
    // Get the most recent draw settings
    const settings = await prisma.drawSettings.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    })

    if (!settings) {
      return NextResponse.json({ 
        prizeAssignments: [] 
      })
    }

    // Parse JSON string from SQLite
    const prizeAssignments = typeof settings.prizeAssignments === 'string' 
      ? JSON.parse(settings.prizeAssignments)
      : settings.prizeAssignments

    return NextResponse.json({
      prizeAssignments: prizeAssignments as Array<{ prizeId: string; count: number; bulkEnabled?: boolean; autoDraw?: boolean; autoDrawDelay?: number }>,
    })
  } catch (error) {
    console.error('Error fetching draw settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch draw settings' },
      { status: 500 }
    )
  }
}

// POST - Save draw settings
export async function POST(request: NextRequest) {
  try {
    // Check if drawSettings model exists in Prisma client
    if (!prisma.drawSettings) {
      return NextResponse.json(
        { error: 'Prisma client not updated. Please stop the dev server, run "npx prisma generate", then restart the server.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { prizeAssignments } = body

    if (!Array.isArray(prizeAssignments)) {
      return NextResponse.json(
        { error: 'Invalid prizeAssignments format' },
        { status: 400 }
      )
    }

    // Use upsert pattern: delete all existing, then create new one
    // This ensures we only have one active configuration
    try {
      await prisma.drawSettings.deleteMany({})
    } catch (deleteError) {
      // If delete fails (e.g., table doesn't exist), that's okay, we'll create it
      console.log('Note: Could not delete existing settings (table may not exist yet):', deleteError)
    }

    // Stringify JSON for SQLite storage
    const settings = await prisma.drawSettings.create({
      data: {
        prizeAssignments: JSON.stringify(prizeAssignments),
      },
    })

    // Parse JSON string from SQLite for response
    const parsedAssignments = typeof settings.prizeAssignments === 'string'
      ? JSON.parse(settings.prizeAssignments)
      : settings.prizeAssignments

    return NextResponse.json({
      prizeAssignments: parsedAssignments as Array<{ prizeId: string; count: number; bulkEnabled?: boolean; autoDraw?: boolean; autoDrawDelay?: number }>,
    })
  } catch (error) {
    console.error('Error saving draw settings:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    // Check if it's a table doesn't exist error
    if (errorMessage.includes('does not exist') || errorMessage.includes('Unknown model')) {
      return NextResponse.json(
        { error: 'Database table not found. Please run: npx prisma db push' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: `Failed to save draw settings: ${errorMessage}` },
      { status: 500 }
    )
  }
}

