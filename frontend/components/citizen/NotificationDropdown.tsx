'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Bell, CheckCircle, AlertTriangle, MapPin, Clock, Video,
  Eye, MessageSquare, ChevronRight, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'report' | 'detection' | 'complaint' | 'system'
  title: string
  message: string
  time: string
  read: boolean
  icon: 'map' | 'video' | 'alert' | 'check'
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'report',
    title: 'Pothole Detected',
    message: 'AI detected 3 new potholes in your reported area',
    time: '2 min ago',
    read: false,
    icon: 'map'
  },
  {
    id: '2',
    type: 'complaint',
    title: 'Complaint Updated',
    message: 'Your complaint #CMP-2024-0847 is now being processed',
    time: '15 min ago',
    read: false,
    icon: 'alert'
  },
  {
    id: '3',
    type: 'detection',
    title: 'Video Processed',
    message: 'Your uploaded video has been analyzed. 5 potholes found.',
    time: '1 hour ago',
    read: true,
    icon: 'video'
  },
  {
    id: '4',
    type: 'system',
    title: 'Report Resolved',
    message: 'Pothole at MG Road has been repaired successfully',
    time: '3 hours ago',
    read: true,
    icon: 'check'
  },
]

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'map': return <MapPin className="w-4 h-4 text-blue-400" />
      case 'video': return <Video className="w-4 h-4 text-purple-400" />
      case 'alert': return <AlertTriangle className="w-4 h-4 text-orange-400" />
      case 'check': return <CheckCircle className="w-4 h-4 text-green-400" />
      default: return <Bell className="w-4 h-4 text-slate-400" />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'report': return 'bg-blue-500/20'
      case 'detection': return 'bg-purple-500/20'
      case 'complaint': return 'bg-orange-500/20'
      case 'system': return 'bg-green-500/20'
      default: return 'bg-slate-500/20'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 shadow-xl shadow-black/30 overflow-hidden z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors text-xs">
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification, i) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'relative p-4 border-b border-slate-800/30 hover:bg-slate-800/30 transition-colors cursor-pointer',
                  !notification.read && 'bg-slate-800/20'
                )}
              >
                {!notification.read && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
                <div className="flex items-start gap-3 pl-3">
                  <div className={cn('p-2 rounded-xl flex-shrink-0', getIconBg(notification.type))}>
                    {getIcon(notification.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{notification.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {notification.time}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800/50">
            <Link
              href="/citizen-dashboard/notifications"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              View all notifications
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
