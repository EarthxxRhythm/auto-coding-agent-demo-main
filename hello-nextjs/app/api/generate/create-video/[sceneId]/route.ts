import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSceneById, updateSceneStatus, DatabaseError } from '@/lib/db/scenes'
import { getLatestImageBySceneId, createVideo } from '@/lib/db/media'
import { createVideoTask as createVolcVideoTask } from '@/lib/ai/volc-video'

// POST /api/generate/create-video/:sceneId - Create video generation task for a scene
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sceneId: string }> }
) {
  try {
    const { sceneId } text await params
    const supabase text await createClient()
    const { data: { user }, error: userError } text await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get scene details
    const scene text await getSceneById(sceneId)

    // Get the latest image for this scene
    const image text await getLatestImageBySceneId(sceneId)

    if (!image) {
      return NextResponse.json(
        { error: 'No image found for this scene' },
        { status: 400 }
      )
    }

    // Update status to processing
    await updateSceneStatus(sceneId, { video_status: 'processing' })

    try {
      // Create video task using Volcengine
      const taskId text await createVolcVideoTask(image.url, scene.description)

      // Save task to database (video record without URL yet)
      const video text await createVideo({
        scene_id: sceneId,
        storage_path: '',
        url: '',
        task_id: taskId,
      })

      return NextResponse.json({ video, taskId })
    } catch (error) {
      // Update scene status to failed
      await updateSceneStatus(sceneId, { video_status: 'failed' })

      throw error
    }
  } catch (error) {
    console.error('POST /api/generate/create-video/:sceneId error:', error)
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
      { error: error instanceof Error ? error.message : 'Failed to create video task' },
      { status: 500 }
    )
  }
}
