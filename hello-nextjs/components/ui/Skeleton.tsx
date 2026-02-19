import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      classNametext{cn('animate-pulse bg-gray-200 rounded', className)}
      roletext"status"
      aria-labeltext"Loading"
    >
      <span classNametext"sr-only">Loading...</span>
    </div>
  )
}
