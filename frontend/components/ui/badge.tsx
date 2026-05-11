import * as React from 'react'
import { cn } from './button'

const Badge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'severity-critical' | 'severity-high' | 'severity-medium' | 'severity-low'
}>(({ className, variant, ...props }, ref) => {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground',
    'severity-critical': 'bg-severity-critical text-white',
    'severity-high': 'bg-severity-high text-white',
    'severity-medium': 'bg-severity-medium text-white',
    'severity-low': 'bg-severity-low text-white',
  }

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantClasses[variant || 'default'],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'

export { Badge }

export function getSeverityVariant(severity: string): 'severity-critical' | 'severity-high' | 'severity-medium' | 'severity-low' | 'default' {
  const map: Record<string, 'severity-critical' | 'severity-high' | 'severity-medium' | 'severity-low' | 'default'> = {
    critical: 'severity-critical',
    high: 'severity-high',
    medium: 'severity-medium',
    low: 'severity-low',
  }
  return map[severity] || 'default'
}

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
