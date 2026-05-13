'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts'
import {
  MapPin, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
  Eye, Radio, Activity, Zap, Shield, Users, FileText, Ambulance,
  RefreshCw, ArrowRight, ChevronRight, Maximize2, Play, Pause,
  Map as MapIcon, AlertCircle, Bell, Calendar, Target, Layers,
  ChevronUp, ChevronDown, Flame, Wind, Droplets, EyeOff, BarChart3
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Pothole, Complaint } from '@/lib/types'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.05 }
  }
}

// Weekly data generator from real potholes
const getWeeklyData = (potholes: Pothole[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day, i) => {
    const dayOfWeek = i === 0 ? 7 : i // Sunday = 7
    const dayPotholes = potholes.filter(p => {
      const d = p.createdAt instanceof Date ? p.createdAt : new Date((p.createdAt as any)?.seconds ? (p.createdAt as any).seconds * 1000 : Date.now())
      return d.getDay() === dayOfWeek || (dayOfWeek === 7 && d.getDay() === 0)
    })
    const incidents = dayPotholes.length
    const resolved = dayPotholes.filter(p => p.status === 'resolved').length
    // Only show real data, no random fallbacks
    return {
      day,
      incidents: incidents || 0,
      resolved: resolved || 0
    }
  })
}

// Chhattisgarh demo data
const chhattisgarhDemoData = {
  potholes: [
    { id: 'demo-1', severity: 'critical' as const, status: 'pending' as const, address: 'Ring Road No 1, Raipur', lat: 21.2514, lng: 81.6296, confidence: 0.94, createdAt: new Date(Date.now() - 1000 * 60 * 30), jurisdictionId: 'CG-Central' },
    { id: 'demo-2', severity: 'high' as const, status: 'verified' as const, address: 'GE Road, Bhilai', lat: 21.2139, lng: 81.3865, confidence: 0.89, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), jurisdictionId: 'CG-East' },
    { id: 'demo-3', severity: 'medium' as const, status: 'in_progress' as const, address: 'Mahadev Ghat Road, Bilaspur', lat: 22.0791, lng: 82.1409, confidence: 0.82, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), jurisdictionId: 'CG-North' },
    { id: 'demo-4', severity: 'low' as const, status: 'verified' as const, address: 'Jagdalpur Main Road, Bastar', lat: 19.0873, lng: 82.0234, confidence: 0.76, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), jurisdictionId: 'CG-South' },
    { id: 'demo-5', severity: 'high' as const, status: 'resolved' as const, address: 'Shankar Nagar, Raipur', lat: 21.2504, lng: 81.6460, confidence: 0.91, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), jurisdictionId: 'CG-Central' },
  ] as Pothole[],
  complaints: [
    { id: 'comp-1', title: 'Deep pothole near bus stand', status: 'submitted' as const, priority: 'critical' as const, createdAt: new Date(Date.now() - 1000 * 60 * 30) },
    { id: 'comp-2', title: 'Road damage near school', status: 'acknowledged' as const, priority: 'high' as const, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: 'comp-3', title: 'Multiple potholes on highway', status: 'in_progress' as const, priority: 'medium' as const, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    { id: 'comp-4', title: 'Waterlogging with potholes', status: 'resolved' as const, priority: 'low' as const, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  ] as unknown as Complaint[],
}

// Live activities from real or demo data
const getLiveActivities = (potholes: Pothole[], useDemo: boolean = false) => {
  const data = useDemo ? chhattisgarhDemoData.potholes : potholes
  if (data.length === 0) {
    return [
      { action: 'No recent activity', location: 'Dashboard', time: '-', type: 'ai' },
    ]
  }
  return data.slice(0, 5).map((p) => {
    const locationStr = p.address?.trim()
      ? p.address
      : p.lat && p.lng
        ? `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`
        : 'Chhattisgarh'
    return {
      action: p.status === 'verified' ? 'New pothole detected' :
             p.status === 'resolved' ? 'Pothole repaired' :
             p.status === 'in_progress' ? 'Repair in progress' : 'Report submitted',
      location: locationStr,
      time: formatRelativeTime(p.createdAt),
      type: p.status === 'resolved' ? 'resolved' : p.status === 'verified' ? 'ai' : 'response'
    }
  })
}

// Weekly demo data from Chhattisgarh
const getWeeklyDemoData = () => [
  { day: 'Mon', incidents: 12, resolved: 8 },
  { day: 'Tue', incidents: 15, resolved: 11 },
  { day: 'Wed', incidents: 8, resolved: 6 },
  { day: 'Thu', incidents: 18, resolved: 12 },
  { day: 'Fri', incidents: 14, resolved: 10 },
  { day: 'Sat', incidents: 22, resolved: 15 },
  { day: 'Sun', incidents: 6, resolved: 4 },
]

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore()
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      window.location.href = '/auth'
      return
    }

    // Delay to prevent rapid reconnection issues
    const timeoutId = setTimeout(() => {
      try {
        // Query user's own potholes
        const potholesQuery = query(
          collection(db, 'potholes'),
          where('createdBy', '==', user?.uid || ''),
          orderBy('createdAt', 'desc'),
          limit(100)
        )

        const potholesUnsub = onSnapshot(
          potholesQuery,
          (snapshot) => {
            try {
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pothole))
              setPotholes(data)
            } catch (e) {
              console.error('Error parsing potholes:', e)
            }
            setLoading(false)
          },
          (error) => {
            console.error('Firestore potholes error:', error)
            setLoading(false)
          }
        )

        // Query user's complaints
        const complaintsQuery = query(
          collection(db, 'complaints'),
          where('userId', '==', user?.uid || ''),
          orderBy('createdAt', 'desc'),
          limit(50)
        )

        const complaintsUnsub = onSnapshot(
          complaintsQuery,
          (snapshot) => {
            try {
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint))
              setComplaints(data)
            } catch (e) {
              console.error('Error parsing complaints:', e)
            }
          },
          () => {}
        )

        setLoading(false)
        return () => {
          try {
            potholesUnsub()
            complaintsUnsub()
          } catch (e) {
            console.error('Error unsubscribing:', e)
          }
        }
      } catch (error) {
        console.error('Firestore setup error:', error)
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [isAuthenticated, user?.uid])

  // Real stats from Firestore data
  const totalPotholes = potholes.length
  const resolvedCount = potholes.filter(p => p.status === 'resolved').length
  const resolutionRate = totalPotholes > 0 ? Math.round((resolvedCount / totalPotholes) * 100) : 0

  // Calculate AI confidence from real data
  const useDemoData = potholes.length === 0 && complaints.length === 0
  const demoPotholes = chhattisgarhDemoData.potholes
  const demoComplaints = chhattisgarhDemoData.complaints

  const displayPotholes = useDemoData ? demoPotholes : potholes
  const displayComplaints = useDemoData ? demoComplaints : complaints

  const avgConfidence = displayPotholes.length > 0
    ? Math.round((displayPotholes.reduce((sum, p) => sum + (p.confidence || 0), 0) / displayPotholes.length) * 100)
    : 87 // Default for demo

  // Complaints stats
  const submittedComplaints = displayComplaints.filter(c => c.status === 'submitted').length
  const acknowledgedComplaints = displayComplaints.filter(c => c.status === 'acknowledged').length
  const inProgressComplaints = displayComplaints.filter(c => c.status === 'in_progress').length
  const resolvedComplaintsCount = displayComplaints.filter(c => c.status === 'resolved').length

  // Dynamic data from real or demo potholes
  const weeklyData = useDemoData ? getWeeklyDemoData() : getWeeklyData(displayPotholes)

  const criticalCount = displayPotholes.filter(p => p.severity === 'critical').length
  const highCount = displayPotholes.filter(p => p.severity === 'high').length
  const mediumCount = displayPotholes.filter(p => p.severity === 'medium').length
  const lowCount = displayPotholes.filter(p => p.severity === 'low').length

  const severityDistribution = [
    { name: 'Critical', value: criticalCount, color: '#ef4444' },
    { name: 'High', value: highCount, color: '#f97316' },
    { name: 'Medium', value: mediumCount, color: '#eab308' },
    { name: 'Low', value: lowCount, color: '#22c55e' },
  ]
  const liveActivitiesData = getLiveActivities(displayPotholes, useDemoData)

  const stats = [
    { label: 'My Reports', value: displayPotholes.length, icon: AlertTriangle, color: 'from-red-500 to-orange-500', glow: 'shadow-red-500/20' },
    { label: 'Complaints', value: displayComplaints.length, icon: FileText, color: 'from-purple-500 to-pink-500', glow: 'shadow-purple-500/20' },
    { label: 'Verified', value: displayPotholes.filter(p => p.status === 'verified' || p.status === 'in_progress').length, icon: CheckCircle, color: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/20' },
    { label: 'Critical', value: criticalCount, icon: Ambulance, color: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20' },
    { label: 'Pending', value: inProgressComplaints + acknowledgedComplaints + submittedComplaints, icon: Clock, color: 'from-yellow-500 to-orange-500', glow: 'shadow-yellow-500/20' },
    { label: 'Resolved', value: resolvedComplaintsCount, icon: CheckCircle, color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20' },
  ]

  // AI Insights from real data
  const aiInsights = [
    { title: 'Total Reports', description: `${displayPotholes.length} potholes reported`, icon: MapPin, trend: 'up' },
    { title: 'Active Complaints', description: `${displayComplaints.filter(c => !['resolved', 'closed'].includes(c.status)).length} complaints in progress`, icon: AlertTriangle, trend: 'warning' },
    { title: 'Resolved', description: `${resolvedComplaintsCount} issues resolved`, icon: TrendingUp, trend: 'up' },
    { title: 'Accuracy', description: `${avgConfidence}% avg detection confidence`, icon: CheckCircle, trend: 'stable' },
  ]

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-red-500"
        />
      </div>
    )
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6 pb-8"
    >
      {/* Hero Section */}
      <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-800/50 border border-slate-700/50 backdrop-blur-xl p-6 lg:p-8">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30"
                >
                  <Radio className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-400 font-medium">MY DASHBOARD</span>
                </motion.div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
              </h1>
              <p className="text-slate-300 mt-1">Track and manage your reported road issues</p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLive(!isLive)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl border transition-all',
                  isLive ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'
                )}
              >
                {isLive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isLive ? 'Live' : 'Paused'}
              </motion.button>

              <Link href="/report">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium shadow-lg shadow-red-500/25"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report Incident
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-200">Live Activity Feed</span>
              </div>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {liveActivitiesData.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
                ) : (
                  liveActivitiesData.map((activity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        activity.type === 'ai' ? 'bg-blue-500' :
                        activity.type === 'response' ? 'bg-green-500' :
                        activity.type === 'resolved' ? 'bg-slate-500' : 'bg-red-500'
                      )} />
                      <p className="text-slate-300 flex-1">{activity.action}</p>
                      <span className="text-slate-500 text-xs truncate max-w-[80px]">{activity.location}</span>
                      <span className="text-slate-400 text-xs">{activity.time}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-300">AI Confidence Score</span>
              </div>
              <div className="flex items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="relative w-24 h-24"
                >
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="8" fill="none" />
                    <motion.circle
                      cx="48" cy="48" r="40"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 * (1 - avgConfidence / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{avgConfidence}%</span>
                  </div>
                </motion.div>
                <div className="flex-1 space-y-2">
                  <div className="text-3xl font-bold text-white">{avgConfidence}%</div>
                  <p className="text-sm text-slate-400">Your Reports Accuracy</p>
                  <div className="flex items-center gap-1 text-blue-400 text-sm">
                    <Radio className="w-4 h-4" />
                    {displayPotholes.length} total reports
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={i}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -4 }}
              className={cn(
                'group relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl border transition-all duration-300',
                'bg-slate-900/50 border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/50'
              )}
            >
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', stat.color)} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('p-2 rounded-xl bg-gradient-to-br', stat.color, 'shadow-lg', stat.glow)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="text-2xl lg:text-3xl font-bold mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-300">{stat.label}</p>
              </div>

              <div className={cn('absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br', stat.color)} />
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <motion.div
          variants={fadeInUp}
          className="lg:col-span-2 rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">My Reports This Week</h3>
              <p className="text-sm text-slate-300">Your submitted reports by day</p>
            </div>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Incidents</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Resolved</span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#ef4444" fill="url(#incidentGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" stroke="#22c55e" fill="url(#resolvedGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Severity Distribution */}
        <motion.div
          variants={fadeInUp}
          className="rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-6">Severity Distribution</h3>

          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{displayPotholes.length}</div>
                <p className="text-xs text-slate-300">Total</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {severityDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}</span>
                <span className="ml-auto font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Incidents & AI Insights */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Incidents */}
        <motion.div variants={fadeInUp} className="lg:col-span-2 rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">My Reports</h3>
              <p className="text-sm text-slate-300">Your submitted pothole reports</p>
            </div>
            <Link href="/complaints" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {displayPotholes.slice(0, 4).map((pothole) => (
              <motion.div
                key={pothole.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600"
              >
                <div className="relative">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    pothole.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                    pothole.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                    pothole.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-green-500/20 text-green-500'
                  )}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  {pothole.severity === 'critical' && (
                    <div className="absolute -inset-1 rounded-xl bg-red-500/30 animate-pulse" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">pothole</span>
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full capitalize',
                      pothole.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      pothole.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      pothole.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    )}>
                      {pothole.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 truncate">
                    {pothole.address || `${pothole.lat?.toFixed(4)}, ${pothole.lng?.toFixed(4)}`} • {formatRelativeTime(pothole.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium">{Math.round((pothole.confidence || 0) * 100)}%</span>
                  </div>
                  <p className="text-xs text-slate-300">AI Confidence</p>
                </div>

                <div className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  pothole.status === 'verified' ? 'bg-blue-500/20 text-blue-400' :
                  pothole.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                  pothole.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                  'bg-slate-500/20 text-slate-400'
                )}>
                  {pothole.status?.replace('_', ' ')}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={fadeInUp} className="rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">AI Insights</h3>
          </div>

          <div className="space-y-4">
            {aiInsights.map((insight, i) => {
              const Icon = insight.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      insight.trend === 'up' ? 'bg-green-500/20' :
                      insight.trend === 'warning' ? 'bg-red-500/20' : 'bg-blue-500/20'
                    )}>
                      <Icon className={cn(
                        'w-4 h-4',
                        insight.trend === 'up' ? 'text-green-500' :
                        insight.trend === 'warning' ? 'text-red-500' : 'text-blue-500'
                      )} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{insight.description}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Report Pothole', desc: 'Submit a new road issue', icon: AlertTriangle, color: 'from-red-500 to-orange-500', href: '/report' },
          { title: 'View Map', desc: 'See all reported issues', icon: MapIcon, color: 'from-blue-500 to-cyan-500', href: '/map' },
          { title: 'My Complaints', desc: 'Track your reports', icon: FileText, color: 'from-purple-500 to-pink-500', href: '/complaints' },
          { title: 'Analytics', desc: 'View road statistics', icon: BarChart3, color: 'from-green-500 to-emerald-500', href: '/analytics' },
        ].map((action, i) => {
          const Icon = action.icon
          return (
            <Link key={i} href={action.href}>
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700 cursor-pointer transition-all"
              >
                <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br mb-4', action.color, 'flex items-center justify-center shadow-lg')}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-1 group-hover:text-red-400 transition-colors">{action.title}</h4>
                <p className="text-sm text-slate-300">{action.desc}</p>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}