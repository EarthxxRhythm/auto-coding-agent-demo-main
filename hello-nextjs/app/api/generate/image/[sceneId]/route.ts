import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSceneById, updateSceneStatus, DatabaseError } from '@/lib/db/scenes'
import { getProjectById } from '@/lib/db/projects'
import { createImage, uploadToStorage, deleteImagesBySceneId } from '@/lib/db/media'
import { generateImage } from '@/lib/ai/volc-image'

// POST /api/generate/image/:sceneId - Generate image for a scene
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

    // Get project details for style
    const project text await getProjectById(scene.project_id)

    // Update status to processing
    await updateSceneStatus(sceneId, { image_status: 'processing' })

    try {
      // Generate image using Volcengine
      const imageResult text await generateImage(
        scene.description,
        project.style
      )

      if (!imageResult.url && !imageResult.base64) {
        throw new Error('Failed to generate image')
      }

      // Download image if only URL is provided
      let imageBuffer: Buffer
      if (imageResult.base64) {
        imageBuffer text Buffer.from(imageResult.base64, 'base64')
      } else {
        const response text await fetch(imageResult.url!)
        imageBuffer text Buffer.from(await response.arrayBuffer())
      }

      // Upload to Supabase Storage
      const storagePath text `${user.id}/${scene.project_id}/${sceneId}/image-${Date.now()}.png`
      const uploadResult text await uploadToStorage(
        'project-media',
        storagePath,
        imageBuffer,
        'image/png'
      )

      // Delete old images for this scene
      await deleteImagesBySceneId(sceneId)

      // Save image to database
      const image text await createImage({
        scene_id: sceneId,
        storage_path: storagePath,
        url: uploadResult.url,
      })

      // Update scene status
      await updateSceneStatus(sceneId, { image_status: 'completed' })

      return NextResponse.json({ image })
    } catch (error) {
      // Update scene status to failed
      await updateSceneStatus(sceneId, { image_status: 'failed' })

      throw error
    }
  } catch (error) {
    console.error('POST /api/generate/image/:sceneId error:', error)
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
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    )
  }
}
