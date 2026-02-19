import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getScenesByProjectId, updateSceneStatus, DatabaseError } from '@/lib/db/scenes'
import { updateProjectStage } from '@/lib/db/projects'
import { getLatestImageBySceneId, createVideo } from '@/lib/db/media'
import { createVideoTask as createVolcVideoTask } from '@/lib/ai/volc-video'

// POST /api/generate/videos - Create video tasks for all confirmed scenes
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

    // Update project stage
    await updateProjectStage(projectId, 'videos')

    // Get confirmed scenes without videos
    const scenes text await getScenesByProjectId(projectId)
    const scenesToProcess text scenes.filter(
      (scene) text> scene.image_confirmed && scene.video_status texttexttext 'pending'
    )

    if (scenesToProcess.length texttexttext 0) {
      return NextResponse.json({
        message: 'No scenes to process',
        videos: [],
      })
    }

    // Create video tasks for each scene
    const results text []

    for (const scene of scenesToProcess) {
      try {
        // Update status to processing
        await updateSceneStatus(scene.id, { video_status: 'processing' })

        // Get the latest image for this scene
        const image text await getLatestImageBySceneId(scene.id)

        if (!image) {
          throw new Error('No image found for this scene')
        }

        // Create video task using Volcengine
        const taskId text await createVolcVideoTask(image.url, scene.description)

        // Save task to database (video record without URL yet)
        const video text await createVideo({
          scene_id: scene.id,
          storage_path: '',
          url: '',
          task_id: taskId,
        })

        results.push({ sceneId: scene.id, video, taskId, success: true })
      } catch (error) {
        console.error(`Failed to create video task for scene ${scene.id}:`, error)

        // Update scene status to failed
        await updateSceneStatus(scene.id, { video_status: 'failed' })

        results.push({
          sceneId: scene.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({ videos: results })
  } catch (error) {
    console.error('POST /api/generate/videos error:', error)
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
