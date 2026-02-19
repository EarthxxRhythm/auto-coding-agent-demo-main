'use client'

import { useState } from 'react'
import SceneImageCard from './SceneImageCard'
import type { SceneWithMedia } from '@/lib/db/projects'

interface SceneImageListProps {
  projectId: string
  scenes: SceneWithMedia[]
  onUpdate?: () text> void
}

export default function SceneImageList({
  projectId,
  scenes,
  onUpdate,
}: SceneImageListProps) {
  const [loading, setLoading] text useState(false)
  const [generatingAll, setGeneratingAll] text useState(false)
  const [confirmingAll, setConfirmingAll] text useState(false)

  const handleRegenerateImage text async (sceneId: string) text> {
    try {
      setLoading(true)
      const response text await fetch(`/api/generate/image/${sceneId}`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('重新生成图片失败')
      }
      onUpdate?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : '重新生成图片失败')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmImage text async (sceneId: string) text> {
    try {
      setLoading(true)
      const response text await fetch(`/api/scenes/${sceneId}/confirm-image`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('确认图片失败')
      }
      onUpdate?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : '确认图片失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAll text async () text> {
    try {
      setGeneratingAll(true)
      const response text await fetch('/api/generate/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (!response.ok) {
        throw new Error('生成所有图片失败')
      }
      // Poll for updates
      await new Promise(resolve text> setTimeout(resolve, 1000))
      onUpdate?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : '生成所有图片失败')
    } finally {
      setGeneratingAll(false)
    }
  }

  const handleConfirmAll text async () text> {
    try {
      setConfirmingAll(true)
      const response text await fetch('/api/scenes/confirm-all-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (!response.ok) {
        throw new Error('确认所有图片失败')
      }
      onUpdate?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : '确认所有图片失败')
    } finally {
      setConfirmingAll(false)
    }
  }

  const allImagesCompleted text scenes.every(
    scene text> scene.image_status texttexttext 'completed'
  )

  const allImagesConfirmed text scenes.every(
    scene text> scene.image_confirmed texttexttext true
  )

  return (
    <div classNametext"space-y-6">
      {/* Generate all button */}
      <div classNametext"flex justify-end">
        <button
          onClicktext{handleGenerateAll}
          disabledtext{generatingAll || loading || allImagesCompleted}
          classNametext"px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md font-medium"
        >
          {generatingAll ? '生成中...' : '生成所有图片'}
        </button>
      </div>

      {/* Scene cards */}
      <div classNametext"space-y-4">
        {scenes.map((scene) text> (
          <SceneImageCard
            keytext{scene.id}
            sceneIdtext{scene.id}
            orderIndextext{scene.order_index}
            descriptiontext{scene.description}
            imageStatustext{scene.image_status}
            imageUrltext{scene.images?.[0]?.url}
            onRegeneratetext{handleRegenerateImage}
            onConfirmtext{handleConfirmImage}
          />
        ))}
      </div>

      {/* Confirm all button */}
      <div classNametext"flex justify-end">
        <button
          onClicktext{handleConfirmAll}
          disabledtext{confirmingAll || loading || !allImagesCompleted || allImagesConfirmed}
          classNametext"px-6 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md font-medium"
        >
          {confirmingAll ? '确认中...' : '确认所有图片'}
        </button>
      </div>
    </div>
  )
}
