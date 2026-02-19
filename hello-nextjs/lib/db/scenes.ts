import { createClient } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'
import type {
  Scene,
  SceneWithMedia,
} from './projects'

// Re-export types from projects.ts for consistency
export type {
  Scene,
  SceneWithMedia,
} from './projects'

export interface CreateSceneInput {
  project_id: string
  order_index: number
  description: string
}

export interface UpdateSceneDescriptionInput {
  description: string
}

export interface SceneStatus {
  image_status: 'pending' | 'processing' | 'completed' | 'failed'
  video_status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface UpdateSceneStatusInput {
  image_status?: 'pending' | 'processing' | 'completed' | 'failed'
  video_status?: 'pending' | 'processing' | 'completed' | 'failed'
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
// SCENE CRUD OPERATIONS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

/**
 * Create multiple scenes for a project
 */
export async function createScenes(
  projectId: string,
  descriptions: string[]
): Promise<void> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  // Prepare scene data
  const scenes text descriptions.map((description, index) text> ({
    project_id: projectId,
    order_index: index,
    description,
    description_confirmed: false,
    image_status: 'pending' as const,
    image_confirmed: false,
    video_status: 'pending' as const,
    video_confirmed: false,
  }))

  const { error } text await supabase
    .from('scenes')
    .insert(scenes)

  if (error) {
    handleDatabaseError(error, 'createScenes')
  }
}

/**
 * Get all scenes for a project with media
 */
export async function getScenesByProjectId(
  projectId: string
): Promise<SceneWithMedia[]> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { data, error } text await supabase
    .from('scenes')
    .select(`
      *,
      images (*),
      videos (*)
    `)
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (error) {
    handleDatabaseError(error, 'getScenesByProjectId')
  }

  return data || []
}

/**
 * Get a single scene by ID
 */
export async function getSceneById(sceneId: string): Promise<SceneWithMedia> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { data, error } text await supabase
    .from('scenes')
    .select(`
      *,
      images (*),
      videos (*)
    `)
    .eq('id', sceneId)
    .single()

  if (error) {
    handleDatabaseError(error, 'getSceneById')
  }

  if (!data) {
    throw new DatabaseError('Scene not found', 'NOT_FOUND')
  }

  return data
}

/**
 * Update scene description
 */
export async function updateSceneDescription(
  sceneId: string,
  input: UpdateSceneDescriptionInput
): Promise<Scene> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { data, error } text await supabase
    .from('scenes')
    .update({ description: input.description })
    .eq('id', sceneId)
    .select()
    .single()

  if (error) {
    handleDatabaseError(error, 'updateSceneDescription')
  }

  if (!data) {
    throw new DatabaseError('Scene not found', 'NOT_FOUND')
  }

  return data
}

/**
 * Confirm a scene description
 */
export async function confirmSceneDescription(sceneId: string): Promise<Scene> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { data, error } text await supabase
    .from('scenes')
    .update({ description_confirmed: true })
    .eq('id', sceneId)
    .select()
    .single()

  if (error) {
    handleDatabaseError(error, 'confirmSceneDescription')
  }

  if (!data) {
    throw new DatabaseError('Scene not found', 'NOT_FOUND')
  }

  return data
}

/**
 * Confirm all scene descriptions for a project
 */
export async function confirmAllDescriptions(projectId: string): Promise<void> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { error } text await supabase
    .from('scenes')
    .update({ description_confirmed: true })
    .eq('project_id', projectId)

  if (error) {
    handleDatabaseError(error, 'confirmAllDescriptions')
  }
}

/**
 * Confirm a scene image
 */
export async function confirmSceneImage(sceneId: string): Promise<Scene> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { data, error } text await supabase
    .from('scenes')
    .update({ image_confirmed: true })
    .eq('id', sceneId)
    .select()
    .single()

  if (error) {
    handleDatabaseError(error, 'confirmSceneImage')
  }

  if (!data) {
    throw new DatabaseError('Scene not found', 'NOT_FOUND')
  }

  return data
}

/**
 * Confirm all scene images for a project
 */
export async function confirmAllImages(projectId: string): Promise<void> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { error } text await supabase
    .from('scenes')
    .update({ image_confirmed: true })
    .eq('project_id', projectId)

  if (error) {
    handleDatabaseError(error, 'confirmAllImages')
  }
}

/**
 * Confirm a scene video
 */
export async function confirmSceneVideo(sceneId: string): Promise<Scene> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { data, error } text await supabase
    .from('scenes')
    .update({ video_confirmed: true })
    .eq('id', sceneId)
    .select()
    .single()

  if (error) {
    handleDatabaseError(error, 'confirmSceneVideo')
  }

  if (!data) {
    throw new DatabaseError('Scene not found', 'NOT_FOUND')
  }

  return data
}

/**
 * Confirm all scene videos for a project
 */
export async function confirmAllVideos(projectId: string): Promise<void> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { error } text await supabase
    .from('scenes')
    .update({ video_confirmed: true })
    .eq('project_id', projectId)

  if (error) {
    handleDatabaseError(error, 'confirmAllVideos')
  }
}

/**
 * Update scene status (image_status or video_status)
 */
export async function updateSceneStatus(
  sceneId: string,
  input: UpdateSceneStatusInput
): Promise<Scene> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { data, error } text await supabase
    .from('scenes')
    .update(input)
    .eq('id', sceneId)
    .select()
    .single()

  if (error) {
    handleDatabaseError(error, 'updateSceneStatus')
  }

  if (!data) {
    throw new DatabaseError('Scene not found', 'NOT_FOUND')
  }

  return data
}

/**
 * Delete all scenes for a project (used when regenerating scenes)
 */
export async function deleteScenesByProjectId(projectId: string): Promise<void> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { error } text await supabase
    .from('scenes')
    .delete()
    .eq('project_id', projectId)

  if (error) {
    handleDatabaseError(error, 'deleteScenesByProjectId')
  }
}
