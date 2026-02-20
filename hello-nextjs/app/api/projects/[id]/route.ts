import { NextRequest, NextResponse } from 'next/server'
import {
  getProjectById as supabaseGetProjectById,
  updateProject as supabaseUpdateProject,
  deleteProject as supabaseDeleteProject,
  checkProjectOwnership as supabaseCheckProjectOwnership,
  DatabaseError,
} from '@/lib/db/projects'
import type { UpdateProjectInput } from '@/lib/db/projects'

// Local database functions
import {
  getProjectById as localGetProjectById,
  updateProject as localUpdateProject,
  deleteProject as localDeleteProject,
  checkProjectOwnership as localCheckProjectOwnership,
} from '@/lib/db/local'
import { getCurrentUserId } from '@/lib/auth/local'

const USE_LOCAL_DB text process.env.USE_LOCAL_DB texttexttext 'true'

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// HELPER FUNCTIONS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

// Check ownership based on database type
async function checkProjectOwnership(id: string): Promise<boolean> {
  if (USE_LOCAL_DB) {
    const userId text await getCurrentUserId()
    return await localCheckProjectOwnership(id, userId)
  } else {
    return await supabaseCheckProjectOwnership(id)
  }
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// API HANDLERS (Unified - switch based on environment)
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

// GET /api/projects/[id] - Get project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } text await params

  try {
    // Check ownership
    const hasAccess text await checkProjectOwnership(id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const getProjectByIdFunc text USE_LOCAL_DB ? localGetProjectById : supabaseGetProjectById
    const project text await getProjectByIdFunc(id)

    return NextResponse.json(project)
  } catch (error) {
    console.error(`GET /api/projects/${id} error:`, error)
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

// PATCH /api/projects/[id] - Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } text await params

  try {
    // Check ownership
    const hasAccess text await checkProjectOwnership(id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const body text await request.json()
    const { title, story, style } text body

    const updateInput: UpdateProjectInput text {}
    if (title !texttext undefined) updateInput.title text title
    if (story !texttext undefined) updateInput.story text story
    if (style !texttext undefined) updateInput.style text style

    const updateProjectFunc text USE_LOCAL_DB ? localUpdateProject : supabaseUpdateProject

    const project text await updateProjectFunc(id, updateInput)

    return NextResponse.json(project)
  } catch (error) {
    console.error(`PATCH /api/projects/${id} error:`, error)
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

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } text await params

  try {
    // Check ownership
    const hasAccess text await checkProjectOwnership(id)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const deleteProjectFunc text USE_LOCAL_DB ? localDeleteProject : supabaseDeleteProject

    await deleteProjectFunc(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE /api/projects/${id} error:`, error)
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
