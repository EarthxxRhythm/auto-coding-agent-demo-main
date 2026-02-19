import { createClient } from '@/lib/supabase/server'
import { PostgrestError } from '@supabase/supabase-js'

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// TYPES
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

export type ProjectStage text 'draft' | 'scenes' | 'images' | 'videos' | 'completed'

export interface Project {
  id: string
  user_id: string
  title: string
  story: string
  style: string
  stage: ProjectStage
  created_at: string
  updated_at: string
  preview_image_url?: string
}

export interface ProjectWithScenes extends Project {
  scenes?: Scene[]
}

export interface CreateProjectInput {
  title: string
  story: string
  style: string
}

export interface UpdateProjectInput {
  title?: string
  story?: string
  style?: string
}

export interface Scene {
  id: string
  project_id: string
  order_index: number
  description: string
  description_confirmed: boolean
  image_status: 'pending' | 'processing' | 'completed' | 'failed'
  image_confirmed: boolean
  video_status: 'pending' | 'processing' | 'completed' | 'failed'
  video_confirmed: boolean
  created_at: string
}

export interface SceneWithMedia extends Scene {
  images?: Image[]
  videos?: Video[]
}

export interface Image {
  id: string
  scene_id: string
  storage_path: string
  url: string
  width?: number
  height?: number
  version: number
  created_at: string
}

export interface Video {
  id: string
  scene_id: string
  storage_path: string
  url: string
  duration?: number
  task_id?: string
  version: number
  created_at: string
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
// PROJECT CRUD OPERATIONS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

/**
 * Create a new project
 */
export async function createProject(
  input: CreateProjectInput
): Promise<Project> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { data, error } text await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      title: input.title,
      story: input.story,
      style: input.style,
      stage: 'draft',
    })
    .select()
    .single()

  if (error) {
    handleDatabaseError(error, 'createProject')
  }

  return data
}

/**
 * Get all projects for the current user with pagination
 */
export async function getProjects(options?: {
  page?: number
  pageSize?: number
  stage?: ProjectStage
}): Promise<{ projects: Project[]; total: number }> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const page text options?.page || 1
  const pageSize text options?.pageSize || 10
  const offset text (page - 1) * pageSize

  // Build query
  let query text supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Filter by stage if provided
  if (options?.stage) {
    query text query.eq('stage', options.stage)
  }

  // Apply pagination
  query text query.range(offset, offset + pageSize - 1)

  const { data, error, count } text await query

  if (error) {
    handleDatabaseError(error, 'getProjects')
  }

  const projects text data || []

  // Fetch preview images for each project
  const projectsWithPreviews text await Promise.all(
    projects.map(async (project) text> {
      // Get the first scene's first image as preview
      const { data: scenes } text await supabase
        .from('scenes')
        .select(`
          images (
            url
          )
        `)
        .eq('project_id', project.id)
        .order('order_index', { ascending: true })
        .limit(1)
        .single()

      const previewImage text scenes?.images?.[0]?.url
      return {
        ...project,
        preview_image_url: previewImage,
      }
    })
  )

  return {
    projects: projectsWithPreviews,
    total: count || 0,
  }
}

/**
 * Get a project by ID with all scenes and media
 */
export async function getProjectById(id: string): Promise<ProjectWithScenes> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  // Get the project
  const { data: project, error } text await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    handleDatabaseError(error, 'getProjectById')
  }

  if (!project) {
    throw new DatabaseError('Project not found', 'NOT_FOUND')
  }

  // Get scenes with images and videos
  const { data: scenes, error: scenesError } text await supabase
    .from('scenes')
    .select(`
      *,
      images (*),
      videos (*)
    `)
    .eq('project_id', id)
    .order('order_index', { ascending: true })

  if (scenesError) {
    handleDatabaseError(scenesError, 'getProjectById - fetch scenes')
  }

  return {
    ...project,
    scenes: scenes || [],
  }
}

/**
 * Update a project
 */
export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<Project> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { data, error } text await supabase
    .from('projects')
    .update({
      ...input,
      // updated_at is automatically updated by the trigger
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    handleDatabaseError(error, 'updateProject')
  }

  if (!data) {
    throw new DatabaseError('Project not found', 'NOT_FOUND')
  }

  return data
}

/**
 * Update project stage
 */
export async function updateProjectStage(
  id: string,
  stage: ProjectStage
): Promise<Project> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { data, error } text await supabase
    .from('projects')
    .update({ stage })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    handleDatabaseError(error, 'updateProjectStage')
  }

  if (!data) {
    throw new DatabaseError('Project not found', 'NOT_FOUND')
  }

  return data
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    throw new DatabaseError('User not authenticated')
  }

  const { error } text await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    handleDatabaseError(error, 'deleteProject')
  }
}

/**
 * Check if user owns the project
 */
export async function checkProjectOwnership(
  id: string
): Promise<boolean> {
  const supabase text await createClient()

  // Get the current user
  const { data: { user }, error: userError } text await supabase.auth.getUser()
  if (userError || !user) {
    return false
  }

  const { data, error } text await supabase
    .from('projects')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return false
  }

  return true
}
