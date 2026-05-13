'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function LoadingButton({
  children,
  isLoading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  disabled,
  type = 'button',
  onClick,
}: LoadingButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    outline: 'border-2 border-blue-500 hover:bg-blue-500/10 text-blue-400',
    ghost: 'hover:bg-slate-800 text-slate-300'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <motion.button
      whileHover={{ scale: isLoading || disabled ? 1 : 1.02 }}
      whileTap={{ scale: isLoading || disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'relative rounded-xl font-medium transition-all duration-200',
        'flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || disabled}
      onClick={onClick}
      type={type}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
      ) : leftIcon}
      <span>{isLoading ? loadingText || 'Loading...' : children}</span>
      {!isLoading && rightIcon}
    </motion.button>
  )
}

export default LoadingButton
