'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Search, Bell, Menu, Sun, Moon, Radio, Settings, LogOut,
  ChevronDown, User, Shield, CheckCircle, MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import NotificationDropdown from './NotificationDropdown'

interface DashboardNavbarProps {
  onMenuClick: () => void
  unreadCount?: number
}

export default function DashboardNavbar({ onMenuClick, unreadCount: propUnreadCount }: DashboardNavbarProps) {
  const [darkMode, setDarkMode] = useState(true)
  const [notifPanelOpen, setNotifPanelOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const unreadCount = propUnreadCount ?? 0
  const [currentTime, setCurrentTime] = useState(new Date())
  const [scrolled, setScrolled] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuthStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => { clearInterval(timer); window.removeEventListener('scroll', handleScroll) }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isClient])

  return (
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports, locations..."
              className="w-64 lg:w-80 pl-10 pr-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800/50 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/80 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">⌘K</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Live Indicator */}
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            <Radio className="w-3 h-3 text-blue-500 animate-pulse" />
            <span className="text-xs text-blue-400 font-medium">LIVE</span>
          </motion.div>

          {/* Clock */}
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-sm font-medium text-white">{currentTime.toLocaleTimeString()}</span>
            <span className="text-xs text-slate-400">{currentTime.toLocaleDateString()}</span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotifPanelOpen(!notifPanelOpen)}
              className="relative p-2 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-800 hover:border-slate-700 transition-all"
            >
              <Bell className="w-5 h-5 text-slate-300" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs flex items-center justify-center font-medium"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.button>
            <NotificationDropdown isOpen={notifPanelOpen} onClose={() => setNotifPanelOpen(false)} />
          </div>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-800 hover:border-slate-700 transition-all"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
          </motion.button>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.displayName?.charAt(0).toUpperCase() || 'C'}
              </div>
              <span className="hidden sm:block text-sm text-white font-medium">{user?.displayName || 'Citizen'}</span>
              <motion.div animate={{ rotate: profileOpen ? 180 : 0 }}>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 shadow-xl shadow-black/20 overflow-hidden"
                >
                  {/* User Info */}
                  <div className="p-4 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                        {user?.displayName?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{user?.displayName || 'Citizen'}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.phone || '+91 XXXXXXXXXX'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <Link
                      href="/citizen-dashboard/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>
                    <Link
                      href="/citizen-dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Settings
                    </Link>
                    <Link
                      href="/citizen-dashboard/activity"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-slate-400" />
                      My Activity
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="p-2 border-t border-slate-800/50">
                    <button
                      onClick={() => { logout(); if (isClient) window.location.href = '/'; }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
