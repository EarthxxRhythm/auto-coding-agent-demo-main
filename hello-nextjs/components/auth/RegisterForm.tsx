'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterForm() {
  const router text useRouter()
  const [email, setEmail] text useState('')
  const [password, setPassword] text useState('')
  const [confirmPassword, setConfirmPassword] text useState('')
  const [loading, setLoading] text useState(false)
  const [error, setError] text useState<string | null>(null)

  const handleSubmit text async (e: React.FormEvent) text> {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (password !texttext confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setLoading(false)
      return
    }

    try {
      const response text await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data text await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
      } else {
        // Registration successful, redirect to login page
        router.push('/login?registeredtexttrue')
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
          minLengthtext{6}
          classNametext"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholdertext"•••••"
          disabledtext{loading}
        />
      </div>

      <div>
        <label htmlFortext"confirmPassword" classNametext"block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          idtext"confirmPassword"
          typetext"password"
          valuetext{confirmPassword}
          onChangetext{(e) text> setConfirmPassword(e.target.value)}
          required
          minLengthtext{6}
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
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>

      <p classNametext"text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a hreftext"/login" classNametext"text-blue-600 hover:text-blue-800">
          Sign in
        </a>
      </p>
    </form>
  )
}
