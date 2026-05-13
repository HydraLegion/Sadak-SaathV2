'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsChartProps {
  data: { name: string; value: number; date?: string }[]
  title: string
  description?: string
  type?: 'area' | 'bar'
  color?: string
  gradientId?: string
  className?: string
  showTrend?: boolean
  trend?: string
  trendUp?: boolean
}

const defaultColors = {
  blue: ['#3b82f6', '#0ea5e9'],
  orange: ['#f97316', '#ef4444'],
  green: ['#22c55e', '#10b981'],
  purple: ['#a855f7', '#6366f1'],
  red: ['#ef4444', '#dc2626'],
}

export function AnalyticsChart({
  data,
  title,
  description,
  type = 'area',
  color = 'blue',
  gradientId,
  className,
  showTrend,
  trend,
  trendUp = true
}: AnalyticsChartProps) {
  const colors = defaultColors[color as keyof typeof defaultColors] || defaultColors.blue
  const chartId = gradientId || `chart-${color}-${Math.random().toString(36).substr(2, 9)}`

  const formatData = data.map((item, i) => ({
    ...item,
    index: i
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl bg-slate-900/60 border border-slate-800/50 p-5 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
        </div>
        {showTrend && trend && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            trendUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          )}>
            {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[0]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={colors[1]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(100, 116, 139, 0.2)',
                borderRadius: '12px',
                fontSize: '12px',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              fill={`url(#${chartId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

interface SeverityDistributionChartProps {
  data: { name: string; value: number; color: string }[]
  title?: string
  className?: string
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

export function SeverityDistributionChart({ data, title, className }: SeverityDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl bg-slate-900/60 border border-slate-800/50 p-5 overflow-hidden',
        className
      )}
    >
      {title && <h3 className="text-base font-semibold text-white mb-4">{title}</h3>}

      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || SEVERITY_COLORS[entry.name.toLowerCase()]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(100, 116, 139, 0.2)',
                  borderRadius: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {data.map((item) => {
            const color = item.color || SEVERITY_COLORS[item.name.toLowerCase()]
            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0

            return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm text-slate-300 capitalize">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{item.value}</span>
                  <span className="text-xs text-slate-500">{percent}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

interface StatsComparisonProps {
  label: string
  current: number
  previous: number
  className?: string
}

export function StatsComparison({ label, current, previous, className }: StatsComparisonProps) {
  const diff = current - previous
  const percentChange = previous > 0 ? Math.round((diff / previous) * 100) : 0
  const isPositive = diff >= 0

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-sm text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white">{current}</span>
        <span className={cn(
          'flex items-center gap-0.5 text-xs font-medium',
          isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(percentChange)}%
        </span>
      </div>
    </div>
  )
}

interface LiveActivityIndicatorProps {
  isLive?: boolean
  lastUpdate?: Date
  className?: string
}

export function LiveActivityIndicator({ isLive = true, lastUpdate, className }: LiveActivityIndicatorProps) {
  const timeAgo = lastUpdate
    ? `Updated ${Math.floor((Date.now() - lastUpdate.getTime()) / 1000 / 60)}m ago`
    : 'Live'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full border',
        isLive
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : 'bg-slate-500/10 border-slate-500/30 text-slate-400'
      )}>
        <div className={cn(
          'w-2 h-2 rounded-full',
          isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-500'
        )} />
        <span className="text-xs font-medium">{isLive ? 'LIVE' : 'OFFLINE'}</span>
      </div>
      {lastUpdate && (
        <span className="text-xs text-slate-500">{timeAgo}</span>
      )}
    </div>
  )
}

interface MiniSparklineProps {
  data: number[]
  color?: string
  className?: string
}

export function MiniSparkline({ data, color = '#3b82f6', className }: MiniSparklineProps) {
  const chartData = data.map((value, i) => ({ i, value }))
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const normalizedData = chartData.map(item => ({
    ...item,
    value: ((item.value - min) / range) * 100
  }))

  return (
    <svg className={cn('w-full h-8', className)} viewBox="0 0 100 40" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`M ${normalizedData.map((d, i) => `${(i / (data.length - 1)) * 100},${40 - d.value}`).join(' L ')} L 100,40 L 0,40 Z`}
        fill={`url(#spark-${color})`}
      />
      <path
        d={normalizedData.map((d, i) => `${(i / (data.length - 1)) * 100},${40 - d.value}`).join(' L ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
