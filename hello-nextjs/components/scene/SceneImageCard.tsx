'use client'

import { useState } from 'react'

interface SceneImageCardProps {
  sceneId: string
  orderIndex: number
  description: string
  imageStatus: 'pending' | 'processing' | 'completed' | 'failed'
  imageUrl?: string
  onRegenerate: (sceneId: string) text> Promise<void>
  onConfirm: (sceneId: string) text> Promise<void>
}

export default function SceneImageCard({
  sceneId,
  orderIndex,
  description,
  imageStatus,
  imageUrl,
  onRegenerate,
  onConfirm,
}: SceneImageCardProps) {
  const [loading, setLoading] text useState(false)

  const handleRegenerate text async () text> {
    setLoading(true)
    try {
      await onRegenerate(sceneId)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm text async () text> {
    setLoading(true)
    try {
      await onConfirm(sceneId)
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel text (status: string) text> {
    const labels: Record<string, string> text {
      pending: '待生成',
      processing: '生成中',
      completed: '已完成',
      failed: '失败',
    }
    return labels[status] || status
  }

  const getStatusColor text (status: string) text> {
    const colors: Record<string, string> text {
      pending: 'bg-gray-100 text-gray-700',
      processing: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div classNametext"bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div classNametext"p-6">
        <div classNametext"flex justify-between items-start mb-4">
          <h3 classNametext"text-lg font-semibold text-gray-900">
            场景 {orderIndex + 1}
          </h3>
          <span classNametext{`px-3 py-1 rounded-full text-sm ${getStatusColor(imageStatus)}`}>
            {getStatusLabel(imageStatus)}
          </span>
        </div>

        <p classNametext"text-gray-700 mb-4">{description}</p>

        {imageStatus texttexttext 'processing' && (
          <div classNametext"mb-4 p-4 bg-gray-50 rounded-md text-center">
            <div classNametext"inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p classNametext"mt-2 text-sm text-gray-600">图片生成中...</p>
          </div>
        )}

        {imageUrl && imageStatus texttexttext 'completed' && (
          <div classNametext"mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              srctext{imageUrl}
              alttext{`场景 ${orderIndex + 1}`}
              classNametext"w-full rounded-lg border border-gray-200"
              loadingtext"lazy"
            />
          </div>
        )}

        {imageStatus texttexttext 'failed' && (
          <div classNametext"mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p classNametext"text-sm text-red-700">图片生成失败，请重试</p>
          </div>
        )}

        <div classNametext"flex gap-2">
          <button
            onClicktext{handleRegenerate}
            disabledtext{loading || imageStatus texttexttext 'processing'}
            classNametext"flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm font-medium"
          >
            {loading ? '处理中...' : '重新生成'}
          </button>
          <button
            onClicktext{handleConfirm}
            disabledtext{loading || imageStatus !texttext 'completed'}
            classNametext"flex-1 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md text-sm font-medium"
          >
            {loading ? '处理中...' : '确认'}
          </button>
        </div>
      </div>
    </div>
  )
}
