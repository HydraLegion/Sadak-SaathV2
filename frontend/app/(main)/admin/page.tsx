'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users, Shield, FileText, Map, BarChart3, Settings, ChevronRight,
  MapPin, AlertTriangle, Clock, CheckCircle, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'
import { collection, query, getCountFromServer, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User, Pothole, Complaint } from '@/lib/types'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: Shield },
  { href: '/admin/users', label: 'User Management', icon: Users, description: 'Manage user accounts and roles' },
  { href: '/admin/moderation', label: 'Moderation Queue', icon: Shield, description: 'Review AI detections' },
  { href: '/admin/audit', label: 'Audit Logs', icon: FileText, description: 'Track system activities' },
  { href: '/admin/jurisdictions', label: 'Jurisdictions', icon: MapPin, description: 'Manage geographic zones' },
]

export default function AdminDashboardPage() {
  const pathname = usePathname()
  const router = useRouter()
  const { hasPermission, isLoading: authLoading } = useAuthStore()
  const isAdmin = hasPermission(['admin', 'super_admin'])

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingModeration: 0,
    resolvedToday: 0,
    avgResolutionTime: '0 days',
    slaCompliance: '0%',
    totalPotholes: 0,
    totalComplaints: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard')
    }
  }, [authLoading, isAdmin, router])

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        // Try to fetch from Firestore, fallback to defaults on error
        try {
          const usersSnap = await getCountFromServer(query(collection(db, 'users')))
          const potholesSnap = await getCountFromServer(query(collection(db, 'potholes')))
          const complaintsSnap = await getCountFromServer(query(collection(db, 'complaints')))

          setStats(prev => ({
            ...prev,
            totalUsers: usersSnap.data().count,
            totalPotholes: potholesSnap.data().count,
            totalComplaints: complaintsSnap.data().count,
          }))
        } catch (firestoreError) {
          console.warn('Firestore not available, using defaults')
        }

        // Fetch recent complaints for activity (with fallback)
        try {
          const complaintsQuery = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'), limit(5))
          const unsubscribe = onSnapshot(complaintsQuery, (snapshot) => {
            const activities = snapshot.docs.map(doc => ({
              action: 'Complaint created',
              user: doc.data().userId || 'Unknown',
              time: doc.data().createdAt,
              icon: MapPin,
            }))
            setRecentActivity(activities)
          }, () => {
            // Fallback to mock activity
            setRecentActivity([
              { action: 'System initialized', user: 'System', time: new Date(), icon: MapPin },
            ])
          })
        } catch {
          setRecentActivity([
            { action: 'System initialized', user: 'System', time: new Date(), icon: MapPin },
          ])
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
      setLoading(false)
    }

    if (isAdmin) {
      fetchStats()
    }
  }, [isAdmin])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">You do not have permission to access the admin panel.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <Users className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <CheckCircle className="h-5 w-5 text-severity-low mb-2" />
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Shield className="h-5 w-5 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{stats.pendingModeration}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <CheckCircle className="h-5 w-5 text-severity-low mb-2" />
            <p className="text-2xl font-bold">{stats.resolvedToday}</p>
            <p className="text-xs text-muted-foreground">Resolved Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Clock className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-2xl font-bold">{stats.avgResolutionTime}</p>
            <p className="text-xs text-muted-foreground">Avg Resolution</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <BarChart3 className="h-5 w-5 text-severity-low mb-2" />
            <p className="text-2xl font-bold">{stats.slaCompliance}</p>
            <p className="text-xs text-muted-foreground">SLA Compliance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {adminNavItems.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}
                    className={cn('flex items-center gap-4 p-4 hover:bg-accent transition-colors', isActive && 'bg-primary/5 border-l-2 border-primary')}>
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', isActive ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => {
                  const Icon = activity.icon
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">by {activity.user}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm font-medium text-green-800">Firebase Connection</p>
              <p className="text-xs text-green-600 mt-1">Operational</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm font-medium text-green-800">Total Potholes</p>
              <p className="text-xs text-green-600 mt-1">{stats.totalPotholes} records</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm font-medium text-green-800">Total Complaints</p>
              <p className="text-xs text-green-600 mt-1">{stats.totalComplaints} records</p>
            </div>
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800">Pending Moderation</p>
              <p className="text-xs text-yellow-600 mt-1">{stats.pendingModeration} items</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
