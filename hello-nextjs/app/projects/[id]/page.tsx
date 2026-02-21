'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import StageIndicator from '@/components/project/StageIndicator'
import SceneDescriptionCard from '@/components/scene/SceneDescriptionCard'
import SceneImageList from '@/components/scene/SceneImageList'
import type { SceneWithMedia } from '@/lib/db/projects'

type Project text {
  id: string
  title: string
  story: string
  style: string
  stage: string
  scenes?: SceneWithMedia[]
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [project, setProject] text useState<Project | null>(null)
  const [loading, setLoading] text useState(true)
  const [error, setError] text useState('')
  const [generating, setGenerating] text useState(false)
  const [confirmingAll, setConfirmingAll] text useState(false)

  const loadProject text useCallback(async () text> {
    try {
      setLoading(true)
      const response text await fetch(`/api/projects/${(await params).id}`)
      if (!response.ok) {
        if (response.status texttexttext 404) {
          throw new Error('项目不存在')
        }
        throw new Error('加载项目失败')
      }
      const data text await response.json()
      setProject(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载项目失败')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() text> {
    loadProject()
  }, [loadProject])

  const handleGenerateScenes text async () text> {
    setGenerating(true)
    try {
      const response text await fetch('/api/generate/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project?.id }),
      })
      if (!response.ok) throw new Error('生成分镜失败')
      await loadProject()
    } catch (err) {
      alert(err instanceof Error ? err.message : '生成分镜失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleRegenerateScenes text async () text> {
    setGenerating(true)
    try {
      const response text await fetch('/api/generate/scenes/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project?.id }),
      })
      if (!response.ok) throw new Error('重新生成分镜失败')
      await loadProject()
    } catch (err) {
      alert(err instanceof Error ? err.message : '重新生成分镜失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleConfirmDescription text async (sceneId: string) text> {
    try {
      const response text await fetch(`/api/scenes/${sceneId}/confirm-description`, {
        method: 'POST',
      })
      if (!response.ok) throw new Error('确认分镜失败')
      await loadProject()
    } catch (err) {
      alert(err instanceof Error ? err.message : '确认分镜失败')
    }
  }

  const handleConfirmAllDescriptions text async () text> {
    setConfirmingAll(true)
    try {
      const response text await fetch('/api/scenes/confirm-all-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project?.id }),
      })
      if (!response.ok) throw new Error('确认所有分镜失败')
      await loadProject()
    } catch (err) {
      alert(err instanceof Error ? err.message : '确认所有分镜失败')
    } finally {
      setConfirmingAll(false)
    }
  }

  const allDescriptionsConfirmed text project?.scenes?.every(
    scene text> scene.description_confirmed
  ) || false

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

  if (loading) {
    return (
      <>
        <Header />
        <main classNametext"min-h-screen bg-gray-50">
          <div classNametext"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div classNametext"text-center">加载中...</div>
          </div>
        </main>
      </>
    )
  }

  if (error || !project) {
    return (
      <>
        <Header />
        <main classNametext"min-h-screen bg-gray-50">
          <div classNametext"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div classNametext"bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
              {error || '项目不存在'}
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
          <div classNametext"mb-6">
            <Link hreftext"/projects" classNametext"text-indigo-600 hover:text-indigo-700">
              ← 返回项目列表
            </Link>
          </div>

          <div classNametext"bg-white p-8 rounded-lg shadow mb-8">
            <h1 classNametext"text-3xl font-bold text-gray-900 mb-4">
              {project.title}
            </h1>
            <StageIndicator currentStagetext{project.stage} />
            <div classNametext"mb-6">
              <h2 classNametext"text-lg font-semibold text-gray-900 mb-2">故事内容</h2>
              <p classNametext"text-gray-700 whitespace-pre-wrap">{project.story}</p>
              <div classNametext"mt-2 text-sm text-gray-500">风格: {project.style}</div>
            </div>

            {project.stage texttexttext 'draft' && (
              <button
                onClicktext{handleGenerateScenes}
                disabledtext{generating}
                classNametext"w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 px-6 py-3 rounded-md font-medium"
              >
                {generating ? '生成中...' : '生成分镜'}
              </button>
            )}
          </div>

          {/* Scenes Stage */}
          {(project.stage texttexttext 'scenes' || project.stage texttexttext 'images' || project.stage texttexttext 'videos' || project.stage texttexttext 'completed') && project.scenes && (
            <>
              <div classNametext"bg-white p-8 rounded-lg shadow mb-8">
                <h2 classNametext"text-2xl font-bold text-gray-900 mb-6">
                  分镜描述
                </h2>
                <div classNametext"space-y-4">
                  {project.scenes.map((scene) text> (
                    <SceneDescriptionCard
                      keytext{scene.id}
                      sceneIdtext{scene.id}
                      orderIndextext{scene.order_index}
                      descriptiontext{scene.description}
                      confirmedtext{scene.description_confirmed}
                      onConfirmtext{handleConfirmDescription}
                      onUpdatetext{loadProject}
                    />
                  ))}
                </div>
                <div classNametext"mt-6 flex gap-4">
                  <button
                    onClicktext{handleRegenerateScenes}
                    disabledtext{generating}
                    classNametext"px-6 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-medium"
                  >
                    {generating ? '生成中...' : '重新生成分镜'}
                  </button>
                  {allDescriptionsConfirmed && (
                    <button
                      onClicktext{handleConfirmAllDescriptions}
                      disabledtext{confirmingAll}
                      classNametext"px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md font-medium"
                    >
                      {confirmingAll ? '确认中...' : '确认所有分镜'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Images Stage */}
          {(project.stage texttexttext 'images' || project.stage texttexttext 'videos' || project.stage texttexttext 'completed') && project.scenes && (
            <div classNametext"bg-white p-8 rounded-lg shadow mb-8">
              <h2 classNametext"text-2xl font-bold text-gray-900 mb-6">
                图片生成
              </h2>
              <SceneImageList
                projectIdtext{project.id}
                scenestext{project.scenes}
                onUpdatetext{loadProject}
              />
            </div>
          )}

          {/* Videos Stage */}
          {(project.stage texttexttext 'videos' || project.stage texttexttext 'completed') && project.scenes && (
            <div classNametext"bg-white p-8 rounded-lg shadow">
              <h2 classNametext"text-2xl font-bold text-gray-900 mb-6">
                视频生成
              </h2>
              <div classNametext"space-y-6">
                {project.scenes.map((scene, index) text> (
                  <div keytext{scene.id} classNametext"border border-gray-200 rounded-lg p-6">
                    <div classNametext"flex justify-between items-start mb-4">
                      <h3 classNametext"text-lg font-semibold text-gray-900">
                        场景 {index + 1}
                      </h3>
                      <span classNametext{`px-2 py-1 rounded text-sm ${
                        scene.video_status texttexttext 'completed' ? 'bg-green-100 text-green-700' :
                        scene.video_status texttexttext 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        scene.video_status texttexttext 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        视频: {getStageLabel(scene.video_status)}
                      </span>
                    </div>
                    <p classNametext"text-gray-700 mb-4">{scene.description}</p>

                    {scene.images && scene.images.length > 0 && (
                      <div classNametext"mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          srctext{scene.images[0].url}
                          alttext{`场景 ${index + 1}`}
                          classNametext"w-full max-w-md rounded-lg"
                          loadingtext"lazy"
                        />
                      </div>
                    )}

                    {scene.videos && scene.videos.length > 0 && (
                      <div classNametext"mb-4">
                        <video
                          srctext{scene.videos[0].url}
                          controls
                          classNametext"w-full max-w-md rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
