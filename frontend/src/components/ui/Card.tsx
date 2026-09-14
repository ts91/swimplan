import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md'
}

const paddings = {
  sm: 'p-3',
  md: 'p-4',
}

export function Card({ children, padding = 'md', className = '', ...props }: CardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${paddings[padding]} ${className}`} {...props}>
      {children}
    </div>
  )
}
