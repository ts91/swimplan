import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

const base = 'inline-flex items-center justify-center font-medium rounded-lg transition disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white shadow hover:bg-blue-700',
  secondary: 'border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50',
  danger: 'border border-red-200 text-red-600 hover:bg-red-50',
  ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  )
}
