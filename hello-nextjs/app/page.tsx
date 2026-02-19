import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function Home() {
  return (
    <>
      <Header />
      <main classNametext"min-h-screen bg-gray-50">
        <div classNametext"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div classNametext"text-center">
            <h1 classNametext"text-4xl font-bold text-gray-900 mb-4">
              故事转视频生成平台
            </h1>
            <p classNametext"text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              输入你的故事，AI 将自动生成分镜场景、图片和视频
            </p>
            <div classNametext"flex justify-center gap-4">
              <Link
                hreftext"/create"
                classNametext"bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-lg text-lg font-medium"
              >
                创建新项目
              </Link>
              <Link
                hreftext"/projects"
                classNametext"border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg text-lg font-medium"
              >
                查看我的项目
              </Link>
            </div>
          </div>

          <div classNametext"mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div classNametext"bg-white p-6 rounded-lg shadow">
              <h3 classNametext"text-lg font-semibold text-gray-900 mb-2">
                1. 输入故事
              </h3>
              <p classNametext"text-gray-600">
                描述你想转成视频的故事内容，选择视频风格
              </p>
            </div>
            <div classNametext"bg-white p-6 rounded-lg shadow">
              <h3 classNametext"text-lg font-semibold text-gray-900 mb-2">
                2. AI 生成分镜
              </h3>
              <p classNametext"text-gray-600">
                AI 自动将故事拆解为分镜场景
              </p>
            </div>
            <div classNametext"bg-white p-6 rounded-lg shadow">
              <h3 classNametext"text-lg font-semibold text-gray-900 mb-2">
                3. 生成视频
              </h3>
              <p classNametext"text-gray-600">
                为每个分镜生成图片和视频，一键导出
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
