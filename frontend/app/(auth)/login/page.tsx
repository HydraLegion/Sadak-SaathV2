'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Shield, User, Lock, MapPin, AlertTriangle, CheckCircle,
  Radio, Zap, Eye, Clock, Globe, ChevronRight, Play
} from 'lucide-react'
import { cn } from '@/lib/utils'

const floatingElements = [
  { icon: MapPin, x: '5%', y: '15%', delay: 0, color: 'text-red-400' },
  { icon: AlertTriangle, x: '90%', y: '10%', delay: 0.5, color: 'text-orange-400' },
  { icon: CheckCircle, x: '85%', y: '75%', delay: 1, color: 'text-green-400' },
  { icon: Shield, x: '8%', y: '70%', delay: 1.5, color: 'text-blue-400' },
  { icon: Zap, x: '50%', y: '5%', delay: 2, color: 'text-yellow-400' },
]

const stats = [
  { label: 'Reports Filed', value: '50K+' },
  { label: 'Resolution Rate', value: '85%' },
  { label: 'Cities Covered', value: '200+' },
  { label: 'Active Users', value: '25K+' },
]

const features = [
  { icon: Zap, title: 'AI-Powered Detection', desc: 'Automated pothole identification' },
  { icon: Clock, title: 'Real-time Tracking', desc: 'Monitor complaint status' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data is protected' },
  { icon: Globe, title: 'Pan-India Coverage', desc: 'Serving multiple states' },
]

export default function AuthSelectionPage() {
  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

          {/* Gradient Orbs */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px]"
          />

          {/* Floating Elements */}
          {floatingElements.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: item.x, top: item.y }}
                animate={{ y: [0, -15, 0], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, delay: item.delay }}
              >
                <div className="p-3 rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50">
                  <Icon className={cn('w-6 h-6', item.color)} />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg viewBox="0 0 24 24" className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur opacity-30 -z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Sadak Saathi</h1>
              <p className="text-blue-400/80">Road Intelligence Platform</p>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Making India's Roads{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Safer
              </span>{' '}
              Together
            </h2>
            <p className="text-lg text-slate-400 max-w-lg">
              Report potholes, track repairs, and contribute to better road infrastructure
              in your community through AI-powered road safety intelligence.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-8 mb-10"
          >
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{feature.title}</p>
                    <p className="text-xs text-slate-500">{feature.desc}</p>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>

        {/* Live Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-8 left-12 flex items-center gap-2"
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            <Radio className="w-3 h-3 text-blue-500 animate-pulse" />
            <span className="text-xs text-blue-400 font-medium">LIVE MONITORING</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Panel - Login Selection */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Sadak Saathi</span>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome to Sadak Saathi
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Choose how you want to sign in
            </p>
          </motion.div>

          {/* Login Cards */}
          <div className="space-y-4">
            {/* Citizen Login Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-6 cursor-pointer transition-all hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 flex items-start gap-4">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25 flex-shrink-0">
                  <User className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">Citizen Login</h3>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/20 text-green-400 font-medium">PUBLIC</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Report potholes and track road repair complaints in your area
                  </p>

                  <Link
                    href="/citizen-login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all group"
                  >
                    <span>Login as Citizen</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.div>
                  </Link>
                </div>
              </div>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full" />
            </motion.div>

            {/* Officer/Admin Login Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group relative overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-6 cursor-pointer transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 flex items-start gap-4">
                {/* Icon */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 flex-shrink-0">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  {/* Lock Badge */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-purple-500 flex items-center justify-center">
                    <Lock className="w-3 h-3 text-purple-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">Officer / Admin Login</h3>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/20 text-purple-400 font-medium border border-purple-500/30">
                      SECURE
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Government officers access - district admin, PWD officials, NHAI authorities
                  </p>

                  <Link
                    href="/admin/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all group"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Login as Officer</span>
                  </Link>
                </div>
              </div>

              {/* Security Badge */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3 h-3" />
                <span>Encrypted Connection</span>
              </div>

              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
            </motion.div>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative flex items-center justify-center my-6"
          >
            <div className="w-full border-t border-slate-800" />
            <span className="absolute px-4 bg-slate-950 text-xs text-slate-500">or</span>
          </motion.div>

          {/* Demo Login */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Continue as Guest</span>
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-6 text-xs sm:text-sm text-slate-500"
          >
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-blue-400 hover:text-blue-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </Link>
          </motion.p>

          {/* Help Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-4"
          >
            <Link href="/help" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Need help? Contact support
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}