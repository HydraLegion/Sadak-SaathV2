'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  Menu, X, ChevronDown, Play, MapPin, Shield, Eye, Bell, BarChart3,
  FileText, Zap, Clock, CheckCircle, Users, Globe, TrendingUp,
  Camera, Radio, AlertTriangle, ArrowRight, Star, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
}

// Navbar Component
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Analytics', href: '#analytics' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/50 shadow-2xl shadow-black/20'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur-xl opacity-50 -z-10" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Sadak Saathi
                </span>
                <p className="text-xs text-blue-400/80 font-medium">Road Intelligence</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ y: -2 }}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
                </motion.a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-800/50 text-slate-300 transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/50"
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-slate-300 hover:text-white py-2 text-lg"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 border-t border-slate-800/50 flex flex-col gap-3">
                  <Link href="/login" className="block text-center py-3 text-slate-300 hover:text-white">
                    Sign In
                  </Link>
                  <Link
                    href="/login"
                    className="block text-center py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}

// Animated Background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 -left-40 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-0 -right-40 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]"
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black_70%,transparent_100%)]" />

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
          }}
          animate={{
            y: [null, Math.random() * -500],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )
}

// Hero Section
function HeroSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
      {/* Dashboard Preview Cards */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="hidden xl:block absolute right-10 top-1/2 -translate-y-1/2 w-80 space-y-4"
      >
        {/* Live Stats Card */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">Live Detection</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">247</div>
          <p className="text-xs text-slate-400">Potholes detected today</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              {['CR', 'HI', 'MD'].map((s, i) => (
                <div key={i} className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                  i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                )}>
                  {s}
                </div>
              ))}
            </div>
            <span className="text-xs text-slate-400">+12% from yesterday</span>
          </div>
        </motion.div>

        {/* AI Accuracy Card */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-slate-300">AI Accuracy</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="6" fill="none" />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="url(#heroGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="176"
                  initial={{ strokeDashoffset: 176 }}
                  animate={{ strokeDashoffset: isInView ? 176 * 0.06 : 176 }}
                  transition={{ duration: 2, delay: 1 }}
                />
                <defs>
                  <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">94%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Detection Model</p>
              <p className="text-xs text-slate-400">Real-time analysis</p>
            </div>
          </div>
        </motion.div>

        {/* Map Preview Card */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-300">Heatmap View</span>
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div className="relative h-24 rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="absolute inset-0 opacity-50">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className="absolute w-8 h-8 rounded-full bg-red-500/30 blur-md"
                  style={{
                    left: `${15 + i * 15}%`,
                    top: `${20 + (i % 3) * 25}%`,
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-sm font-medium text-blue-400">AI-Powered Road Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6"
        >
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Making Roads Safer
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            with AI Intelligence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Advanced AI-powered pothole detection, real-time analytics, and automated complaint management
          for smarter road infrastructure across India.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
            >
              Start Monitoring
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white font-semibold text-lg hover:bg-slate-800 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>Free 14-Day Trial</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>24/7 Support</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-slate-400"
        >
          <span className="text-xs">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// Stats Section
function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const stats = [
    { label: 'Potholes Detected', value: 128490, suffix: '+', icon: MapPin, color: 'from-red-500 to-orange-500' },
    { label: 'Roads Analyzed', value: 45280, suffix: 'KM', icon: Globe, color: 'from-blue-500 to-cyan-500' },
    { label: 'AI Detection Accuracy', value: 94.2, suffix: '%', icon: Eye, color: 'from-purple-500 to-pink-500' },
    { label: 'Active Complaints', value: 12450, suffix: '', icon: FileText, color: 'from-green-500 to-emerald-500' },
  ]

  return (
    <section ref={ref} className="relative py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? 'animate' : 'initial'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 hover:border-slate-700 transition-all duration-300"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', stat.color)} />

                <div className="relative z-10">
                  <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br mb-6 flex items-center justify-center shadow-lg', stat.color)}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {isInView ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        {typeof stat.value === 'number' && stat.value > 1000
                          ? (stat.value / 1000).toFixed(0) + 'K'
                          : stat.value}
                        {stat.suffix}
                      </motion.span>
                    ) : (
                      '0'
                    )}
                  </div>

                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>

                <div className={cn('absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br', stat.color)} />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const features = [
    {
      title: 'AI Pothole Detection',
      description: 'Advanced computer vision models detect potholes from road videos with 94%+ accuracy in real-time.',
      icon: Eye,
      color: 'from-blue-500 to-cyan-500',
      delay: 0,
    },
    {
      title: 'GPS Geolocation',
      description: 'Precise GPS coordinates for every detected pothole with interactive map visualization.',
      icon: MapPin,
      color: 'from-green-500 to-emerald-500',
      delay: 0.1,
    },
    {
      title: 'Heatmap Analytics',
      description: 'Visualize pothole density across districts with color-coded heatmaps and trend analysis.',
      icon: BarChart3,
      color: 'from-orange-500 to-red-500',
      delay: 0.2,
    },
    {
      title: 'Complaint Automation',
      description: 'Auto-generate and submit government complaints with evidence, location, and severity data.',
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
      delay: 0.3,
    },
    {
      title: 'Social Intelligence',
      description: 'Aggregate road issues from citizen reports, social media, and official channels.',
      icon: Users,
      color: 'from-yellow-500 to-amber-500',
      delay: 0.4,
    },
    {
      title: 'Real-time Alerts',
      description: 'Instant notifications to officials for critical potholes requiring immediate attention.',
      icon: Bell,
      color: 'from-red-500 to-rose-500',
      delay: 0.5,
    },
  ]

  return (
    <section id="features" ref={ref} className="relative py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
          >
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Powerful Features</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need for
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Road Safety Intelligence
            </span>
          </h2>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A comprehensive suite of AI-powered tools for detecting, tracking, and managing road infrastructure issues.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? 'animate' : 'initial'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-3xl p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 hover:border-slate-700 transition-all duration-300"
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', feature.color)} />

                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className={cn('w-16 h-16 rounded-2xl bg-gradient-to-br mb-6 flex items-center justify-center shadow-lg transition-transform', feature.color)}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Learn more</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Corner Glow */}
                <div className={cn('absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br blur-3xl', feature.color)} />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// How It Works Section
function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const steps = [
    {
      step: 1,
      title: 'Upload Road Video',
      description: 'Citizens or officials upload dashcam footage of roads',
      icon: Camera,
    },
    {
      step: 2,
      title: 'AI Detection',
      description: 'Our AI model analyzes video frame-by-frame for potholes',
      icon: Eye,
    },
    {
      step: 3,
      title: 'Generate Heatmap',
      description: 'Results are visualized on an interactive map heatmap',
      icon: BarChart3,
    },
    {
      step: 4,
      title: 'Auto Complaint',
      description: 'System auto-files complaints with government authorities',
      icon: FileText,
    },
  ]

  return (
    <section id="how-it-works" ref={ref} className="relative py-20 lg:py-32 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From video upload to automated complaints in four simple steps
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? 'animate' : 'initial'}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.step}
                variants={fadeInUp}
                className="relative text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative inline-flex mb-6"
                >
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-blue-400" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.step}
                  </div>
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%]">
                    <svg className="w-full" viewBox="0 0 100 20" fill="none">
                      <path d="M0 10 Q 50 0, 100 10" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// Testimonials Section
function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Citizens, Mumbai',
      text: 'This platform helped me report road issues in minutes. The AI detection was incredibly fast and accurate!',
      rating: 5,
      avatar: 'PS',
    },
    {
      name: 'Rajesh Kumar',
      role: 'Road Inspector, Raipur',
      text: 'Our response time for critical potholes has improved by 40% since using Sadak Saathi. A game-changer for infrastructure management.',
      rating: 5,
      avatar: 'RK',
    },
    {
      name: 'Dr. Ananya Patel',
      role: 'Municipal Commissioner, Bangalore',
      text: 'The analytics dashboard gives us real-time insights into road conditions across all districts. Highly recommended.',
      rating: 5,
      avatar: 'AP',
    },
    {
      name: 'Vikram Singh',
      role: 'Transport Department, UP',
      text: 'Automated complaint generation has reduced our paperwork by 70%. The heatmap visualization is excellent for resource allocation.',
      rating: 5,
      avatar: 'VS',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <section id="testimonials" ref={ref} className="relative py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            What People Say
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Join thousands of citizens and officials using Sadak Saathi
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={cn(
                'p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border transition-all duration-300',
                'hover:bg-slate-800/50 hover:border-slate-700'
              )}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.text}"</p>

              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold"
                >
                  {testimonial.avatar}
                </motion.div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="relative py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-slate-900/80 to-cyan-600/20 border border-blue-500/30 p-8 lg:p-16"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 8, repeat: Infinity, delay: 2 }}
              className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px]"
            />
          </div>

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 mb-6"
            >
              <Radio className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Live Platform Active</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Ready to Make Roads Safer?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-300 mb-10"
            >
              Join the AI-powered road intelligence platform used by thousands of citizens and government officials across India.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 text-white font-semibold text-lg hover:bg-slate-800 hover:border-slate-600 transition-all"
                >
                  Schedule Demo
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="relative py-16 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Sadak Saathi</span>
            </div>
            <p className="text-slate-400 mb-4">
              AI-powered road intelligence platform for safer infrastructure.
            </p>
            <div className="flex gap-4">
              {['twitter', 'linkedin', 'github'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    {social === 'twitter' && <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />}
                    {social === 'linkedin' && <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />}
                    {social === 'github' && <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3">
              {['Features', 'Pricing', 'Analytics', 'API'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              {['About', 'Blog', 'Careers', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            © 2024 Sadak Saathi. All rights reserved. Made with ❤️ in India.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Globe className="w-4 h-4" />
              <span>English (US)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Landing Page Component
export default function LandingClient() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <AnimatedBackground />
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}