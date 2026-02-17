import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Update Supabase session cookies
  const supabaseResponse text updateSession(request)

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

export const config text {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
