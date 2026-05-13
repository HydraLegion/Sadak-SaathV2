'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Map, LayoutDashboard, Upload, FileText, MapPin, Bell, Settings,
  LogOut, X, Clock, AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'

const citizenNavItems = [
  { href: '/citizen-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/citizen-dashboard/upload', label: 'Upload Video', icon: Upload, primary: true },
  { href: '/citizen-dashboard/reports', label: 'My Reports', icon: FileText },
  { href: '/citizen-dashboard/map', label: 'Pothole Map', icon: Map },
  { href: '/citizen-dashboard/tracking', label: 'Complaint Tracking', icon: AlertTriangle },
  { href: '/citizen-dashboard/activity', label: 'Activity Feed', icon: Clock },
]

const secondaryNavItems = [
  { href: '/citizen-dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/citizen-dashboard/settings', label: 'Settings', icon: Settings },
]

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const [activeItem, setActiveItem] = useState('/citizen-dashboard')
  const [isClient, setIsClient] = useState(false)
  const pathname = activeItem
  const { user, logout } = useAuthStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleNavClick = (href: string) => {
    setActiveItem(href)
    onClose()
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur opacity-30 -z-10" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Sadak Saathi</h1>
              <p className="text-sm text-blue-400/80">Citizen Portal</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              {user?.displayName?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-60 animate-pulse" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-white truncate">{user?.displayName || 'Citizen'}</p>
            <p className="text-xs text-slate-400">Verified User</p>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</p>
          {citizenNavItems.map((item, i) => {
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
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50',
                    item.primary && 'mt-2'
                  )}
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: isActive ? 5 : 0 }}>
                    <Icon className={cn('w-5 h-5', isActive ? 'text-blue-400' : 'text-slate-400')} />
                  </motion.div>
                  {item.label}
                  {item.primary && (
                    <span className="ml-auto px-2 py-0.5 text-[10px] rounded-full bg-blue-500/20 text-blue-400 font-medium animate-pulse">NEW</span>
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="pt-4 border-t border-slate-800/50">
          <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</p>
          {secondaryNavItems.map((item, i) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (citizenNavItems.length + i) * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200',
                    isActive
                      ? 'bg-slate-800/80 text-white border-l-2 border-blue-500'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  )}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {item.label}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-slate-800/50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { logout(); if (isClient) window.location.href = '/'; }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </motion.button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-full w-72 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/50 lg:hidden overflow-y-auto"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -288 }}
        animate={{ x: 0 }}
        className="hidden lg:flex w-72 h-screen flex-shrink-0 flex-col bg-slate-950/80 backdrop-blur-xl border-r border-slate-800/50 fixed left-0 top-0 overflow-y-auto"
      >
        <SidebarContent />
      </motion.aside>
    </>
  )
}