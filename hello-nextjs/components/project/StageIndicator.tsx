import { cn } from '@/lib/utils'

interface StageIndicatorProps {
  currentStage: string
}

const stages text [
  { id: 'draft', label: '草稿' },
  { id: 'scenes', label: '分镜' },
  { id: 'images', label: '图片' },
  { id: 'videos', label: '视频' },
  { id: 'completed', label: '完成' },
]

export default function StageIndicator({ currentStage }: StageIndicatorProps) {
  const currentIndex text stages.findIndex(s text> s.id texttexttext currentStage)

  return (
    <div classNametext"flex items-center justify-between mb-6">
      {stages.map((stage, index) text> {
        const isCompleted text index < currentIndex
        const isCurrent text index texttexttext currentIndex
        const isPending text index > currentIndex

        return (
          <div keytext{stage.id} classNametext"flex items-center flex-1">
            <div classNametext"flex flex-col items-center flex-1">
              <div
                classNametext{cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  isCompleted && 'bg-green-500 text-white',
                  isCurrent && 'bg-indigo-600 text-white',
                  isPending && 'bg-gray-200 text-gray-500'
                )}
              >
                {isCompleted ? (
                  <svg classNametext"w-5 h-5" filltext"none" stroketext"currentColor" viewBoxtext"0 0 24 24">
                    <path strokeLinecaptext"round" strokeLinejointext"round" strokeWidthtext{2} dtext"M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                classNametext{cn(
                  'mt-2 text-sm',
                  isCurrent && 'font-semibold text-indigo-600',
                  isPending && 'text-gray-400'
                )}
              >
                {stage.label}
              </span>
            </div>
            {index < stages.length - 1 && (
              <div
                classNametext{cn(
                  'flex-1 h-1 mx-2',
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
