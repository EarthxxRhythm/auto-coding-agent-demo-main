import { NextRequest, NextResponse } from 'next/server'
import { updateSceneDescription, DatabaseError } from '@/lib/db/scenes'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/scenes/:id - Update scene description
export async function PATCH(
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

    const body text await request.json()
    const { description } text body

    if (!description) {
      return NextResponse.json(
        { error: 'Missing required field: description' },
        { status: 400 }
      )
    }

    const scene text await updateSceneDescription(id, { description })

    return NextResponse.json({ scene })
  } catch (error) {
    console.error('PATCH /api/scenes/:id error:', error)
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
