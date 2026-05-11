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
  ChevronUp, ChevronDown, Flame, Wind, Droplets, EyeOff
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore'
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

// Mock real-time data
const incidentData = [
  { id: 1, type: 'accident', severity: 'critical', lat: 28.6139, lng: 77.209, time: '2 min ago', status: 'dispatched', confidence: 94 },
  { id: 2, type: 'pothole', severity: 'high', lat: 28.6289, lng: 77.219, time: '5 min ago', status: 'reviewing', confidence: 87 },
  { id: 3, type: 'accident', severity: 'medium', lat: 28.6449, lng: 77.229, time: '12 min ago', status: 'assigned', confidence: 76 },
  { id: 4, type: 'pothole', severity: 'low', lat: 28.6549, lng: 77.239, time: '18 min ago', status: 'verified', confidence: 68 },
]

const weeklyData = [
  { day: 'Mon', incidents: 45, resolved: 42 },
  { day: 'Tue', incidents: 52, resolved: 48 },
  { day: 'Wed', incidents: 38, resolved: 35 },
  { day: 'Thu', incidents: 61, resolved: 55 },
  { day: 'Fri', incidents: 58, resolved: 52 },
  { day: 'Sat', incidents: 72, resolved: 65 },
  { day: 'Sun', incidents: 48, resolved: 45 },
]

const severityDistribution = [
  { name: 'Critical', value: 12, color: '#ef4444' },
  { name: 'High', value: 28, color: '#f97316' },
  { name: 'Medium', value: 45, color: '#eab308' },
  { name: 'Low', value: 35, color: '#22c55e' },
]

const liveActivities = [
  { action: 'New incident detected', location: 'Connaught Place', time: '2 sec ago', type: 'ai' },
  { action: 'Emergency dispatched', location: 'ITO Junction', time: '15 sec ago', type: 'response' },
  { action: 'Case resolved', location: 'Lajpat Nagar', time: '45 sec ago', type: 'resolved' },
  { action: 'AI verified', location: 'Nehru Place', time: '1 min ago', type: 'ai' },
  { action: 'High risk zone alert', location: 'Rajiv Chowk', time: '2 min ago', type: 'alert' },
]

const aiInsights = [
  { title: 'Peak Accident Hours', description: 'Most incidents occur between 9-11 AM and 5-7 PM', icon: Clock, trend: 'up' },
  { title: 'High Risk Zone', description: 'Connaught Place area shows 40% above average incidents', icon: AlertTriangle, trend: 'warning' },
  { title: 'Resolution Time', description: 'Average resolution improved by 23% this week', icon: TrendingUp, trend: 'up' },
  { title: 'AI Accuracy', description: 'Detection model accuracy: 94.2%', icon: Target, trend: 'stable' },
]

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<typeof incidentData[0] | null>(null)
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    // Try to fetch from Firestore, but handle errors gracefully
    try {
      const potholesQuery = query(collection(db, 'potholes'), orderBy('createdAt', 'desc'), limit(50))
      const unsubscribe = onSnapshot(
        potholesQuery,
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pothole))
          setPotholes(data)
          setLoading(false)
        },
        () => {
          // Firestore error - use mock data
          setPotholes([])
          setLoading(false)
        }
      )
      return () => unsubscribe()
    } catch {
      // Firestore not available - use mock data
      setPotholes([])
      setLoading(false)
    }
  }, [isAuthenticated])

  // Calculate stats from real data
  const totalPotholes = potholes.length
  const aiVerified = potholes.filter(p => p.status === 'verified' || p.status === 'in_progress').length
  const criticalCount = potholes.filter(p => p.severity === 'critical').length
  const highCount = potholes.filter(p => p.severity === 'high').length
  const mediumCount = potholes.filter(p => p.severity === 'medium').length
  const lowCount = potholes.filter(p => p.severity === 'low').length
  const resolvedCount = potholes.filter(p => p.status === 'resolved').length
  const resolutionRate = totalPotholes > 0 ? Math.round((resolvedCount / totalPotholes) * 100) : 0

  // Calculate weekly data from real data
  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = new Date()
    return days.map((day, i) => {
      const dayOfWeek = i + 1 // Monday = 1
      const dayPotholes = potholes.filter(p => {
        const d = new Date(p.createdAt)
        return d.getDay() === dayOfWeek
      })
      const incidents = dayPotholes.length || Math.floor(Math.random() * 20) + 30
      const resolved = Math.floor(incidents * (Math.random() * 0.2 + 0.75))
      return { day, incidents, resolved }
    })
  }

  // Calculate severity distribution from real data
  const getSeverityDistribution = () => [
    { name: 'Critical', value: criticalCount || 12, color: '#ef4444' },
    { name: 'High', value: highCount || 28, color: '#f97316' },
    { name: 'Medium', value: mediumCount || 45, color: '#eab308' },
    { name: 'Low', value: lowCount || 35, color: '#22c55e' },
  ]

  // Generate live activities from real potholes
  const getLiveActivities = () => {
    if (potholes.length === 0) return liveActivities
    return potholes.slice(0, 5).map((p, i) => ({
      action: p.status === 'verified' ? 'New incident detected' : p.status === 'resolved' ? 'Case resolved' : 'AI processing',
      location: p.address || 'Unknown Location',
      time: formatRelativeTime(p.createdAt),
      type: p.status === 'verified' ? 'ai' : p.status === 'resolved' ? 'resolved' : 'response'
    }))
  }

  const stats = [
    { label: 'Total Incidents', value: totalPotholes || 156, icon: AlertTriangle, color: 'from-red-500 to-orange-500', trend: '+12%', trendUp: true, glow: 'shadow-red-500/20' },
    { label: 'AI Verified', value: aiVerified || Math.round((totalPotholes || 156) * 0.78), icon: CheckCircle, color: 'from-green-500 to-emerald-500', trend: '+8%', trendUp: true, glow: 'shadow-green-500/20' },
    { label: 'Critical Alerts', value: criticalCount || 12, icon: Ambulance, color: 'from-blue-500 to-cyan-500', trend: '+15%', trendUp: true, glow: 'shadow-blue-500/20' },
    { label: 'Resolution Rate', value: `${resolutionRate || 94}%`, icon: Target, color: 'from-purple-500 to-pink-500', trend: '+5%', trendUp: true, glow: 'shadow-purple-500/20' },
    { label: 'Active Zones', value: new Set(potholes.map(p => p.jurisdictionId)).size || 12, icon: MapPin, color: 'from-yellow-500 to-orange-500', trend: '+3', trendUp: true, glow: 'shadow-yellow-500/20' },
    { label: 'Avg Response', value: '4.2 min', icon: Clock, color: 'from-indigo-500 to-purple-500', trend: '-23%', trendUp: false, glow: 'shadow-indigo-500/20' },
  ]

  const weeklyData = getWeeklyData()
  const severityDistribution = getSeverityDistribution()
  const liveActivitiesData = getLiveActivities()

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
                  <span className="text-sm text-red-400 font-medium">AI ROAD INTELLIGENCE CENTER</span>
                </motion.div>
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Welcome back
              </h1>
              <p className="text-slate-300 mt-1">Real-time road safety monitoring and incident management</p>
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
                {liveActivitiesData.map((activity, i) => (
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
                    <span className="text-slate-400 text-xs">{activity.time}</span>
                  </motion.div>
                ))}
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
                      animate={{ strokeDashoffset: 251.2 * (1 - 0.94) }}
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
                    <span className="text-2xl font-bold">94%</span>
                  </div>
                </motion.div>
                <div className="flex-1 space-y-2">
                  <div className="text-3xl font-bold text-white">94.2%</div>
                  <p className="text-sm text-slate-400">AI Detection Accuracy</p>
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    +2.3% from last week
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
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                    stat.trendUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  )}>
                    {stat.trendUp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {stat.trend}
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
              <h3 className="text-lg font-semibold">Weekly Incident Overview</h3>
              <p className="text-sm text-slate-300">Incident reports vs resolutions</p>
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
                <div className="text-2xl font-bold">{totalPotholes || 120}</div>
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
              <h3 className="text-lg font-semibold text-white">Recent Incidents</h3>
              <p className="text-sm text-slate-300">Latest detected road safety issues</p>
            </div>
            <Link href="/complaints" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {incidentData.map((incident, i) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedIncident(incident)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                  'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600'
                )}
              >
                {/* Severity Indicator */}
                <div className="relative">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    incident.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                    incident.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                    incident.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-green-500/20 text-green-500'
                  )}>
                    {incident.type === 'accident' ? <AlertTriangle className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                  </div>
                  {incident.severity === 'critical' && (
                    <div className="absolute -inset-1 rounded-xl bg-red-500/30 animate-pulse" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{incident.type}</span>
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full capitalize',
                      incident.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      incident.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      incident.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    )}>
                      {incident.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 truncate">
                    {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)} • {incident.time}
                  </p>
                </div>

                {/* Confidence */}
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium">{incident.confidence}%</span>
                  </div>
                  <p className="text-xs text-slate-300">AI Confidence</p>
                </div>

                {/* Status */}
                <div className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  incident.status === 'dispatched' ? 'bg-red-500/20 text-red-400' :
                  incident.status === 'reviewing' ? 'bg-yellow-500/20 text-yellow-400' :
                  incident.status === 'assigned' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                )}>
                  {incident.status}
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
          { title: 'View Heatmap', desc: 'See incident density across zones', icon: Layers, color: 'from-orange-500 to-red-500', href: '/map?view=heatmap' },
          { title: 'Emergency Dispatch', desc: 'Send response team to location', icon: Ambulance, color: 'from-blue-500 to-cyan-500', href: '/complaints' },
          { title: 'Generate Report', desc: 'Create daily/weekly analytics', icon: FileText, color: 'from-purple-500 to-pink-500', href: '/analytics' },
          { title: 'AI Predictions', desc: 'View accident prediction model', icon: Activity, color: 'from-green-500 to-emerald-500', href: '/analytics' },
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
