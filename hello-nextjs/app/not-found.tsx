import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function NotFound() {
  return (
    <>
      <Header />
      <main classNametext"min-h-screen bg-gray-50 flex items-center justify-center">
        <div classNametext"max-w-md w-full px-4">
          <div classNametext"bg-white p-8 rounded-lg shadow text-center">
            <h1 classNametext"text-4xl font-bold text-gray-900 mb-4">
              404
            </h1>
            <p classNametext"text-gray-700 mb-6">
              抱歉，页面不存在
            </p>
            <Link
              hreftext"/"
              classNametext"block w-full bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-3 rounded-md font-medium"
            >
              返回首页
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
