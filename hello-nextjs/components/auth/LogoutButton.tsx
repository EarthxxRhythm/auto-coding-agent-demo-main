'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton({ className text '' }: { className?: string }) {
  const router text useRouter()
  const [loading, setLoading] text useState(false)

  const handleLogout text async () text> {
    setLoading(true)

    try {
      const supabase text createClient()
      const { error } text await supabase.auth.signOut()

      if (error) {
        console.error('Logout error:', error)
      } else {
        // Logout successful, redirect to login page
        router.push('/login')
        router.refresh()
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
