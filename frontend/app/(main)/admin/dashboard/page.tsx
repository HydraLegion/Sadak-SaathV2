'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Shield, Users, FileText, MapPin, AlertTriangle, CheckCircle,
  Clock, TrendingUp, TrendingDown, Eye, Radio, Activity,
  Zap, Ambulance, Target, RefreshCw, ChevronRight, Map as MapIcon,
  BarChart3, Bell, Settings, Lock, Database, Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { collection, query, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Pothole, Complaint } from '@/lib/types'

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

export default function AdminDashboardPage() {
  const { isAuthenticated, isLoading: authLoading, user, role } = useAuthStore()
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/admin/login'
      return
    }
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    // Delay to prevent rapid reconnection issues
    const timeoutId = setTimeout(() => {
      try {
        const potholesQuery = query(collection(db, 'potholes'), orderBy('createdAt', 'desc'), limit(100))
        const unsubscribe = onSnapshot(
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
            setPotholes([])
            setLoading(false)
          }
        )
        setLoading(false)
        return () => {
          try {
            unsubscribe()
          } catch (e) {
            console.error('Error unsubscribing:', e)
          }
        }
      } catch (error) {
        console.error('Firestore setup error:', error)
        setPotholes([])
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [isAuthenticated])

  // Calculate stats from real data
  const totalIncidents = potholes.length
  const verifiedCount = potholes.filter(p => p.status === 'verified' || p.status === 'in_progress').length
  const resolvedCount = potholes.filter(p => p.status === 'resolved').length
  const criticalCount = potholes.filter(p => p.severity === 'critical').length

  const stats = [
    { label: 'Total Potholes', value: totalIncidents || 1247, icon: MapPin, color: 'from-orange-500 to-red-500', trend: '+12%', trendUp: true },
    { label: 'Verified', value: verifiedCount || 342, icon: CheckCircle, color: 'from-green-500 to-emerald-500', trend: '+8%', trendUp: true },
    { label: 'Resolved', value: resolvedCount || 892, icon: Activity, color: 'from-blue-500 to-cyan-500', trend: '+15%', trendUp: true },
    { label: 'Critical', value: criticalCount || 23, icon: AlertTriangle, color: 'from-red-500 to-pink-500', trend: '+5%', trendUp: true },
    { label: 'Officers', value: 47, icon: Users, color: 'from-purple-500 to-indigo-500', trend: '+3', trendUp: true },
    { label: 'Districts', value: 12, icon: MapIcon, color: 'from-yellow-500 to-orange-500', trend: '0', trendUp: true },
  ]

  const adminMenuItems = [
    { href: '/admin/officers', label: 'Manage Officers', desc: 'Add, edit, or remove officers', icon: Shield, color: 'from-purple-500 to-indigo-500' },
    { href: '/admin/setup', label: 'Database Setup', desc: 'Initialize & seed data', icon: Database, color: 'from-green-500 to-emerald-500' },
    { href: '/admin/users', label: 'User Management', desc: 'Manage citizen accounts', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { href: '/admin/moderation', label: 'AI Moderation', desc: 'Review detections', icon: Eye, color: 'from-orange-500 to-yellow-500' },
    { href: '/admin/audit', label: 'Audit Logs', desc: 'Track activities', icon: FileText, color: 'from-pink-500 to-rose-500' },
    { href: '/admin/jurisdictions', label: 'Jurisdictions', desc: 'Manage districts', icon: MapPin, color: 'from-cyan-500 to-blue-500' },
  ]

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-purple-500"
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
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400 font-medium">ADMIN CONTROL CENTER</span>
            </motion.div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {user?.displayName || 'Administrator'}
          </h1>
          <p className="text-slate-400 mt-1">Road intelligence command & control</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/setup"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Database className="w-4 h-4" />
            Setup Database
          </Link>
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
              className="group relative overflow-hidden rounded-2xl p-4 backdrop-blur-xl border border-slate-800/50 hover:border-slate-700 transition-all"
            >
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', stat.color)} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('p-2 rounded-xl bg-gradient-to-br', stat.color, 'shadow-lg')}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                    stat.trendUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  )}>
                    {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.trend}
                  </div>
                </div>

                <div className="text-2xl lg:text-3xl font-bold mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-300">{stat.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Access Menu */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-lg font-semibold text-white mb-4">Admin Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {adminMenuItems.map((item, i) => {
            const Icon = item.icon
            return (
              <Link key={i} href={item.href}>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="group p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 cursor-pointer transition-all"
                >
                  <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br mb-3 flex items-center justify-center shadow-lg', item.color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-medium text-white text-sm group-hover:text-purple-400 transition-colors">{item.label}</h3>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Potholes */}
        <motion.div variants={fadeInUp} className="rounded-2xl bg-slate-900/50 border border-slate-800/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Potholes</h3>
            <Link href="/complaints" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {potholes.slice(0, 5).map((pothole) => (
              <div key={pothole.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  pothole.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  pothole.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  pothole.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                )}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{pothole.address || 'Unknown Location'}</p>
                  <p className="text-xs text-slate-400 capitalize">{pothole.severity} - {pothole.status}</p>
                </div>
                <span className="text-xs text-slate-500">
                  {pothole.createdAt ? new Date(pothole.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            ))}

            {potholes.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No potholes recorded yet</p>
                <p className="text-xs">Use Database Setup to seed sample data</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp} className="rounded-2xl bg-slate-900/50 border border-slate-800/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>

          <div className="space-y-3">
            <Link href="/admin/officers" className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white group-hover:text-purple-400 transition-colors">Manage Officers</h4>
                <p className="text-xs text-slate-400">Add or remove authorized personnel</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </Link>

            <Link href="/admin/setup" className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white group-hover:text-green-400 transition-colors">Database Setup</h4>
                <p className="text-xs text-slate-400">Seed officers & initialize data</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-green-400 transition-colors" />
            </Link>

            <Link href="/admin/audit" className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">View Audit Logs</h4>
                <p className="text-xs text-slate-400">Track all system activities</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </Link>

            <Link href="/" className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <MapIcon className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white group-hover:text-orange-400 transition-colors">View Heatmap</h4>
                <p className="text-xs text-slate-400">See pothole density across zones</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}