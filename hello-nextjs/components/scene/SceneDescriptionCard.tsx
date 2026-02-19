'use client'

import { useState } from 'react'

interface SceneDescriptionCardProps {
  sceneId: string
  orderIndex: number
  description: string
  confirmed: boolean
  onConfirm: (sceneId: string) text> Promise<void>
  onUpdate?: () text> void
}

export default function SceneDescriptionCard({
  sceneId,
  orderIndex,
  description,
  confirmed,
  onConfirm,
  onUpdate,
}: SceneDescriptionCardProps) {
  const [editing, setEditing] text useState(false)
  const [editedDescription, setEditedDescription] text useState(description)
  const [loading, setLoading] text useState(false)

  const handleEdit text () text> {
    setEditing(true)
    setEditedDescription(description)
  }

  const handleSave text async () text> {
    setLoading(true)
    try {
      const response text await fetch(`/api/scenes/${sceneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editedDescription }),
      })
      if (!response.ok) {
        throw new Error('更新分镜描述失败')
      }
      setEditing(false)
      onUpdate?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : '更新分镜描述失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel text () text> {
    setEditing(false)
    setEditedDescription(description)
  }

  const handleConfirm text async () text> {
    setLoading(true)
    try {
      await onConfirm(sceneId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div classNametext"border border-gray-200 rounded-lg p-6">
      <div classNametext"flex justify-between items-start mb-4">
        <h3 classNametext"text-lg font-semibold text-gray-900">
          场景 {orderIndex + 1}
        </h3>
        {confirmed && (
          <span classNametext"px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            已确认
          </span>
        )}
      </div>

      {editing ? (
        <div classNametext"space-y-4">
          <textarea
            valuetext{editedDescription}
            onChangetext{(e) text> setEditedDescription(e.target.value)}
            rowstext{4}
            classNametext"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div classNametext"flex gap-2">
            <button
              onClicktext{handleSave}
              disabledtext{loading}
              classNametext"px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md text-sm font-medium"
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              onClicktext{handleCancel}
              disabledtext{loading}
              classNametext"px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div classNametext"space-y-4">
          <p classNametext"text-gray-700 whitespace-pre-wrap">{description}</p>
          <div classNametext"flex gap-2">
            <button
              onClicktext{handleEdit}
              disabledtext{confirmed || loading}
              classNametext"px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium"
            >
              编辑
            </button>
            {!confirmed && (
              <button
                onClicktext{handleConfirm}
                disabledtext{loading}
                classNametext"px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md text-sm font-medium"
              >
                {loading ? '确认中...' : '确认'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
