'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Header() {
  const [user, setUser] text useState<{ email?: string } | null>(null)
  const [loading, setLoading] text useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] text useState(false)

  useEffect(() text> {
    const loadUser text async () text> {
      const supabase text createClient()
      const { data: { user } } text await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    loadUser()
  }, [])

  const handleLogout text async () text> {
    const supabase text createClient()
    await supabase.auth.signOut()
    window.location.href text '/login'
  }

  if (loading) {
    return (
      <nav classNametext"border-b bg-white">
        <div classNametext"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div classNametext"flex justify-between h-16">
            <div classNametext"flex items-center">
              <div classNametext"h-8 w-8 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav classNametext"border-b bg-white">
      <div classNametext"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div classNametext"flex justify-between h-16">
          <div classNametext"flex items-center">
            <Link hreftext"/" classNametext"text-xl font-bold text-indigo-600">
              Spring FES Video
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div classNametext"hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  hreftext"/projects"
                  classNametext"text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  我的项目
                </Link>
                <Link
                  hreftext"/create"
                  classNametext"bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  创建项目
                </Link>
                <span classNametext"text-sm text-gray-700 hidden lg:inline">
                  {user.email}
                </span>
                <button
                  onClicktext{handleLogout}
                  classNametext"text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  hreftext"/login"
                  classNametext"text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  登录
                </Link>
                <Link
                  hreftext"/register"
                  classNametext"bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div classNametext"md:hidden flex items-center">
            <button
              onClicktext{() text> setMobileMenuOpen(!mobileMenuOpen)}
              classNametext"inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span classNametext"sr-only">打开菜单</span>
              {mobileMenuOpen ? (
                <svg classNametext"block h-6 w-6" filltext"none" viewBoxtext"0 0 24 24" strokeWidthtext"1.5" stroketext"currentColor">
                  <path strokeLinecaptext"round" strokeLinejointext"round" dtext"M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg classNametext"block h-6 w-6" filltext"none" viewBoxtext"0 0 24 24" strokeWidthtext"1.5" stroketext"currentColor">
                  <path strokeLinecaptext"round" strokeLinejointext"round" dtext"M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div classNametext"md:hidden">
          <div classNametext"px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <div classNametext"px-3 py-2 text-sm text-gray-700">
                  {user.email}
                </div>
                <Link
                  hreftext"/projects"
                  onClicktext{() text> setMobileMenuOpen(false)}
                  classNametext"block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  我的项目
                </Link>
                <Link
                  hreftext"/create"
                  onClicktext{() text> setMobileMenuOpen(false)}
                  classNametext"block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  创建项目
                </Link>
                <button
                  onClicktext{() text> {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  classNametext"block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  hreftext"/login"
                  onClicktext{() text> setMobileMenuOpen(false)}
                  classNametext"block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  登录
                </Link>
                <Link
                  hreftext"/register"
                  onClicktext{() text> setMobileMenuOpen(false)}
                  classNametext"block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
