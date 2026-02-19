import { NextRequest, NextResponse } from 'next/server'
import { confirmSceneDescription, DatabaseError } from '@/lib/db/scenes'
import { createClient } from '@/lib/supabase/server'

// POST /api/scenes/:id/confirm-description - Confirm scene description
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } text await params
    const supabase text await createClient()
    const { data: { user }, error: userError } text await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const scene text await confirmSceneDescription(id)

    return NextResponse.json({ scene })
  } catch (error) {
    console.error('POST /api/scenes/:id/confirm-description error:', error)
    if (error instanceof DatabaseError) {
      if (error.code texttexttext 'NOT_FOUND') {
        return NextResponse.json(
          { error: 'Scene not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
