'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, CheckCircle, Eye, Fingerprint } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

type BadgeVariant = 'secure' | 'verified' | 'encrypted' | 'authorized' | 'role'

interface SecureAccessBadgeProps {
  variant?: BadgeVariant
  role?: UserRole
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const variantConfig = {
  secure: {
    icon: Lock,
    gradient: 'from-slate-500/20 to-slate-600/20',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
    label: 'Secure Connection',
  },
  verified: {
    icon: CheckCircle,
    gradient: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    label: 'Verified Officer',
  },
  encrypted: {
    icon: Lock,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    label: 'End-to-End Encrypted',
  },
  authorized: {
    icon: Shield,
    gradient: 'from-purple-500/20 to-indigo-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    label: 'Authorized Access',
  },
  role: {
    icon: Fingerprint,
    gradient: 'from-orange-500/20 to-red-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    label: 'Role Verified',
  },
}

const roleLabels: Record<UserRole, string> = {
  officer: 'PWD Officer',
  admin: 'District Admin',
  super_admin: 'Super Admin',
  inspector: 'Road Inspector',
  citizen: 'Citizen',
}

export default function SecureAccessBadge({
  variant = 'secure',
  role,
  showLabel = true,
  size = 'md',
  animated = true,
  className,
}: SecureAccessBadgeProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 gap-1.5',
    md: 'px-3 py-1.5 gap-2',
    lg: 'px-4 py-2 gap-2.5',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }

  const displayLabel = role ? roleLabels[role] : config.label

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.9 } : false}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center rounded-full border backdrop-blur-sm',
        config.gradient,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      {/* Icon */}
      <motion.div
        animate={animated ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        <Icon className={cn(iconSizes[size], config.text)} />
      </motion.div>

      {/* Label */}
      {showLabel && (
        <span className={cn('font-medium', textSizes[size], config.text)}>
          {displayLabel}
        </span>
      )}
    </motion.div>
  )
}

// Compact inline badge for role display
export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  const roleConfig = {
    super_admin: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    admin: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    officer: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    inspector: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    citizen: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
  }

  const config = roleConfig[role]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {role.replace('_', ' ')}
    </span>
  )
}