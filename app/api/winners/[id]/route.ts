import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/winners/[id] - Update winner status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['present', 'not_present'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "present" or "not_present"' },
        { status: 400 }
      )
    }

    const winner = await prisma.winner.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true, winner })
  } catch (error) {
    console.error('Error updating winner status:', error)
    return NextResponse.json(
      { error: 'Failed to update winner status' },
      { status: 500 }
    )
  }
}

// DELETE /api/winners/[id] - Delete a winner (kept for backward compatibility)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.winner.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting winner:', error)
    return NextResponse.json(
      { error: 'Failed to delete winner' },
      { status: 500 }
    )
  }
}

