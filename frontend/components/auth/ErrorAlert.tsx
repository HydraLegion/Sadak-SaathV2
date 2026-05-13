'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

interface ErrorAlertProps {
  message: string
  type?: 'error' | 'warning' | 'info' | 'success'
  onDismiss?: () => void
  className?: string
}

export default function ErrorAlert({
  message,
  type = 'error',
  onDismiss,
  className
}: ErrorAlertProps) {
  const styles = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />,
      text: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      icon: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />,
      text: 'text-yellow-400'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />,
      text: 'text-blue-400'
    },
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      icon: <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />,
      text: 'text-green-400'
    }
  }

  const style = styles[type]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={className}
      >
        <div className={cn(
          'flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border',
          style.bg,
          style.border
        )}>
          {style.icon}
          <p className={cn('text-sm sm:text-base flex-1', style.text)}>{message}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4 opacity-60" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}