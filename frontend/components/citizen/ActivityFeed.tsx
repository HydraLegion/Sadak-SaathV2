'use client'

import { motion } from 'framer-motion'
import {
  Video, MapPin, CheckCircle, AlertTriangle, Clock,
  TrendingUp, Bell, MessageSquare, Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: 'upload' | 'detection' | 'report' | 'resolution' | 'complaint'
  title: string
  description: string
  timestamp: string
  icon: 'video' | 'map' | 'check' | 'alert'
  status?: 'success' | 'pending' | 'error'
}

interface ActivityFeedProps {
  activities?: Activity[]
  className?: string
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'upload',
    title: 'Video Uploaded',
    description: 'Uploaded road video from MG Road, Sector 12',
    timestamp: '10 min ago',
    icon: 'video',
    status: 'success'
  },
  {
    id: '2',
    type: 'detection',
    title: 'Potholes Detected',
    description: 'AI detected 5 new potholes in uploaded video',
    timestamp: '8 min ago',
    icon: 'map',
    status: 'success'
  },
  {
    id: '3',
    type: 'report',
    title: 'Report Submitted',
    description: 'Complaint #CMP-2024-0847 submitted successfully',
    timestamp: '2 hours ago',
    icon: 'alert',
    status: 'pending'
  },
  {
    id: '4',
    type: 'resolution',
    title: 'Road Repaired',
    description: 'Pothole at Gandhi Chowk has been repaired',
    timestamp: '3 days ago',
    icon: 'check',
    status: 'success'
  },
  {
    id: '5',
    type: 'detection',
    title: 'High Severity Alert',
    description: 'Critical pothole detected near Metro Station',
    timestamp: '1 day ago',
    icon: 'alert',
    status: 'success'
  },
  {
    id: '6',
    type: 'upload',
    title: 'Video Processing',
    description: 'Analyzing video from Nehru Road',
    timestamp: '2 days ago',
    icon: 'video',
    status: 'pending'
  },
]

const activityConfig = {
  upload: {
    icon: Upload,
    color: 'blue',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  detection: {
    icon: TrendingUp,
    color: 'purple',
    gradient: 'from-purple-500/20 to-indigo-500/20',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
  },
  report: {
    icon: AlertTriangle,
    color: 'orange',
    gradient: 'from-orange-500/20 to-red-500/20',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
  },
  resolution: {
    icon: CheckCircle,
    color: 'green',
    gradient: 'from-green-500/20 to-emerald-500/20',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-400',
  },
  complaint: {
    icon: AlertTriangle,
    color: 'orange',
    gradient: 'from-orange-500/20 to-red-500/20',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
  },
}

export default function ActivityFeed({ activities = mockActivities, className }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-2xl bg-slate-900/60 border border-slate-800/50 overflow-hidden', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
            <Clock className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Activity Feed</h3>
            <p className="text-sm text-slate-400">Recent updates</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Live</span>
        </div>
      </div>

      {/* Activities List */}
      <div className="max-h-96 overflow-y-auto">
        <div className="relative">
          {/* Animated line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-slate-700" />

          {activities.map((activity, i) => {
            const config = activityConfig[activity.type]
            const Icon = config.icon

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-start gap-4 p-4 hover:bg-slate-800/30 transition-colors"
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={cn(
                    'relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                    config.iconBg
                  )}
                >
                  <Icon className={cn('w-5 h-5', config.iconColor)} />
                  {activity.status === 'success' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-900 flex items-center justify-center">
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  {activity.status === 'pending' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 border-2 border-slate-900 flex items-center justify-center">
                      <Clock className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white">{activity.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{activity.description}</p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{activity.timestamp}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      'px-2 py-0.5 text-[10px] rounded-full font-medium capitalize',
                      `bg-${config.color}-500/20 text-${config.color}-400`
                    )}>
                      {activity.type}
                    </span>
                    {activity.status && (
                      <span className={cn(
                        'px-2 py-0.5 text-[10px] rounded-full font-medium capitalize',
                        activity.status === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : activity.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      )}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Connector */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-slate-700" />
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* View All Button */}
      <div className="p-4 border-t border-slate-800/50">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
          View All Activity
        </button>
      </div>
    </motion.div>
  )
}
