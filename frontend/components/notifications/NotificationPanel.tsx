'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { BellOff, Check, CheckCheck, MapPin, AlertTriangle, FileText, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatRelativeTime } from '@/lib/utils'
import { collection, doc, updateDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Notification } from '@/lib/types'

const notificationIcons = {
  complaint_update: FileText,
  new_detection: MapPin,
  assignment: Bell,
  sla_alert: AlertTriangle,
  system: Bell,
}

const notificationColors = {
  complaint_update: 'text-blue-600 bg-blue-50',
  new_detection: 'text-green-600 bg-green-50',
  assignment: 'text-purple-600 bg-purple-50',
  sla_alert: 'text-red-600 bg-red-50',
  system: 'text-gray-600 bg-gray-50',
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (!user?.uid || !isOpen) return

    const loadNotifications = async () => {
      setLoading(true)
      try {
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        const notifs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[]
        setNotifications(notifs)
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }
      setLoading(false)
    }

    loadNotifications()
  }, [user?.uid, isOpen])

  if (!isOpen) return null

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  const markAsRead = async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: serverTimestamp(),
    })
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read)
    await Promise.all(
      unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true, readAt: serverTimestamp() }))
    )
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <Card className="absolute right-0 top-12 w-80 z-50 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>
              All
            </Button>
            <Button variant={filter === 'unread' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('unread')}>
              Unread ({unreadCount})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 max-h-[400px] overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell
                const colorClass = notificationColors[notification.type] || 'text-gray-600 bg-gray-50'
                return (
                  <div
                    key={notification.id}
                    className={cn('p-4 hover:bg-accent transition-colors cursor-pointer', !notification.read && 'bg-primary/5')}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', colorClass)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{notification.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{notification.body}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}