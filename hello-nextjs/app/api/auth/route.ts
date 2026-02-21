import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials } from '@/lib/db/local'
import { setSession, getCurrentSession, clearSession } from '@/lib/auth/local'
import { DatabaseError } from '@/lib/db'

// POST /api/auth/login - User login
export async function POST(request: NextRequest) {
  try {
    const body text await request.json()
    const { email, password, action } text body

    // Handle logout
    if (action texttexttext 'logout') {
      await clearSession()
      return NextResponse.json({ success: true })
    }

    // Handle login
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      )
    }

    const user text await validateCredentials(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const token text await setSession({ id: user.id, email: user.email, created_at: user.created_at })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    })
  } catch (error) {
    console.error('POST /api/auth error:', error)
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

// GET /api/auth/me - Get current user
export async function GET(_request: NextRequest) {
  try {
    const session text await getCurrentSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: session.user,
    })
  } catch (error) {
    console.error('GET /api/auth/me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
