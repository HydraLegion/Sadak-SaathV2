'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MiniSparkline } from './AnalyticsCharts'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  gradient: string
  delay?: number
  suffix?: string
  prefix?: string
  sparklineData?: number[]
  loading?: boolean
  onClick?: () => void
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  gradient,
  delay = 0,
  suffix = '',
  prefix = '',
  sparklineData,
  loading = false,
  onClick,
  className
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValueRef = useRef(value)

  useEffect(() => {
    const duration = 1000
    const steps = 30
    const startValue = prevValueRef.current
    const diff = value - startValue
    const increment = diff / steps
    let current = startValue
    let step = 0

    const timer = setInterval(() => {
      step++
      current += increment
      if (step >= steps) {
        setDisplayValue(value)
        prevValueRef.current = value
        clearInterval(timer)
      } else {
        setDisplayValue(Math.round(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5 backdrop-blur-xl border border-slate-800/50',
        'bg-slate-900/60 transition-all duration-300 hover:bg-slate-800/60 hover:border-slate-700',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Glow Effect */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500', gradient)} />

      {/* Decorative Circle */}
      <div className={cn('absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500', gradient)} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <motion.div
            initial={{ rotate: 0 }}
            whileHover={{ rotate: [0, -10, 10, 0] }}
            className={cn('p-3 rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center', gradient)}
          >
            {loading ? (
              <div className="w-6 h-6 rounded animate-pulse bg-white/30" />
            ) : (
              <Icon className="w-6 h-6 text-white" />
            )}
          </motion.div>

          {trend && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
              className={cn(
                'flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full',
                trendUp
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              )}
            >
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend}
            </motion.div>
          )}
        </div>

        {/* Value */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.1 }}
          className="flex items-baseline gap-1"
        >
          {loading ? (
            <div className="h-8 w-20 rounded animate-pulse bg-slate-700" />
          ) : (
            <>
              <span className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                <span className="text-slate-400 text-2xl">{prefix}</span>
                {displayValue.toLocaleString()}
                <span className="text-slate-400 text-2xl">{suffix}</span>
              </span>
            </>
          )}
        </motion.div>

        {/* Label */}
        <p className="text-sm text-slate-400 font-medium mt-1">{label}</p>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-3 h-8">
            <MiniSparkline data={sparklineData} color="#3b82f6" />
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  )
}

interface StatCardSkeletonProps {
  className?: string
}

export function StatCardSkeleton({ className }: StatCardSkeletonProps) {
  return (
    <div className={cn(
      'rounded-2xl p-5 bg-slate-900/60 border border-slate-800/50 animate-pulse',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-slate-800" />
        <div className="w-16 h-6 rounded-full bg-slate-800" />
      </div>
      <div className="h-8 w-24 rounded bg-slate-800 mb-2" />
      <div className="h-4 w-20 rounded bg-slate-800" />
    </div>
  )
}
