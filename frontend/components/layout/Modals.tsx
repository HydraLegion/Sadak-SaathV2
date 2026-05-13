'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, useNotificationStore } from '@/stores'
import { cn, formatRelativeTime } from '@/lib/utils'
import { X, Bell, Check, CheckCheck, Trash2, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

const notificationIcons = {
  info: <Info className="w-4 h-4 text-blue-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  success: <CheckCircle className="w-4 h-4 text-green-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore()
  const [localNotifications, setLocalNotifications] = useState(notifications)

  useEffect(() => {
    setLocalNotifications(notifications)
  }, [notifications])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 top-12 w-80 sm:w-96 max-h-96 overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Notifications</h3>
            <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
              {localNotifications.filter(n => !n.read).length} new
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAllAsRead()}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => clearNotifications()}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-all"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto">
          {localNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                <Bell className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm text-center">No notifications yet</p>
              <p className="text-slate-500 text-xs text-center mt-1">
                You'll see updates about your reports here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {localNotifications.slice(0, 10).map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    'p-4 hover:bg-slate-800/50 cursor-pointer transition-all',
                    !notification.read && 'bg-slate-800/30'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      notification.type === 'info' && 'bg-blue-500/20',
                      notification.type === 'warning' && 'bg-yellow-500/20',
                      notification.type === 'success' && 'bg-green-500/20',
                      notification.type === 'error' && 'bg-red-500/20'
                    )}>
                      {notificationIcons[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-white truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {formatRelativeTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {localNotifications.length > 0 && (
          <div className="p-3 border-t border-slate-700/50">
            <button className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-slate-800/50 rounded-lg transition-all">
              View all notifications
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, location: { lat: number; lng: number }) => void
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          // Default to Raipur coordinates
          setLocation({ lat: 21.2514, lng: 81.6296 })
        }
      )
    }
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!file || !location) return
    setUploading(true)
    await onUpload(file, location)
    setUploading(false)
    setFile(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg mx-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div>
              <h2 className="text-lg font-semibold text-white">Report Road Issue</h2>
              <p className="text-sm text-slate-400">Upload video or image of the issue</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              className={cn(
                'relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                dragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/30'
              )}
            >
              <input
                id="file-input"
                type="file"
                accept="video/*,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                    <Check className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Drop video or image here</p>
                  <p className="text-sm text-slate-400 mt-1">or click to browse</p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-slate-300">Location</span>
              </div>
              {location ? (
                <p className="text-sm text-white font-mono">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              ) : (
                <p className="text-sm text-slate-400">Detecting location...</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file || !location || uploading}
              className={cn(
                'px-4 py-2 text-sm rounded-lg font-medium transition-all',
                file && location
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              )}
            >
              {uploading ? 'Uploading...' : 'Submit Report'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface AIInsightsPanelProps {
  className?: string
}

const defaultInsights = [
  {
    title: 'Peak Incident Hours',
    description: 'Most incidents occur between 9-11 AM and 5-7 PM',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    trend: 'up' as const,
    color: 'blue',
  },
  {
    title: 'High Risk Zone Alert',
    description: 'MG Road area shows 40% above average incidents',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    trend: 'warning' as const,
    color: 'red',
  },
  {
    title: 'Resolution Improvement',
    description: 'Average resolution time improved by 23%',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    trend: 'up' as const,
    color: 'green',
  },
  {
    title: 'AI Detection Rate',
    description: 'Model accuracy: 94.2%',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    trend: 'stable' as const,
    color: 'purple',
  },
]

export function AIInsightsPanel({ className }: AIInsightsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl p-6', className)}
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">AI Insights</h3>
      </div>

      <div className="space-y-4">
        {defaultInsights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={cn(
              'p-4 rounded-xl border transition-all cursor-pointer',
              'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50',
              insight.color === 'red' && 'hover:border-red-500/30',
              insight.color === 'blue' && 'hover:border-blue-500/30',
              insight.color === 'green' && 'hover:border-green-500/30',
              insight.color === 'purple' && 'hover:border-purple-500/30'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                insight.color === 'red' && 'bg-red-500/20 text-red-400',
                insight.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                insight.color === 'green' && 'bg-green-500/20 text-green-400',
                insight.color === 'purple' && 'bg-purple-500/20 text-purple-400'
              )}>
                {insight.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-white text-sm">{insight.title}</h4>
                  {insight.trend === 'up' && (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                  {insight.trend === 'warning' && (
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

interface FloatingActionButtonProps {
  onClick: () => void
  icon?: React.ReactNode
  label?: string
}

export function FloatingActionButton({ onClick, icon, label = 'Add' }: FloatingActionButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center"
    >
      {icon || (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
      {label && (
        <span className="absolute -top-8 px-3 py-1 rounded-full bg-slate-900 text-white text-sm whitespace-nowrap">
          {label}
        </span>
      )}
    </motion.button>
  )
}