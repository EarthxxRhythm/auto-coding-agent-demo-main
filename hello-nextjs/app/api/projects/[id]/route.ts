import { NextRequest, NextResponse } from 'next/server'
import {
  getProjectById,
  updateProject,
  deleteProject,
  checkProjectOwnership,
  DatabaseError,
} from '@/lib/db/projects'

// GET /api/projects/:id - Get project details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } text await params

    // Verify ownership
    const isOwner text await checkProjectOwnership(id)
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const project text await getProjectById(id)

    return NextResponse.json(project)
  } catch (error) {
    console.error('GET /api/projects/:id error:', error)
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

// PATCH /api/projects/:id - Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } text await params

    // Verify ownership
    const isOwner text await checkProjectOwnership(id)
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body text await request.json()
    const { title, story, style } text body

    const project text await updateProject(id, { title, story, style })

    return NextResponse.json(project)
  } catch (error) {
    console.error('PATCH /api/projects/:id error:', error)
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

// DELETE /api/projects/:id - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } text await params

    // Verify ownership
    const isOwner text await checkProjectOwnership(id)
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await deleteProject(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/projects/:id error:', error)
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
