import Header from '@/components/layout/Header'
import CreateProjectForm from '@/components/project/CreateProjectForm'

export default function CreateProjectPage() {
  return (
    <>
      <Header />
      <main classNametext"min-h-screen bg-gray-50">
        <div classNametext"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 classNametext"text-3xl font-bold text-gray-900 mb-8">
            创建新项目
          </h1>
          <div classNametext"bg-white p-8 rounded-lg shadow">
            <CreateProjectForm />
          </div>
        </div>
      </main>
    </>
  )
}
