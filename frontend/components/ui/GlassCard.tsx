'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'red' | 'blue' | 'purple' | 'green' | 'orange'
  onClick?: () => void
}

const glowStyles = {
  red: 'hover:shadow-red-500/20 hover:border-red-500/30',
  blue: 'hover:shadow-blue-500/20 hover:border-blue-500/30',
  purple: 'hover:shadow-purple-500/20 hover:border-purple-500/30',
  green: 'hover:shadow-green-500/20 hover:border-green-500/30',
  orange: 'hover:shadow-orange-500/20 hover:border-orange-500/30',
}

export function GlassCard({ children, className, hover = false, glow, onClick }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl p-6',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none',
        hover && 'cursor-pointer transition-all duration-300 hover:bg-slate-800/50',
        glow && glowStyles[glow],
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

interface AIStatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  trend?: string
  trendUp?: boolean
  gradient: string
  delay?: number
}

export function AIStatCard({ label, value, icon, trend, trendUp = true, gradient, delay = 0 }: AIStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl border border-slate-800/50',
        'bg-slate-900/50 transition-all duration-300 hover:bg-slate-800/50 hover:border-slate-700'
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', gradient)} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={cn('p-2 rounded-xl bg-gradient-to-br shadow-lg', gradient)}>
            {icon}
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trendUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            )}>
              {trendUp ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {trend}
            </div>
          )}
        </div>

        <div className="text-2xl lg:text-3xl font-bold mb-1 text-white">
          {value}
        </div>
        <p className="text-xs text-slate-300">{label}</p>
      </div>

      <div className={cn('absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br', gradient)} />
    </motion.div>
  )
}

interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low'
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const styles = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  }

  const icons = {
    critical: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    high: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    medium: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
    low: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 14l7-7m0 0l-7 7m7-7H3" />
      </svg>
    ),
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize',
      styles[severity],
      className
    )}>
      {icons[severity]}
      {severity}
    </span>
  )
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    reviewing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    assigned: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    dispatched: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize',
      styles[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      className
    )}>
      {status}
    </span>
  )
}

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 2, className }: AnimatedCounterProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.span>
  )
}

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={cn(
        'rounded-lg bg-slate-800/50',
        className
      )}
    />
  )
}