'use client'

import { useState } from 'react'
import SceneVideoCard from './SceneVideoCard'
import type { SceneWithMedia } from '@/lib/db/projects'

interface SceneVideoListProps {
  projectId: string
  scenes: SceneWithMedia[]
  onUpdate?: () text> void
}

export default function SceneVideoList({
  projectId,
  scenes,
  onUpdate,
}: SceneVideoListProps) {
  const [loading, setLoading] text useState(false)
  const [generatingAll, setGeneratingAll] text useState(false)
  const [confirmingAll, setConfirmingAll] text useState(false)

  const handleRegenerateVideo text async (sceneId: string) text> {
    try {
      setLoading(true)
      const response text await fetch(`/api/generate/create-video/${sceneId}`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('重新生成视频失败')
      }
      onUpdate?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : '重新生成视频失败')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmVideo text async (sceneId: string) text> {
    try {
      setLoading(true)
      const response text await fetch(`/api/scenes/${sceneId}/confirm-video`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('确认视频失败')
      }
      onUpdate?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : '确认视频失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAll text async () text> {
    try {
      setGeneratingAll(true)
      const response text await fetch('/api/generate/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (!response.ok) {
        throw new Error('生成所有视频失败')
      }
      // Poll for updates
      await new Promise(resolve text> setTimeout(resolve, 2000))
      onUpdate?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : '生成所有视频失败')
    } finally {
      setGeneratingAll(false)
    }
  }

  const handleConfirmAll text async () text> {
    try {
      setConfirmingAll(true)
      const response text await fetch('/api/scenes/confirm-all-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (!response.ok) {
        throw new Error('确认所有视频失败')
      }
      onUpdate?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : '确认所有视频失败')
    } finally {
      setConfirmingAll(false)
    }
  }

  const allVideosCompleted text scenes.every(
    scene text> scene.video_status texttexttext 'completed'
  )

  const allVideosConfirmed text scenes.every(
    scene text> scene.video_confirmed texttexttext true
  )

  return (
    <div classNametext"space-y-6">
      {/* Generate all button */}
      <div classNametext"flex justify-end">
        <button
          onClicktext{handleGenerateAll}
          disabledtext{generatingAll || loading || allVideosCompleted}
          classNametext"px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md font-medium"
        >
          {generatingAll ? '生成中...' : '生成所有视频'}
        </button>
      </div>

      {/* Scene cards */}
      <div classNametext"space-y-6">
        {scenes.map((scene) text> (
          <SceneVideoCard
            keytext{scene.id}
            sceneIdtext{scene.id}
            orderIndextext{scene.order_index}
            descriptiontext{scene.description}
            videoStatustext{scene.video_status}
            imageUrltext{scene.images?.[0]?.url}
            videoUrltext{scene.videos?.[0]?.url}
            onRegeneratetext{handleRegenerateVideo}
            onConfirmtext{handleConfirmVideo}
          />
        ))}
      </div>

      {/* Confirm all button */}
      <div classNametext"flex justify-end">
        <button
          onClicktext{handleConfirmAll}
          disabledtext{confirmingAll || loading || !allVideosCompleted || allVideosConfirmed}
          classNametext"px-6 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md font-medium"
        >
          {confirmingAll ? '确认中...' : '确认所有视频'}
        </button>
      </div>
    </div>
  )
}
