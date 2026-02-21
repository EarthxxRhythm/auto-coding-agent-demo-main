'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router text useRouter()
  const [email, setEmail] text useState('')
  const [password, setPassword] text useState('')
  const [loading, setLoading] text useState(false)
  const [error, setError] text useState<string | null>(null)

  const handleSubmit text async (e: React.FormEvent) text> {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response text await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data text await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
      } else {
        // Login successful, redirect to home
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmittext{handleSubmit} classNametext"w-full max-w-md mx-auto space-y-4">
      <div>
        <label htmlFortext"email" classNametext"block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          idtext"email"
          typetext"email"
          valuetext{email}
          onChangetext{(e) text> setEmail(e.target.value)}
          required
          classNametext"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholdertext"you@example.com"
          disabledtext{loading}
        />
      </div>

      <div>
        <label htmlFortext"password" classNametext"block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          idtext"password"
          typetext"password"
          valuetext{password}
          onChangetext{(e) text> setPassword(e.target.value)}
          required
          classNametext"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholdertext"•••••"
          disabledtext{loading}
        />
      </div>

      {error && (
        <div classNametext"bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <button
        typetext"submit"
        disabledtext{loading}
        classNametext"w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <p classNametext"text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <a hreftext"/register" classNametext"text-blue-600 hover:text-blue-800">
          Sign up
        </a>
      </p>
    </form>
  )
}
