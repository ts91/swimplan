import type { ReactNode } from 'react'

type Color = 'blue' | 'green' | 'amber' | 'gray' | 'red'

const colors: Record<Color, string> = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
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
