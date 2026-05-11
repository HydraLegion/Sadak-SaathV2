import { useState, useEffect } from 'react'
import { onMessage, getMessaging, getToken } from 'firebase/messaging'
import { messaging } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Notification } from '@/lib/types'

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[]

      setNotifications(notifs)
      setUnreadCount(notifs.filter(n => !n.read).length)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  return { notifications, unreadCount, loading }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export async function getFCMToken(): Promise<string | null> {
  try {
    if (!messaging) {
      console.log('Messaging not supported')
      return null
    }

    const permission = await requestNotificationPermission()
    if (!permission) return null

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    return token
  } catch (error) {
    console.error('Failed to get FCM token:', error)
    return null
  }
}

export function useFCMListener(onMessageCallback: (payload: unknown) => void) {
  useEffect(() => {
    if (!messaging) return

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload)
      onMessageCallback(payload)
    })

    return () => unsubscribe()
  }, [onMessageCallback])
}
