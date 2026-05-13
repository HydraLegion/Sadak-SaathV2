'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  MapPin, FileText, CheckCircle, AlertTriangle, Clock,
  Video, Upload, Sparkles, TrendingUp, BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useDashboardData, useGlobalPotholeData, useUnreadNotificationsCount } from '@/lib/hooks/useDashboardData'
import {
  AnalyticsChart,
  SeverityDistributionChart,
  LiveActivityIndicator
} from '@/components/citizen/AnalyticsCharts'

const DashboardSidebar = dynamic(() => import('@/components/citizen/DashboardSidebar'), { ssr: false })
const DashboardNavbar = dynamic(() => import('@/components/citizen/DashboardNavbar'), { ssr: false })
const StatCard = dynamic(() => import('@/components/citizen/StatCard').then(mod => ({ default: mod.StatCard })), { ssr: false })
const UploadVideoCard = dynamic(() => import('@/components/citizen/UploadVideoCard'), { ssr: false })
const DetectionResultCard = dynamic(() => import('@/components/citizen/DetectionResultCard'), { ssr: false })
const PotholeMap = dynamic(() => import('@/components/citizen/PotholeMap'), { ssr: false })
const ComplaintTimeline = dynamic(() => import('@/components/citizen/ComplaintTimeline'), { ssr: false })
const ActivityFeed = dynamic(() => import('@/components/citizen/ActivityFeed'), { ssr: false })

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08 }
  }
}

// Mock data for demo when Firebase is not available or no data exists
const MOCK_POTHOLES = [
  { id: '1', severity: 'critical', confidence: 94, address: 'MG Road, Raipur', lat: 21.2514, lng: 81.6296, status: 'pending', createdAt: new Date(), createdBy: 'demo' },
  { id: '2', severity: 'high', confidence: 87, address: 'GE Road, Shankar Nagar', lat: 21.2564, lng: 81.6346, status: 'assigned', createdAt: new Date(), createdBy: 'demo' },
  { id: '3', severity: 'medium', confidence: 76, address: 'Pandri Road', lat: 21.2539, lng: 81.6190, status: 'in_progress', createdAt: new Date(), createdBy: 'demo' },
  { id: '4', severity: 'low', confidence: 65, address: 'Shankar Nagar', lat: 21.2639, lng: 81.6240, status: 'resolved', createdAt: new Date(), createdBy: 'demo' },
  { id: '5', severity: 'critical', confidence: 92, address: 'Telibandha Road', lat: 21.2589, lng: 81.6040, status: 'pending', createdAt: new Date(), createdBy: 'demo' },
]

const MOCK_COMPLAINTS = [
  {
    id: 'c1',
    referenceNumber: 'CMP-2024-0847',
    title: 'Large pothole near Metro Station',
    description: 'Dangerous pothole causing traffic issues',
    status: 'dispatched',
    createdAt: new Date(),
    updatedAt: new Date(),
    departmentId: 'PWD',
    timeline: [
      { status: 'submitted', timestamp: '2 days ago', description: 'Complaint registered' },
      { status: 'dispatched', timestamp: '1 hour ago', description: 'Repair team dispatched' }
    ]
  },
  {
    id: 'c2',
    referenceNumber: 'CMP-2024-0846',
    title: 'Multiple potholes on main road',
    description: 'Road damage affecting daily commute',
    status: 'assigned',
    createdAt: new Date(),
    updatedAt: new Date(),
    departmentId: 'Municipal',
    timeline: [
      { status: 'submitted', timestamp: '4 days ago', description: 'Complaint registered' },
      { status: 'assigned', timestamp: '1 day ago', description: 'Assigned to Municipal Corporation' }
    ]
  }
]

export default function CitizenDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  // Fetch real-time dashboard data
  const {
    potholes: realPotholes,
    complaints: realComplaints,
    notifications,
    loading,
    totalReports: realTotalReports,
    potholesDetected: realPotholesDetected,
    activeComplaints: realActiveComplaints,
    resolvedComplaints: realResolvedComplaints,
    criticalCount: realCriticalCount,
    highCount: realHighCount,
    mediumCount: realMediumCount,
    lowCount: realLowCount,
  } = useDashboardData()

  // Global pothole data for map
  const { potholes: globalPotholes } = useGlobalPotholeData()

  // Unread notifications count
  const unreadCount = useUnreadNotificationsCount()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Use real data if available, otherwise fall back to mock data for demo
  const potholes = realPotholes.length > 0 ? realPotholes : MOCK_POTHOLES
  const complaints = realComplaints.length > 0 ? realComplaints : MOCK_COMPLAINTS

  // Stats calculation
  const totalReports = realTotalReports > 0 ? realTotalReports : MOCK_POTHOLES.length + MOCK_COMPLAINTS.length
  const potholesDetected = realPotholesDetected > 0 ? realPotholesDetected : MOCK_POTHOLES.length
  const activeComplaints = realActiveComplaints > 0 ? realActiveComplaints : MOCK_COMPLAINTS.filter(c => c.status !== 'resolved').length
  const resolvedComplaints = realResolvedComplaints > 0 ? realResolvedComplaints : 2
  const criticalCount = realCriticalCount > 0 ? realCriticalCount : MOCK_POTHOLES.filter(p => p.severity === 'critical').length
  const highCount = realHighCount > 0 ? realHighCount : MOCK_POTHOLES.filter(p => p.severity === 'high').length
  const mediumCount = realMediumCount > 0 ? realMediumCount : MOCK_POTHOLES.filter(p => p.severity === 'medium').length
  const lowCount = realLowCount > 0 ? realLowCount : MOCK_POTHOLES.filter(p => p.severity === 'low').length

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { trend: '+100%', trendUp: true }
    const diff = current - previous
    const percent = Math.round((diff / previous) * 100)
    return {
      trend: `${percent >= 0 ? '+' : ''}${percent}%`,
      trendUp: percent >= 0
    }
  }

  const previousTotalReports = totalReports > 0 ? totalReports - 3 : 0
  const previousPotholesDetected = potholesDetected > 0 ? potholesDetected - 5 : 0
  const previousActiveComplaints = activeComplaints > 0 ? activeComplaints + 1 : 0
  const previousResolvedComplaints = resolvedComplaints > 0 ? resolvedComplaints - 2 : 0

  // Generate chart data
  const potholeChartData = (() => {
    const last7Days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const counts = [12, 19, 8, 15, 22, 18, 10]
    return last7Days.map((name, i) => ({ name, value: counts[i] }))
  })()

  // Severity distribution data
  const severityData = [
    { name: 'Critical', value: criticalCount, color: '#ef4444' },
    { name: 'High', value: highCount, color: '#f97316' },
    { name: 'Medium', value: mediumCount, color: '#eab308' },
    { name: 'Low', value: lowCount, color: '#22c55e' },
  ]

  // Complaint status distribution
  const complaintStatusData = [
    { name: 'Submitted', value: 3, color: '#f97316' },
    { name: 'In Progress', value: 5, color: '#3b82f6' },
    { name: 'Resolved', value: 8, color: '#22c55e' },
  ]

  // Recent activity
  const recentActivity = (() => {
    const activities = [
      { id: '1', type: 'detection' as const, title: 'Pothole Detected: Critical', description: 'MG Road, Sector 12', timestamp: '2 min ago', icon: 'map' as const, status: 'pending' as const },
      { id: '2', type: 'complaint' as const, title: 'Complaint Updated', description: 'Your complaint is being processed', timestamp: '15 min ago', icon: 'alert' as const, status: 'pending' as const },
      { id: '3', type: 'detection' as const, title: 'Video Processed', description: '5 potholes detected in your video', timestamp: '1 hour ago', icon: 'video' as const, status: 'success' as const },
      { id: '4', type: 'resolution' as const, title: 'Road Repaired', description: 'Gandhi Chowk pothole fixed', timestamp: '3 hours ago', icon: 'check' as const, status: 'success' as const },
    ]
    return activities
  })()

  const handleUploadComplete = useCallback(() => {
    console.log('Upload complete - data should refresh automatically')
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const reportsTrend = calculateTrend(totalReports, previousTotalReports)
  const potholesTrend = calculateTrend(potholesDetected, previousPotholesDetected)
  const complaintsTrend = calculateTrend(activeComplaints, previousActiveComplaints)
  const resolvedTrend = calculateTrend(resolvedComplaints, previousResolvedComplaints)

  const displayName = user?.displayName || (isAuthenticated ? 'Citizen' : 'Guest')

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar
            onMenuClick={() => setSidebarOpen(true)}
            unreadCount={unreadCount}
          />

          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="w-full space-y-6"
            >
              {/* Welcome Section */}
              <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-slate-900/80 to-slate-900/90" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />

                <div className="relative p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 mb-4 flex-wrap"
                      >
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30">
                          <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                          <span className="text-sm text-blue-400 font-medium">Citizen Portal</span>
                        </div>
                        <LiveActivityIndicator isLive={!loading} />
                      </motion.div>

                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl lg:text-4xl font-bold text-white mb-2"
                      >
                        Welcome back, <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{displayName}</span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-400 max-w-xl"
                      >
                        You have submitted <span className="text-blue-400 font-medium">{totalReports}</span> reports with <span className="text-orange-400 font-medium">{potholesDetected}</span> potholes detected.
                      </motion.p>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Verified Citizen</p>
                          <p className="text-xs text-green-400">Active Contributor</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-3 mt-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                    >
                      <Upload className="w-5 h-5" />
                      Report Pothole
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-white font-medium hover:bg-slate-700/50 transition-all"
                    >
                      <Video className="w-5 h-5" />
                      Upload Video
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-white font-medium hover:bg-slate-700/50 transition-all"
                    >
                      <MapPin className="w-5 h-5" />
                      View Map
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <motion.div variants={fadeInUp}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Reports Submitted"
                    value={totalReports}
                    icon={FileText}
                    trend={reportsTrend.trend}
                    trendUp={reportsTrend.trendUp}
                    gradient="from-blue-500 via-blue-600 to-cyan-500"
                    delay={0}
                    loading={loading}
                  />
                  <StatCard
                    label="Potholes Detected"
                    value={potholesDetected}
                    icon={AlertTriangle}
                    trend={potholesTrend.trend}
                    trendUp={potholesTrend.trendUp}
                    gradient="from-orange-500 via-red-500 to-pink-500"
                    delay={0.1}
                    loading={loading}
                  />
                  <StatCard
                    label="Active Complaints"
                    value={activeComplaints}
                    icon={Clock}
                    trend={complaintsTrend.trend}
                    trendUp={complaintsTrend.trendUp}
                    gradient="from-purple-500 via-indigo-500 to-blue-500"
                    delay={0.2}
                    loading={loading}
                  />
                  <StatCard
                    label="Resolved"
                    value={resolvedComplaints}
                    icon={CheckCircle}
                    trend={resolvedTrend.trend}
                    trendUp={resolvedTrend.trendUp}
                    gradient="from-green-500 via-emerald-500 to-teal-500"
                    delay={0.3}
                    loading={loading}
                  />
                </div>
              </motion.div>

              {/* Analytics Charts Row */}
              <motion.div variants={fadeInUp}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <AnalyticsChart
                    data={potholeChartData}
                    title="Potholes Detected (7 Days)"
                    description="Daily detection trend"
                    color="orange"
                    showTrend
                    trend="+12%"
                    trendUp
                  />
                  <SeverityDistributionChart
                    data={severityData}
                    title="Severity Distribution"
                  />
                  <AnalyticsChart
                    data={complaintStatusData}
                    title="Complaint Status"
                    description="Current status breakdown"
                    color="blue"
                    showTrend
                    trend="+8%"
                    trendUp
                  />
                </div>
              </motion.div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Upload & Detections */}
                <div className="lg:col-span-2 space-y-6">
                  <motion.div variants={fadeInUp}>
                    <UploadVideoCard onUploadComplete={handleUploadComplete} />
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <DetectionResultCard
                      detections={potholes.map((p, i) => ({
                        id: p.id || `mock-${i}`,
                        severity: p.severity as 'critical' | 'high' | 'medium' | 'low',
                        confidence: p.confidence || 85 + Math.random() * 10,
                        location: p.address || 'Location not specified',
                        coordinates: { lat: p.lat || 21.2514, lng: p.lng || 81.6296 },
                        timestamp: p.createdAt instanceof Date ? p.createdAt.toLocaleDateString() : 'Recent',
                        size: p.severity === 'critical' ? 'large' : p.severity === 'high' ? 'medium' : 'small',
                        distance: 'Various sizes'
                      }))}
                    />
                  </motion.div>
                </div>

                {/* Right Column - Map & Activity */}
                <div className="space-y-6">
                  <motion.div variants={fadeInUp} className="h-full">
                    <PotholeMap
                      markers={(globalPotholes.length > 0 ? globalPotholes : MOCK_POTHOLES).map((p, i) => ({
                        id: p.id || `marker-${i}`,
                        lat: p.lat || 21.2514 + (Math.random() * 0.1 - 0.05),
                        lng: p.lng || 81.6296 + (Math.random() * 0.1 - 0.05),
                        severity: p.severity as 'critical' | 'high' | 'medium' | 'low',
                        address: p.address || 'Detected Location',
                        status: p.status || 'pending'
                      }))}
                    />
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <ActivityFeed activities={recentActivity} />
                  </motion.div>
                </div>
              </div>

              {/* Complaint Timeline */}
              <motion.div variants={fadeInUp}>
                <ComplaintTimeline
                  complaints={complaints.map(c => ({
                    id: c.referenceNumber || c.id,
                    title: c.title,
                    location: c.description,
                    status: (c.status || 'pending') as 'pending' | 'reviewing' | 'assigned' | 'dispatched' | 'resolved',
                    submittedAt: c.createdAt instanceof Date ? c.createdAt.toLocaleDateString() : 'Recent',
                    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toLocaleDateString() : 'Recently',
                    department: c.departmentId || 'PWD',
                    timeline: ((c.timeline || []) as any[]).map((t) => ({
                      status: String(t.status || t.newStatus || ''),
                      timestamp: String(t.timestamp || t.performedAt || ''),
                      description: String(t.description || t.action || '')
                    }))
                  }))}
                />
              </motion.div>

              {/* Footer */}
              <motion.div variants={fadeInUp} className="flex items-center justify-center gap-6 py-4 text-center">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  System Operational
                </div>
                <span className="text-slate-700">|</span>
                <span className="text-xs text-slate-500">Sadak Saathi v2.0</span>
                <span className="text-slate-700">|</span>
                <span className="text-xs text-slate-500">Built with AI</span>
              </motion.div>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}
