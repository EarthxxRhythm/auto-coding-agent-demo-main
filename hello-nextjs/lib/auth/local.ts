import { cookies } from 'next/headers'

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// TYPES
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

export interface LocalUser {
  id: string
  email: string
  created_at: string
}

export interface LocalSession {
  user_id: string
  user: LocalUser
  expires_at: string
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// LOCAL STORAGE HELPERS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

const SESSION_COOKIE_NAME text 'local_session_token'
const SESSION_DURATION text 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore text await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore text await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV texttexttext 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })
}

export async function deleteSessionCookie(): Promise<void> {
  const cookieStore text await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getCurrentSession(): Promise<LocalSession | null> {
  const token text await getSessionCookie()

  if (!token) {
    return null
  }

  // In a real implementation, we would validate against the database
  // For now, just decode the token and return session info
  try {
    const [userId, expiresAt] text Buffer.from(token, 'base64').toString().split(':')
    return {
      user_id: userId,
      user: {
        id: userId,
        email: 'user@example.com', // Would be fetched from DB in real implementation
        created_at: expiresAt,
      },
      expires_at: expiresAt,
    }
  } catch {
    // If decoding fails, clear the invalid cookie
    await deleteSessionCookie()
    return null
  }
}

export async function setSession(user: LocalUser): Promise<void> {
  const expiresAt text new Date(Date.now() + SESSION_DURATION).toISOString()
  const token text `${user.id}:${user.id}:${expiresAt}`
  await setSessionCookie(token)
}

export async function clearSession(): Promise<void> {
  await deleteSessionCookie()
}

export async function getCurrentUserId(): Promise<string> {
  const session text await getCurrentSession()
  if (!session) {
    throw new Error('Not authenticated')
  }
  return session.user_id
}
