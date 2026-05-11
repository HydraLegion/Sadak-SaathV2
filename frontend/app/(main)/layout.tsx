'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Map, BarChart3, PlusCircle, Bell, Settings, Menu, X,
  LayoutDashboard, FileText, Shield, ChevronDown, LogOut, User,
  Search, Sun, Moon, Clock, Activity, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, MapPin, Zap, Eye, Radio, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import NotificationPanel from '@/components/notifications/NotificationPanel'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/map', label: 'Map View', icon: Map },
  { href: '/complaints', label: 'Complaints', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/report', label: 'Report', icon: PlusCircle, primary: true },
]

const adminItems = [
  { href: '/dashboard', label: 'Command Center', icon: Shield },
  { href: '/admin/users', label: 'User Management', icon: User },
  { href: '/admin/moderation', label: 'AI Moderation', icon: Eye },
  { href: '/admin/audit', label: 'Audit Logs', icon: FileText },
  { href: '/admin/jurisdictions', label: 'Jurisdictions', icon: MapPin },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminExpanded, setAdminExpanded] = useState(true)
  const [notifPanelOpen, setNotifPanelOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [darkMode, setDarkMode] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [scrolled, setScrolled] = useState(false)
  const pathname = '/dashboard'
  const { user, isAuthenticated, isLoading: authLoading, role, logout } = useAuthStore()
  const notifRef = useRef<HTMLDivElement>(null)

  const isAdmin = role && ['admin', 'super_admin'].includes(role)

  useEffect(() => {
    if (!user?.uid) return
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        where('read', '==', false)
      )
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => setUnreadCount(snapshot.size),
        () => setUnreadCount(0)
      )
      return () => unsubscribe()
    } catch {
      setUnreadCount(0)
    }
  }, [user?.uid])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => { clearInterval(timer); window.removeEventListener('scroll', handleScroll) }
  }, [])

  // Apply dark/light mode to HTML element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement
      if (darkMode) {
        html.classList.add('dark')
        html.classList.remove('light')
      } else {
        html.classList.remove('dark')
        html.classList.add('light')
      }
    }
  }, [darkMode])

  return (
    <div className={cn('flex h-screen overflow-hidden bg-slate-950', darkMode ? 'dark' : 'light')}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-red-500/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_100%)]" />
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Glassmorphism Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : 0 }}
        className={cn(
          'fixed lg:static left-0 top-0 z-50 h-full w-72 flex flex-col transition-all duration-300',
          'bg-slate-900/40 backdrop-blur-xl border-r border-slate-800/50',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-40 -z-10" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">RakshaSaathi</h1>
              <p className="text-sm text-slate-300">AI Command Center</p>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur opacity-60 animate-pulse" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-white truncate">{user?.displayName || 'Officer'}</p>
              <p className="text-sm text-slate-300 capitalize">{role || 'admin'}</p>
            </div>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-500">Online</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30 shadow-lg shadow-red-500/10'
                      : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
                  )}
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: isActive ? 5 : 0 }}>
                    <Icon className={cn('w-5 h-5', isActive ? 'text-red-400' : 'text-slate-300')} />
                  </motion.div>
                  {item.label}
                  {item.primary && (
                    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">New</span>
                  )}
                </Link>
              </motion.div>
            )
          })}

          {/* Admin Section */}
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-800/50">
              <button
                onClick={() => setAdminExpanded(!adminExpanded)}
                className="flex w-full items-center justify-between px-4 py-2 text-sm font-semibold text-slate-200 uppercase tracking-wider"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Control Center
                </span>
                <motion.div animate={{ rotate: adminExpanded ? 180 : 0 }}>
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {adminExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-1"
                  >
                    {adminItems.map((item, i) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200',
                              isActive
                                ? 'bg-slate-800/80 text-white border-l-2 border-red-500'
                                : 'text-slate-200 hover:text-white hover:bg-slate-700/50'
                            )}
                          >
                            <Icon className="w-4 h-4 text-slate-300" />
                            {item.label}
                          </Link>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-slate-800/50">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => logout().then(() => window.location.href = '/login')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:text-white hover:bg-slate-700 transition-all"
          >
            <LogOut className="w-4 h-4 text-slate-300" />
            Sign Out
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Glassmorphism Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            'sticky top-0 z-40 h-16 lg:h-20 border-b backdrop-blur-xl transition-all duration-300',
            scrolled ? 'bg-slate-950/80 border-slate-800/50' : 'bg-transparent border-transparent'
          )}
        >
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Left */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search incidents, zones..."
                  className="w-64 lg:w-80 pl-10 pr-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500/50 transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">⌘K</span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Live Indicator */}
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20"
              >
                <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                <span className="text-xs text-red-400 font-medium">LIVE</span>
              </motion.div>

              {/* Clock */}
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-medium text-white">{currentTime.toLocaleTimeString()}</span>
                <span className="text-xs text-slate-300">{currentTime.toLocaleDateString()}</span>
              </div>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotifPanelOpen(!notifPanelOpen)}
                  className="relative p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all"
                >
                  <Bell className="w-5 h-5 text-slate-300" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </motion.button>
                <NotificationPanel isOpen={notifPanelOpen} onClose={() => setNotifPanelOpen(false)} />
              </div>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
              </motion.button>

              {/* Settings */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all"
              >
                <Settings className="w-5 h-5 text-slate-300" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}