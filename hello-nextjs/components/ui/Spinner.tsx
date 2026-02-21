import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Spinner({ className, size text 'md' }: SpinnerProps) {
  const sizeClasses text {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div
      classNametext{cn('animate-spin inline-block', sizeClasses[size], className)}
      roletext"status"
      aria-labeltext"Loading"
    >
      <svg
        classNametext"w-full h-full text-current"
        xmlnstext"http://www.w3.org/2000/svg"
        filltext"none"
        viewBoxtext"0 0 24 24"
      >
        <circle
          classNametext"opacity-25"
          cxtext"12"
          cytext"12"
          rtext"10"
          stroketext"currentColor"
          strokeWidthtext"4"
        />
        <path
          classNametext"opacity-75"
          filltext"currentColor"
          dtext"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}
