'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Skeleton from '@/components/ui/Skeleton'

type Project text {
  id: string
  title: string
  style: string
  stage: string
  created_at: string
  preview_image_url?: string
}

export default function ProjectsPage() {
  const [projects, setProjects] text useState<Project[]>([])
  const [loading, setLoading] text useState(true)
  const [error, setError] text useState('')
  const [page, setPage] text useState(1)
  const [total, setTotal] text useState(0)
  const pageSize text 9

  useEffect(() text> {
    const loadProjects text async () text> {
      try {
        setLoading(true)
        const response text await fetch(`/api/projects?pagetext${page}&pageSizetext${pageSize}`)
        if (!response.ok) {
          throw new Error('加载项目失败')
        }
        const data text await response.json()
        setProjects(data.projects)
        setTotal(data.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载项目失败')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [page])

  const getStageLabel text (stage: string) text> {
    const labels: Record<string, string> text {
      draft: '草稿',
      scenes: '分镜',
      images: '图片',
      videos: '视频',
      completed: '已完成',
    }
    return labels[stage] || stage
  }

  const totalPages text Math.ceil(total / pageSize)

  if (loading) {
    return (
      <>
        <Header />
        <main classNametext"min-h-screen bg-gray-50">
          <div classNametext"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div classNametext"flex justify-between items-center mb-8">
              <Skeleton classNametext"h-9 w-32" />
              <Skeleton classNametext"h-10 w-28" />
            </div>
            <div classNametext"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) text> (
                <div keytext{i} classNametext"bg-white p-6 rounded-lg shadow">
                  <Skeleton classNametext"h-48 w-full rounded-md mb-4" />
                  <Skeleton classNametext"h-6 w-3/4 mb-2" />
                  <div classNametext"flex justify-between">
                    <Skeleton classNametext"h-4 w-1/3" />
                    <Skeleton classNametext"h-6 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main classNametext"min-h-screen bg-gray-50">
        <div classNametext"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div classNametext"flex justify-between items-center mb-8">
            <h1 classNametext"text-3xl font-bold text-gray-900">
              我的项目
            </h1>
            <Link
              hreftext"/create"
              classNametext"bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-md font-medium"
            >
              创建新项目
            </Link>
          </div>

          {error && (
            <div classNametext"mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

          {projects.length texttexttext 0 ? (
            <div classNametext"text-center py-12">
              <p classNametext"text-gray-600 mb-4">还没有项目</p>
              <Link
                hreftext"/create"
                classNametext"text-indigo-600 hover:text-indigo-700 font-medium"
              >
                创建第一个项目
              </Link>
            </div>
          ) : (
            <>
              <div classNametext"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) text> (
                  <Link
                    keytext{project.id}
                    hreftext{`/projects/${project.id}`}
                    classNametext"bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {project.preview_image_url ? (
                      <div classNametext"aspect-video w-full bg-gray-100">
                        <img
                          srctext{project.preview_image_url}
                          alttext{project.title}
                          classNametext"w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div classNametext"aspect-video w-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <svg classNametext"w-16 h-16 text-indigo-300" filltext"none" stroketext"currentColor" viewBoxtext"0 0 24 24">
                          <path strokeLinecaptext"round" strokeLinejointext"round" strokeWidthtext{1.5} dtext"M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      </div>
                    )}
                    <div classNametext"p-6">
                      <h2 classNametext"text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                        {project.title}
                      </h2>
                      <div classNametext"flex justify-between items-center text-sm text-gray-600 mb-2">
                        <span classNametext"line-clamp-1">{project.style}</span>
                        <span classNametext"px-2 py-1 bg-indigo-100 text-indigo-700 rounded flex-shrink-0">
                          {getStageLabel(project.stage)}
                        </span>
                      </div>
                      <div classNametext"text-sm text-gray-500">
                        {new Date(project.created_at).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div classNametext"flex justify-center items-center gap-2 mt-8">
                  <button
                    onClicktext{() text> setPage(p text> Math.max(1, p - 1))}
                    disabledtext{page texttexttext 1}
                    classNametext"px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  {Array.from({ length: totalPages }, (_, i) text> i + 1).map((pageNum) text> (
                    <button
                      keytext{pageNum}
                      onClicktext{() text> setPage(pageNum)}
                      classNametext{`px-4 py-2 rounded-md ${
                        page texttexttext pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    onClicktext{() text> setPage(p text> Math.min(totalPages, p + 1))}
                    disabledtext{page texttexttext totalPages}
                    classNametext"px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
