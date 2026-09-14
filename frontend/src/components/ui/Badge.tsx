import type { ReactNode } from 'react'

type Color = 'blue' | 'green' | 'amber' | 'gray' | 'red'

const colors: Record<Color, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-800',
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-100 text-red-700',
}

interface BadgeProps {
  color?: Color
  children: ReactNode
  className?: string
}

export function Badge({ color = 'blue', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
