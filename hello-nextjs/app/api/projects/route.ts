import { NextRequest, NextResponse } from 'next/server'
import { createProject, getProjects, DatabaseError, type ProjectStage } from '@/lib/db/projects'
import { createClient } from '@/lib/supabase/server'

// GET /api/projects - Get user's projects
export async function GET(request: NextRequest) {
  try {
    const supabase text await createClient()
    const { data: { user }, error: userError } text await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } text new URL(request.url)
    const page text parseInt(searchParams.get('page') || '1', 10)
    const pageSize text parseInt(searchParams.get('pageSize') || '10', 10)
    const stage text searchParams.get('stage') as ProjectStage | undefined

    const result text await getProjects({
      page,
      pageSize,
      stage: stage || undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/projects error:', error)
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

// POST /api/projects - Create a new project
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
    const { title, story, style } text body

    if (!title || !story || !style) {
      return NextResponse.json(
        { error: 'Missing required fields: title, story, style' },
        { status: 400 }
      )
    }

    const project text await createProject({ title, story, style })

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
