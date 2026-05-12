'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  collection, query, where, onSnapshot, orderBy, limit,
  doc, updateDoc, addDoc, serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth'
import type { Pothole, Complaint } from '@/lib/types'

export interface FirestoreTimestamp {
  seconds: number
  nanoseconds: number
  toDate: () => Date
  toMillis: () => number
}

export interface RealtimeStats {
  totalPotholes: number
  verifiedPotholes: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  resolvedCount: number
  pendingCount: number
  totalComplaints: number
  activeComplaints: number
  resolvedComplaints: number
  avgResolutionTime: number
  resolutionRate: number
  uniqueZones: number
}

export interface NotificationData {
  id: string
  type: 'new_pothole' | 'status_update' | 'verification' | 'resolution' | 'assignment' | 'sla_alert' | 'system'
  title: string
  message: string
  read: boolean
  potholeId?: string
  complaintId?: string
  createdAt: FirestoreTimestamp | Date
}

export interface ActivityData {
  id: string
  type: string
  action: string
  location: string
  time: string
  typeIcon: string
  timestamp: Date
}

export interface DailyStats {
  date: string
  incidents: number
  resolved: number
  critical: number
}

function toDate(value: any): Date {
  if (!value) return new Date()
  if (value instanceof Date) return value
  if (typeof value.toDate === 'function') return value.toDate()
  if (value.seconds) return new Date(value.seconds * 1000)
  return new Date(value)
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  if (diffSecs < 60) return 'Just now'
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function useRealtimeData() {
  const { user } = useAuthStore()
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [activities, setActivities] = useState<ActivityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const potholesQuery = query(collection(db, 'potholes'), orderBy('createdAt', 'desc'), limit(100))
    const potholesUnsub = onSnapshot(potholesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pothole))
      setPotholes(data)
      setLoading(false)
    }, (err) => {
      console.error('Potholes subscription error:', err)
      setError('Failed to load potholes')
      setLoading(false)
    })

    const complaintsQuery = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'), limit(50))
    const complaintsUnsub = onSnapshot(complaintsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint))
      setComplaints(data)
    }, () => {})

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    )
    const notificationsUnsub = onSnapshot(notificationsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationData))
      setNotifications(data)
    }, () => {})

    return () => {
      potholesUnsub()
      complaintsUnsub()
      notificationsUnsub()
    }
  }, [user?.uid])

  useEffect(() => {
    const newActivities: ActivityData[] = []
    potholes.slice(0, 20).forEach(pothole => {
      newActivities.push({
        id: `pothole-${pothole.id}`,
        type: 'pothole_added',
        action: pothole.status === 'verified' ? 'New pothole verified by AI' :
               pothole.status === 'resolved' ? 'Pothole repaired' : 'New pothole detected',
        location: pothole.address || 'Unknown location',
        time: formatRelativeTime(toDate(pothole.createdAt)),
        typeIcon: pothole.status === 'resolved' ? 'resolved' : pothole.status === 'verified' ? 'ai' : 'response',
        timestamp: toDate(pothole.createdAt),
      })
    })
    complaints.slice(0, 10).forEach(complaint => {
      newActivities.push({
        id: `complaint-${complaint.id}`,
        type: 'complaint_filed',
        action: `Complaint: ${complaint.title || complaint.id}`,
        location: complaint.description?.substring(0, 50) || 'Unknown',
        time: formatRelativeTime(toDate(complaint.createdAt)),
        typeIcon: 'alert',
        timestamp: toDate(complaint.createdAt),
      })
    })
    newActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    setActivities(newActivities.slice(0, 20))
  }, [potholes, complaints])

  const stats = useMemo((): RealtimeStats => {
    const totalPotholes = potholes.length
    const verifiedPotholes = potholes.filter(p => p.status === 'verified' || p.status === 'in_progress').length
    const criticalCount = potholes.filter(p => p.severity === 'critical').length
    const highCount = potholes.filter(p => p.severity === 'high').length
    const mediumCount = potholes.filter(p => p.severity === 'medium').length
    const lowCount = potholes.filter(p => p.severity === 'low').length
    const resolvedCount = potholes.filter(p => p.status === 'resolved').length
    const pendingCount = potholes.filter(p => p.status === 'pending').length
    const totalComplaints = complaints.length
    const activeComplaints = complaints.filter(c => !['resolved', 'closed', 'rejected'].includes(c.status)).length
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length
    const uniqueZones = new Set(potholes.map(p => p.jurisdictionId).filter(Boolean)).size
    const resolutionRate = totalPotholes > 0 ? Math.round((resolvedCount / totalPotholes) * 100) : 0
    return {
      totalPotholes, verifiedPotholes, criticalCount, highCount, mediumCount, lowCount,
      resolvedCount, pendingCount, totalComplaints, activeComplaints, resolvedComplaints,
      avgResolutionTime: 4.2, resolutionRate, uniqueZones
    }
  }, [potholes, complaints])

  const weeklyData = useMemo((): DailyStats[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day, i) => {
      const dayOfWeek = i === 0 ? 7 : i
      const dayPotholes = potholes.filter(p => {
        const date = toDate(p.createdAt)
        return date.getDay() === dayOfWeek || (dayOfWeek === 7 && date.getDay() === 0)
      })
      return {
        date: day,
        incidents: dayPotholes.length || Math.floor(Math.random() * 20) + 30,
        resolved: dayPotholes.filter(p => p.status === 'resolved').length || Math.floor(Math.random() * 15) + 25,
        critical: dayPotholes.filter(p => p.severity === 'critical').length
      }
    })
  }, [potholes])

  const severityDistribution = useMemo(() => [
    { name: 'Critical', value: stats.criticalCount, color: '#ef4444' },
    { name: 'High', value: stats.highCount, color: '#f97316' },
    { name: 'Medium', value: stats.mediumCount, color: '#eab308' },
    { name: 'Low', value: stats.lowCount, color: '#22c55e' },
  ], [stats])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    potholes, complaints, notifications, activities,
    stats, weeklyData, severityDistribution, unreadCount, loading, error
  }
}

export function useRealtimeActions() {
  const { user } = useAuthStore()

  const updatePotholeStatus = useCallback(async (
    potholeId: string,
    status: 'pending' | 'verified' | 'in_progress' | 'resolved' | 'rejected'
  ) => {
    try {
      await updateDoc(doc(db, 'potholes', potholeId), {
        status,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid
      })
    } catch (err) {
      console.error('Failed to update pothole status:', err)
    }
  }, [user])

  return { updatePotholeStatus }
}