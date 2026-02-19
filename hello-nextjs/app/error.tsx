'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () text> void
}) {
  useEffect(() text> {
    console.error(error)
  }, [error])

  return (
    <>
      <Header />
      <main classNametext"min-h-screen bg-gray-50 flex items-center justify-center">
        <div classNametext"max-w-md w-full px-4">
          <div classNametext"bg-white p-8 rounded-lg shadow">
            <h1 classNametext"text-2xl font-bold text-red-600 mb-4">
              发生错误
            </h1>
            <p classNametext"text-gray-700 mb-6">
              {error.message || '抱歉，发生了未知错误'}
            </p>
            <button
              onClicktext{reset}
              classNametext"w-full bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-md font-medium"
            >
              重试
            </button>
            <Link
              hreftext"/"
              classNametext"block w-full mt-4 text-center text-indigo-600 hover:text-indigo-700"
            >
              返回首页
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
