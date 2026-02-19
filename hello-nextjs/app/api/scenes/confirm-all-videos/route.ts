import { NextRequest, NextResponse } from 'next/server'
import { confirmAllVideos, DatabaseError } from '@/lib/db/scenes'
import { updateProjectStage } from '@/lib/db/projects'
import { createClient } from '@/lib/supabase/server'

// POST /api/scenes/confirm-all-videos - Confirm all scene videos
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

    await confirmAllVideos(projectId)

    // Update project stage to completed
    await updateProjectStage(projectId, 'completed')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/scenes/confirm-all-videos error:', error)
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
