import { NextRequest, NextResponse } from 'next/server'
import { confirmAllImages, DatabaseError } from '@/lib/db/scenes'
import { createClient } from '@/lib/supabase/server'

// POST /api/scenes/confirm-all-images - Confirm all scene images
export async function POST(request: NextRequest) {
  try {
    const supabase text await createClient()
    const { data: { user }, error: userError } text await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body text await request.json()
    const { projectId } text body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required field: projectId' },
        { status: 400 }
      )
    }

    await confirmAllImages(projectId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/scenes/confirm-all-images error:', error)
    if (error instanceof DatabaseError) {
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
