'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth'
import type { Pothole, Complaint, Notification } from '@/lib/types'

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

export function useDashboardData(): {
  potholes: Pothole[]
  complaints: Complaint[]
  notifications: Notification[]
  loading: boolean
  error: string | null
} & DashboardStats {
  const { user } = useAuthStore()
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const potholesQuery = query(collection(db, 'potholes'), where('createdBy', '==', user.uid), orderBy('createdAt', 'desc'), limit(100))
    const potholesUnsub = onSnapshot(potholesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pothole))
      setPotholes(data)
      setLoading(false)
    }, (err) => {
      console.error('Potholes error:', err)
      setError('Failed to load potholes')
      setLoading(false)
    })

    const complaintsQuery = query(collection(db, 'complaints'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(50))
    const complaintsUnsub = onSnapshot(complaintsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint))
      setComplaints(data)
    }, () => {})

    const notifQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(20))
    const notifUnsub = onSnapshot(notifQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification))
      setNotifications(data)
    }, () => {})

    return () => {
      potholesUnsub()
      complaintsUnsub()
      notifUnsub()
    }
  }, [user?.uid])

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

  return { potholes, complaints, notifications, loading, error, ...stats }
}

export function useGlobalPotholeData() {
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const potholesQuery = query(collection(db, 'potholes'), orderBy('createdAt', 'desc'), limit(500))
    const unsubscribe = onSnapshot(potholesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pothole))
      setPotholes(data)
      setLoading(false)
    }, () => setLoading(false))
    return () => unsubscribe()
  }, [])

  return { potholes, loading }
}

export function useUnreadNotificationsCount() {
  const { user } = useAuthStore()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user?.uid) return
    const notifQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid), where('read', '==', false))
    const unsubscribe = onSnapshot(notifQuery, (snapshot) => setCount(snapshot.size), () => setCount(0))
    return () => unsubscribe()
  }, [user?.uid])

  return count
}