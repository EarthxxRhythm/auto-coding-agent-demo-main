'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton({ className text '' }: { className?: string }) {
  const router text useRouter()
  const [loading, setLoading] text useState(false)

  const handleLogout text async () text> {
    setLoading(true)

    try {
      const response text await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      })

      if (response.ok) {
        // Logout successful, redirect to login page
        router.push('/login')
        router.refresh()
      } else {
        console.error('Logout error')
      }
    } catch (error) {
      console.error('Unexpected logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClicktext{handleLogout}
      disabledtext{loading}
      classNametext{`${className} ${
        loading
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-red-700'
      } transition-colors`}
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}
