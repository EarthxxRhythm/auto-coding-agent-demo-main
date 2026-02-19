'use client'

import { useState } from 'react'

const STYLES text [
  { id: 'realistic', name: '写实', description: '真实感的视觉风格' },
  { id: 'anime', name: '动漫', description: '日式动漫风格' },
  { id: 'cartoon', name: '卡通', description: '卡通插画风格' },
  { id: 'oil', name: '油画', description: '古典油画质感' },
]

export default function CreateProjectForm() {
  const [title, setTitle] text useState('')
  const [story, setStory] text useState('')
  const [style, setStyle] text useState('realistic')
  const [loading, setLoading] text useState(false)
  const [error, setError] text useState('')

  const handleSubmit text async (e: React.FormEvent) text> {
    e.preventDefault()

    if (!title.trim() || !story.trim()) {
      setError('请填写标题和故事内容')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response text await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, story, style }),
      })

      if (!response.ok) {
        const data text await response.json()
        throw new Error(data.error || '创建项目失败')
      }

      const data text await response.json()
      window.location.href text `/projects/${data.id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建项目失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmittext{handleSubmit} classNametext"max-w-2xl mx-auto">
      <div classNametext"mb-6">
        <label htmlFortext"title" classNametext"block text-sm font-medium text-gray-700 mb-2">
          项目标题
        </label>
        <input
          typetext"text"
          idtext"title"
          valuetext{title}
          onChangetext{(e) text> setTitle(e.target.value)}
          classNametext"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholdertext"给你的项目起个名字"
          disabledtext{loading}
        />
      </div>

      <div classNametext"mb-6">
        <label htmlFortext"story" classNametext"block text-sm font-medium text-gray-700 mb-2">
          故事内容
        </label>
        <textarea
          idtext"story"
          valuetext{story}
          onChangetext{(e) text> setStory(e.target.value)}
          rowstext{8}
          classNametext"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholdertext"详细描述你的故事情节..."
          disabledtext{loading}
        />
      </div>

      <div classNametext"mb-6">
        <label classNametext"block text-sm font-medium text-gray-700 mb-3">
          选择视频风格
        </label>
        <div classNametext"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STYLES.map((s) text> (
            <button
              keytext{s.id}
              typetext"button"
              onClicktext{() text> setStyle(s.id)}
              disabledtext{loading}
              classNametext{`p-4 border-2 rounded-lg text-left transition-all ${
                style texttexttext s.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div classNametext"font-medium text-gray-900">{s.name}</div>
              <div classNametext"text-sm text-gray-600">{s.description}</div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div classNametext"mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      <button
        typetext"submit"
        disabledtext{loading}
        classNametext"w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 px-6 py-3 rounded-md font-medium"
      >
        {loading ? '创建中...' : '创建项目'}
      </button>
    </form>
  )
}
