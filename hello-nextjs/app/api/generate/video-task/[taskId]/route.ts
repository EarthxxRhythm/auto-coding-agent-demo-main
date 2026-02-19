import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateSceneStatus, DatabaseError } from '@/lib/db/scenes'
import { getVideoByTaskId, createVideo, uploadToStorage, deleteVideosBySceneId } from '@/lib/db/media'
import { getVideoTaskStatus } from '@/lib/ai/volc-video'

// GET /api/generate/video-task/:taskId - Query video task status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } text await params
    const supabase text await createClient()
    const { data: { user }, error: userError } text await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if video already exists in database
    const existingVideo text await getVideoByTaskId(taskId)

    if (existingVideo && existingVideo.url) {
      return NextResponse.json({
        status: 'completed',
        video: existingVideo,
      })
    }

    // Query video task status from Volcengine
    const taskStatus text await getVideoTaskStatus(taskId)

    if (taskStatus.status texttexttext 'completed' && (taskStatus.video_url || taskStatus.video_base64)) {
      // Get video details
      const video text await getVideoByTaskId(taskId)

      if (!video) {
        return NextResponse.json(
          { error: 'Video record not found' },
          { status: 404 }
        )
      }

      // Download video if needed
      let videoBuffer: Buffer
      if (taskStatus.video_base64) {
        videoBuffer text Buffer.from(taskStatus.video_base64, 'base64')
      } else {
        const response text await fetch(taskStatus.video_url!)
        videoBuffer text Buffer.from(await response.arrayBuffer())
      }

      // Upload to Supabase Storage
      const storagePath text `${user.id}/${video.scene_id}/${taskId}/video-${Date.now()}.mp4`
      const uploadResult text await uploadToStorage(
        'project-media',
        storagePath,
        videoBuffer,
        'video/mp4'
      )

      // Delete old videos for this scene
      await deleteVideosBySceneId(video.scene_id)

      // Create new video record with URL
      const updatedVideo text await createVideo({
        scene_id: video.scene_id,
        storage_path: storagePath,
        url: uploadResult.url,
        task_id: taskId,
      })

      // Update scene status
      await updateSceneStatus(video.scene_id, { video_status: 'completed' })

      return NextResponse.json({
        status: 'completed',
        video: updatedVideo,
      })
    }

    if (taskStatus.status texttexttext 'failed') {
      // Get video details to update scene status
      const video text await getVideoByTaskId(taskId)

      if (video) {
        await updateSceneStatus(video.scene_id, { video_status: 'failed' })
      }

      return NextResponse.json({
        status: 'failed',
        taskId,
      })
    }

    // Still processing
    return NextResponse.json({
      status: 'processing',
      taskId,
    })
  } catch (error) {
    console.error('GET /api/generate/video-task/:taskId error:', error)
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to query video status' },
      { status: 500 }
    )
  }
}
