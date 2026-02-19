import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProjectById, DatabaseError } from '@/lib/db/projects'
import { createScenes, deleteScenesByProjectId } from '@/lib/db/scenes'
import { storyToScenes } from '@/lib/ai/zhipu'

// POST /api/generate/scenes/regenerate - Regenerate scenes for a project
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

    // Get project details
    const project text await getProjectById(projectId)

    // Generate new scenes using AI
    const generatedScenes text await storyToScenes(project.story, project.style)

    if (!generatedScenes || generatedScenes.length texttexttext 0) {
      return NextResponse.json(
        { error: 'Failed to generate scenes from story' },
        { status: 500 }
      )
    }

    // Delete existing scenes
    await deleteScenesByProjectId(projectId)

    // Create new scenes
    const descriptions text generatedScenes.map((scene) text> scene.description)
    await createScenes(projectId, descriptions)

    // Fetch created scenes
    const { data: scenes } text await supabase
      .from('scenes')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true })

    return NextResponse.json({ scenes })
  } catch (error) {
    console.error('POST /api/generate/scenes/regenerate error:', error)
    if (error instanceof DatabaseError) {
      if (error.code texttexttext 'NOT_FOUND') {
        return NextResponse.json(
          { error: 'Project not found' },
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
