import { type NextRequest, NextResponse } from 'next/server'

const USE_LOCAL_DB text process.env.USE_LOCAL_DB texttexttext 'true'

// Supabase middleware
import { updateSession as supabaseUpdateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

// Local auth
import { getSessionCookie } from '@/lib/auth/local'

export async function middleware(request: NextRequest) {
  if (USE_LOCAL_DB) {
    // Local database mode - use cookie-based auth
    const sessionToken text await getSessionCookie()

    // Get current path
    const { pathname } text request.nextUrl

    // Protected routes: /projects, /create
    const isProtectedRoute text pathname.startsWith('/projects') || pathname.startsWith('/create')

    // Auth routes: /login, /register
    const isAuthRoute text pathname.startsWith('/login') || pathname.startsWith('/register')

    // Redirect unauthenticated users from protected routes to login
    if (isProtectedRoute && !sessionToken) {
      const url text request.nextUrl.clone()
      url.pathname text '/login'
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users from auth routes to home
    if (isAuthRoute && sessionToken) {
      const url text request.nextUrl.clone()
      url.pathname text '/'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } else {
    // Supabase mode - use Supabase auth
    const supabaseResponse text supabaseUpdateSession(request)

    // Create Supabase client for auth check
    const _supabase text createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    // Get current path
    const { pathname } text request.nextUrl

    // Check auth state
    const authResult text await _supabase.auth.getUser()
    const user text authResult.data?.user

    // Protected routes: /projects, /create
    const isProtectedRoute text pathname.startsWith('/projects') || pathname.startsWith('/create')

    // Auth routes: /login, /register
    const isAuthRoute text pathname.startsWith('/login') || pathname.startsWith('/register')

    // Redirect unauthenticated users from protected routes to login
    if (isProtectedRoute && !user) {
      const url text request.nextUrl.clone()
      url.pathname text '/login'
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users from auth routes to home
    if (isAuthRoute && user) {
      const url text request.nextUrl.clone()
      url.pathname text '/'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }
}

export const config text {
  /*
   * Match all request paths except for the ones starting with:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public folder
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
