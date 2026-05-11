import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: Date | string | undefined | null): string {
  if (!date) return 'Unknown'
  const d = typeof date === 'string' ? new Date(date) : date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return 'Unknown'
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDate(date: Date | string | undefined | null, formatStr: string = 'PPpp'): string {
  if (!date) return 'Unknown'
  const d = typeof date === 'string' ? new Date(date) : date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return 'Unknown'
  return format(d, formatStr)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function getSeverityColor(severity: 'critical' | 'high' | 'medium' | 'low'): string {
  const colors = {
    critical: 'text-red-500 bg-red-500/20 border-red-500/30',
    high: 'text-orange-500 bg-orange-500/20 border-orange-500/30',
    medium: 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30',
    low: 'text-green-500 bg-green-500/20 border-green-500/30',
  }
  return colors[severity]
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'text-yellow-500 bg-yellow-500/20',
    reviewing: 'text-blue-500 bg-blue-500/20',
    assigned: 'text-purple-500 bg-purple-500/20',
    dispatched: 'text-orange-500 bg-orange-500/20',
    resolved: 'text-green-500 bg-green-500/20',
    rejected: 'text-red-500 bg-red-500/20',
  }
  return statusMap[status] || 'text-slate-500 bg-slate-500/20'
}

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Severity badge variant mapper
export function getSeverityVariant(severity: string): 'severity-critical' | 'severity-high' | 'severity-medium' | 'severity-low' {
  const map: Record<string, 'severity-critical' | 'severity-high' | 'severity-medium' | 'severity-low'> = {
    critical: 'severity-critical',
    high: 'severity-high',
    medium: 'severity-medium',
    low: 'severity-low',
  }
  return map[severity] || 'default'
}

// Status badge variant mapper
export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'secondary',
    verified: 'default',
    in_progress: 'default',
    resolved: 'outline',
    rejected: 'destructive',
    submitted: 'secondary',
    acknowledged: 'default',
    assigned: 'default',
    escalated: 'destructive',
    closed: 'outline',
  }
  return map[status] || 'default'
}

// Debounce function
export function debounce<T extends (...args: any[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Format SLA countdown
export function formatSLACountdown(deadline: Date | string): string {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (diff < 0) {
    return 'Overdue'
  } else if (days > 0) {
    return `${days}d left`
  } else if (hours > 0) {
    return `${hours}h left`
  } else {
    return 'Due soon'
  }
}

// Firebase Auth Error Messages
export function getFirebaseAuthError(code: string): string {
  const errors: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/invalid-verification-code': 'Invalid verification code',
    'auth/code-expired': 'Verification code has expired',
    'auth/network-request-failed': 'Network error. Please check your connection',
  }
  return errors[code] || 'An error occurred. Please try again'
}