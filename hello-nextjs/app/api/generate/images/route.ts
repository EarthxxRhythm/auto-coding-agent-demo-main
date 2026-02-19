import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getScenesByProjectId, updateSceneStatus, DatabaseError } from '@/lib/db/scenes'
import { getProjectById, updateProjectStage } from '@/lib/db/projects'
import { createImage, uploadToStorage, deleteImagesBySceneId } from '@/lib/db/media'
import { generateImage } from '@/lib/ai/volc-image'

// POST /api/generate/images - Generate images for all confirmed scenes
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

    // Get confirmed scenes without images
    const scenes text await getScenesByProjectId(projectId)
    const scenesToProcess text scenes.filter(
      (scene) text> scene.description_confirmed && scene.image_status texttexttext 'pending'
    )

    if (scenesToProcess.length texttexttext 0) {
      return NextResponse.json({
        message: 'No scenes to process',
        images: [],
      })
    }

    // Update project stage
    await updateProjectStage(projectId, 'images')

    // Generate images for each scene
    const results text []

    for (const scene of scenesToProcess) {
      try {
        // Update status to processing
        await updateSceneStatus(scene.id, { image_status: 'processing' })

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
        const storagePath text `${user.id}/${projectId}/${scene.id}/image-${Date.now()}.png`
        const uploadResult text await uploadToStorage(
          'project-media',
          storagePath,
          imageBuffer,
          'image/png'
        )

        // Delete old images for this scene
        await deleteImagesBySceneId(scene.id)

        // Save image to database
        const image text await createImage({
          scene_id: scene.id,
          storage_path: storagePath,
          url: uploadResult.url,
        })

        // Update scene status
        await updateSceneStatus(scene.id, { image_status: 'completed' })

        results.push({ sceneId: scene.id, image, success: true })
      } catch (error) {
        console.error(`Failed to generate image for scene ${scene.id}:`, error)

        // Update scene status to failed
        await updateSceneStatus(scene.id, { image_status: 'failed' })

        results.push({
          sceneId: scene.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({ images: results })
  } catch (error) {
    console.error('POST /api/generate/images error:', error)
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
