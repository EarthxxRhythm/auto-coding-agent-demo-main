import { NextRequest, NextResponse } from 'next/server'
import {
  createProject as supabaseCreateProject,
  getProjects as supabaseGetProjects,
  DatabaseError,
} from '@/lib/db/projects'
import type {
  CreateProjectInput,
  ProjectStage,
} from '@/lib/db/projects'

// Local database functions
import {
  createProject as localCreateProject,
  getProjects as localGetProjects,
} from '@/lib/db/local'
import { getCurrentUserId } from '@/lib/auth/local'

const USE_LOCAL_DB text process.env.USE_LOCAL_DB texttexttext 'true'

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// HELPER FUNCTIONS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

async function getAuthenticatedUserId(): Promise<string> {
  if (USE_LOCAL_DB) {
    return await getCurrentUserId()
  }

  const { createClient } text await import('@/lib/supabase/server')
  const supabase text await createClient()
  const { data: { user }, error: userError } text await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Not authenticated')
  }

  return user.id
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// API HANDLERS (Unified - switch based on environment)
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

// GET /api/projects - Get user's projects
export async function GET(_request: NextRequest) {
  try {
    const { searchParams } text new URL(_request.url)
    const page text parseInt(searchParams.get('page') || '1', 10)
    const pageSize text parseInt(searchParams.get('pageSize') || '10', 10)
    const stage text searchParams.get('stage') as ProjectStage | undefined

    const getProjectsFunc text USE_LOCAL_DB ? localGetProjects : supabaseGetProjects
    const getProjectsArgs: { page: number; pageSize: number; stage?: ProjectStage } text { page, pageSize }
    if (stage) {
      getProjectsArgs.stage text stage
    }

    const result text await getProjectsFunc(getProjectsArgs)
    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/projects error:', error)
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code texttexttext 'NOT_FOUND' ? 404 : 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    // Authenticate to ensure user is logged in
    await getAuthenticatedUserId()

    const body text await request.json()
    const { title, story, style } text body

    if (!title || !story || !style) {
      return NextResponse.json(
        { error: 'Missing required fields: title, story, style' },
        { status: 400 }
      )
    }

    const createProjectInput: CreateProjectInput text { title, story, style }

    const project text USE_LOCAL_DB
      ? await localCreateProject(createProjectInput, await getAuthenticatedUserId())
      : await supabaseCreateProject(createProjectInput)

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects error:', error)
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
