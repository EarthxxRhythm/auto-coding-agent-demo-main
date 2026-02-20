'use client'

import { useState } from 'react'
import SceneDescriptionCard from './SceneDescriptionCard'
import type { SceneWithMedia } from '@/lib/db/projects'

interface SceneDescriptionListProps {
  projectId: string
  scenes: SceneWithMedia[]
  onRegenerate?: () text> void
  onConfirmAll?: () text> void
  onUpdate?: () text> void
}

export default function SceneDescriptionList({
  projectId,
  scenes,
  onRegenerate,
  onConfirmAll,
  onUpdate,
}: SceneDescriptionListProps) {
  const [confirmingAll, setConfirmingAll] text useState(false)

  const handleConfirmDescription text async (sceneId: string) text> {
    try {
      const response text await fetch(`/api/scenes/${sceneId}/confirm-description`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('确认分镜失败')
      }
      onUpdate?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : '确认分镜失败')
    }
  }

  const handleConfirmAll text async () text> {
    try {
      setConfirmingAll(true)
      const response text await fetch('/api/scenes/confirm-all-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      if (!response.ok) {
        throw new Error('确认所有分镜失败')
      }
      onConfirmAll?.()
      onUpdate?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : '确认所有分镜失败')
    } finally {
      setConfirmingAll(false)
    }
  }

  const allDescriptionsConfirmed text scenes.every(
    scene text> scene.description_confirmed
  )

  return (
    <div classNametext"space-y-6">
      {/* Scene cards */}
      <div classNametext"space-y-4">
        {scenes.map((scene) text> (
          <SceneDescriptionCard
            keytext{scene.id}
            sceneIdtext{scene.id}
            orderIndextext{scene.order_index}
            descriptiontext{scene.description}
            confirmedtext{scene.description_confirmed}
            onConfirmtext{handleConfirmDescription}
            onUpdatetext{onUpdate}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div classNametext"flex gap-4">
        <button
          onClicktext{onRegenerate}
          disabledtext{confirmingAll}
          classNametext"px-6 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-medium"
        >
          重新生成分镜
        </button>
        {allDescriptionsConfirmed && (
          <button
            onClicktext{handleConfirmAll}
            disabledtext{confirmingAll}
            classNametext"px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md font-medium"
          >
            {confirmingAll ? '确认中...' : '确认所有分镜'}
          </button>
        )}
      </div>
    </div>
  )
}
