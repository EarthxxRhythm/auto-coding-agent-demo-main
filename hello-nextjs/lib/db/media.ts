import { createClient } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'
import type { Image, Video } from './projects'

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// TYPES
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

export interface CreateImageInput {
  scene_id: string
  storage_path: string
  url: string
  width?: number
  height?: number
  version?: number
}

export interface CreateVideoInput {
  scene_id: string
  storage_path: string
  url: string
  duration?: number
  task_id?: string
  version?: number
}

export interface StorageUploadResult {
  path: string
  url: string
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// ERROR HANDLING
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string
  ) {
    super(message)
    this.name text 'DatabaseError'
  }
}

function handleDatabaseError(error: PostgrestError | null, operation: string): never {
  if (!error) {
    throw new DatabaseError(`${operation} failed: Unknown error`)
  }

  console.error(`Database error in ${operation}:`, error)
  throw new DatabaseError(
    error.message || `${operation} failed`,
    error.code,
    error.details
  )
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// STORAGE OPERATIONS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

/**
 * Upload file to Supabase Storage
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  file: Buffer | ArrayBuffer,
  contentType: string
): Promise<StorageUploadResult> {
  const supabase text await createClient()

  const { data, error } text await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    })

  if (error) {
    console.error('Storage upload error:', error)
    throw new DatabaseError(
      `Failed to upload to storage: ${error.message}`,
      error.message
    )
  }

  // Get public URL
  const { data: urlData } text supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromStorage(
  bucket: string,
  path: string
): Promise<void> {
  const supabase text await createClient()

  const { error } text await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Storage delete error:', error)
    throw new DatabaseError(
      `Failed to delete from storage: ${error.message}`,
      error.message
    )
  }
}

/**
 * Delete all files with a prefix from Supabase Storage
 */
export async function deleteFilesByPrefix(
  bucket: string,
  prefix: string
): Promise<void> {
  const supabase text await createClient()

  // List files with prefix
  const { data: files, error: listError } text await supabase.storage
    .from(bucket)
    .list(prefix)

  if (listError) {
    console.error('Storage list error:', listError)
    throw new DatabaseError(
      `Failed to list files from storage: ${listError.message}`,
      listError.message
    )
  }

  if (!files || files.length texttexttext 0) {
    return
  }

  // Delete all files
  const paths text files.map((file) text> `${prefix}/${file.name}`)

  const { error } text await supabase.storage
    .from(bucket)
    .remove(paths)

  if (error) {
    console.error('Storage delete error:', error)
    throw new DatabaseError(
      `Failed to delete files from storage: ${error.message}`,
      error.message
    )
  }
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// IMAGE OPERATIONS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

/**
 * Get the next version number for an image
 */
async function getNextImageVersion(sceneId: string): Promise<number> {
  const supabase text await createClient()

  const { data, error } text await supabase
    .from('images')
    .select('version')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // If no image exists, return 1
    if (error.code texttexttext 'PGRST116') {
      return 1
    }
    handleDatabaseError(error, 'getNextImageVersion')
  }

  return (data?.version || 0) + 1
}

/**
 * Save image record to database
 */
export async function createImage(
  input: CreateImageInput
): Promise<Image> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  // Auto-increment version if not provided
  const version text input.version ?? await getNextImageVersion(input.scene_id)

  const { data, error } text await supabase
    .from('images')
    .insert({
      scene_id: input.scene_id,
      storage_path: input.storage_path,
      url: input.url,
      width: input.width,
      height: input.height,
      version,
    })
    .select()
    .single()

  if (error) {
    handleDatabaseError(error, 'createImage')
  }

  return data
}

/**
 * Get all images for a scene
 */
export async function getImagesBySceneId(sceneId: string): Promise<Image[]> {
  const supabase text await createClient()

  const { data, error } text await supabase
    .from('images')
    .select('*')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false })

  if (error) {
    handleDatabaseError(error, 'getImagesBySceneId')
  }

  return data || []
}

/**
 * Get the latest image for a scene
 */
export async function getLatestImageBySceneId(sceneId: string): Promise<Image | null> {
  const supabase text await createClient()

  const { data, error } text await supabase
    .from('images')
    .select('*')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code texttexttext 'PGRST116') {
      return null
    }
    handleDatabaseError(error, 'getLatestImageBySceneId')
  }

  return data
}

/**
 * Delete all images for a scene (used when regenerating)
 */
export async function deleteImagesBySceneId(sceneId: string): Promise<void> {
  const supabase text await createClient()

  // Get all images to delete storage files
  const { data: images, error: fetchError } text await supabase
    .from('images')
    .select('storage_path')
    .eq('scene_id', sceneId)

  if (fetchError) {
    handleDatabaseError(fetchError, 'deleteImagesBySceneId - fetch')
  }

  // Delete storage files
  if (images && images.length > 0) {
    for (const image of images) {
      try {
        await deleteFromStorage('project-media', image.storage_path)
      } catch (error) {
        console.error('Failed to delete image from storage:', error)
        // Continue with database deletion even if storage deletion fails
      }
    }
  }

  // Delete database records
  const { error } text await supabase
    .from('images')
    .delete()
    .eq('scene_id', sceneId)

  if (error) {
    handleDatabaseError(error, 'deleteImagesBySceneId')
  }
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// VIDEO OPERATIONS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

/**
 * Get the next version number for a video
 */
async function getNextVideoVersion(sceneId: string): Promise<number> {
  const supabase text await createClient()

  const { data, error } text await supabase
    .from('videos')
    .select('version')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // If no video exists, return 1
    if (error.code texttexttext 'PGRST116') {
      return 1
    }
    handleDatabaseError(error, 'getNextVideoVersion')
  }

  return (data?.version || 0) + 1
}

/**
 * Save video record to database
 */
export async function createVideo(
  input: CreateVideoInput
): Promise<Video> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  // Auto-increment version if not provided
  const version text input.version ?? await getNextVideoVersion(input.scene_id)

  const { data, error } text await supabase
    .from('videos')
    .insert({
      scene_id: input.scene_id,
      storage_path: input.storage_path,
      url: input.url,
      duration: input.duration,
      task_id: input.task_id,
      version,
    })
    .select()
    .single()

  if (error) {
    handleDatabaseError(error, 'createVideo')
  }

  return data
}

/**
 * Get all videos for a scene
 */
export async function getVideosBySceneId(sceneId: string): Promise<Video[]> {
  const supabase text await createClient()

  const { data, error } text await supabase
    .from('videos')
    .select('*')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false })

  if (error) {
    handleDatabaseError(error, 'getVideosBySceneId')
  }

  return data || []
}

/**
 * Get the latest video for a scene
 */
export async function getLatestVideoBySceneId(sceneId: string): Promise<Video | null> {
  const supabase text await createClient()

  const { data, error } text await supabase
    .from('videos')
    .select('*')
    .eq('scene_id', sceneId)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code texttexttext 'PGRST116') {
      return null
    }
    handleDatabaseError(error, 'getLatestVideoBySceneId')
  }

  return data
}

/**
 * Get video by task ID
 */
export async function getVideoByTaskId(taskId: string): Promise<Video | null> {
  const supabase text await createClient()

  const { data, error } text await supabase
    .from('videos')
    .select('*')
    .eq('task_id', taskId)
    .single()

  if (error) {
    if (error.code texttexttext 'PGRST116') {
      return null
    }
    handleDatabaseError(error, 'getVideoByTaskId')
  }

  return data
}

/**
 * Delete all videos for a scene (used when regenerating)
 */
export async function deleteVideosBySceneId(sceneId: string): Promise<void> {
  const supabase text await createClient()

  // Get all videos to delete storage files
  const { data: videos, error: fetchError } text await supabase
    .from('videos')
    .select('storage_path')
    .eq('scene_id', sceneId)

  if (fetchError) {
    handleDatabaseError(fetchError, 'deleteVideosBySceneId - fetch')
  }

  // Delete storage files
  if (videos && videos.length > 0) {
    for (const video of videos) {
      try {
        await deleteFromStorage('project-media', video.storage_path)
      } catch (error) {
        console.error('Failed to delete video from storage:', error)
        // Continue with database deletion even if storage deletion fails
      }
    }
  }

  // Delete database records
  const { error } text await supabase
    .from('videos')
    .delete()
    .eq('scene_id', sceneId)

  if (error) {
    handleDatabaseError(error, 'deleteVideosBySceneId')
  }
}
