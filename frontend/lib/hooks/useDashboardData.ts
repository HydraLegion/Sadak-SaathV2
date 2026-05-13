'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth'
import type { Pothole, Complaint, Notification, Detection } from '@/lib/types'

interface DashboardData {
  potholes: Pothole[]
  complaints: Complaint[]
  notifications: Notification[]
  detections: Detection[]
  loading: boolean
  error: string | null
}

interface DashboardStats {
  totalReports: number
  potholesDetected: number
  activeComplaints: number
  resolvedComplaints: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  pendingComplaints: number
  inProgressComplaints: number
}

export function useDashboardData(): DashboardData & DashboardStats {
  const { user } = useAuthStore()
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [detections, setDetections] = useState<Detection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Real-time listener for user's potholes
    const potholesQuery = query(
      collection(db, 'potholes'),
      where('createdBy', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(100)
    )

    const potholesUnsub = onSnapshot(
      potholesQuery,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pothole))
        setPotholes(data)
        setLoading(false)
      },
      (err) => {
        console.error('Potholes error:', err)
        setError('Failed to load potholes')
        setLoading(false)
      }
    )

    // Real-time listener for user's complaints
    const complaintsQuery = query(
      collection(db, 'complaints'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const complaintsUnsub = onSnapshot(
      complaintsQuery,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint))
        setComplaints(data)
      },
      (err) => {
        console.error('Complaints error:', err)
      }
    )

    // Real-time listener for notifications
    const notifQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    )

    const notifUnsub = onSnapshot(
      notifQuery,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification))
        setNotifications(data)
      },
      (err) => {
        console.error('Notifications error:', err)
      }
    )

    // Real-time listener for detections
    const detectionsQuery = query(
      collection(db, 'detections'),
      where('processedBy', '==', 'ai'),
      orderBy('processedAt', 'desc'),
      limit(50)
    )

    const detectionsUnsub = onSnapshot(
      detectionsQuery,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Detection))
        setDetections(data)
      },
      (err) => {
        console.error('Detections error:', err)
      }
    )

    return () => {
      potholesUnsub()
      complaintsUnsub()
      notifUnsub()
      detectionsUnsub()
    }
  }, [user?.uid])

  // Calculate stats from real data
  const stats: DashboardStats = {
    totalReports: potholes.length + complaints.length,
    potholesDetected: potholes.length,
    activeComplaints: complaints.filter(c => !['resolved', 'closed', 'escalated'].includes(c.status)).length,
    resolvedComplaints: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
    criticalCount: potholes.filter(p => p.severity === 'critical').length,
    highCount: potholes.filter(p => p.severity === 'high').length,
    mediumCount: potholes.filter(p => p.severity === 'medium').length,
    lowCount: potholes.filter(p => p.severity === 'low').length,
    pendingComplaints: complaints.filter(c => c.status === 'submitted' || c.status === 'acknowledged').length,
    inProgressComplaints: complaints.filter(c => c.status === 'assigned' || c.status === 'in_progress').length,
  }

  return {
    potholes,
    complaints,
    notifications,
    detections,
    loading,
    error,
    ...stats,
  }
}

// Hook for fetching global pothole data (for map)
export function useGlobalPotholeData() {
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const potholesQuery = query(
      collection(db, 'potholes'),
      orderBy('createdAt', 'desc'),
      limit(500)
    )

    const unsubscribe = onSnapshot(
      potholesQuery,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pothole))
        setPotholes(data)
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { potholes, loading }
}

// Hook for realtime notifications count
export function useUnreadNotificationsCount() {
  const { user } = useAuthStore()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user?.uid) return

    const notifQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    )

    const unsubscribe = onSnapshot(
      notifQuery,
      (snapshot) => setCount(snapshot.size),
      () => setCount(0)
    )

    return () => unsubscribe()
  }, [user?.uid])

  return count
}
