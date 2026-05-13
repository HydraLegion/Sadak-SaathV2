'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Clock, ChevronDown, ChevronUp, ExternalLink,
  Eye, Zap, CheckCircle, AlertTriangle, Navigation
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SeverityBadge } from '@/components/ui/GlassCard'

interface DetectionResult {
  id: string
  imageUrl?: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  confidence: number
  location: string
  coordinates: { lat: number; lng: number }
  timestamp: string
  size: 'large' | 'medium' | 'small'
  distance: string
}

interface DetectionResultCardProps {
  detections?: DetectionResult[]
  className?: string
}

const mockDetections: DetectionResult[] = [
  {
    id: '1',
    severity: 'critical',
    confidence: 94,
    location: 'MG Road, Raipur',
    coordinates: { lat: 21.2514, lng: 81.6296 },
    timestamp: '2 min ago',
    size: 'large',
    distance: '45cm diameter'
  },
  {
    id: '2',
    severity: 'high',
    confidence: 87,
    location: 'GE Road, Shankar Nagar',
    coordinates: { lat: 21.2564, lng: 81.6346 },
    timestamp: '15 min ago',
    size: 'medium',
    distance: '32cm diameter'
  },
  {
    id: '3',
    severity: 'medium',
    confidence: 76,
    location: 'Pandri Road',
    coordinates: { lat: 21.2539, lng: 81.6190 },
    timestamp: '1 hour ago',
    size: 'small',
    distance: '18cm diameter'
  },
  {
    id: '4',
    severity: 'low',
    confidence: 65,
    location: 'Shankar Nagar',
    coordinates: { lat: 21.2639, lng: 81.6240 },
    timestamp: '2 hours ago',
    size: 'small',
    distance: '12cm diameter'
  },
]

export default function DetectionResultCard({ detections = mockDetections, className }: DetectionResultCardProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-2xl bg-slate-900/60 border border-slate-800/50 overflow-hidden', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
            <Zap className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Detection Results</h3>
            <p className="text-sm text-slate-400">{detections.length} potholes detected</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/50 bg-slate-900/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <span className="text-sm text-slate-400">{detections.length} results</span>
      </div>

      {/* Results */}
      <div className={cn(
        'p-4',
        viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'
      )}>
        {detections.map((detection, i) => (
          <motion.div
            key={detection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              'rounded-xl bg-slate-800/30 border border-slate-700/50 overflow-hidden transition-all duration-300',
              'hover:bg-slate-800/50 hover:border-slate-600'
            )}
          >
            {/* Detection Image Placeholder */}
            <div className="relative h-32 bg-gradient-to-br from-slate-800/80 to-slate-900/80 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className={cn(
                  'w-8 h-8 mx-auto mb-2',
                  detection.severity === 'critical' ? 'text-red-400' :
                  detection.severity === 'high' ? 'text-orange-400' :
                  detection.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                )} />
                <p className="text-sm text-slate-400">Pothole Detected</p>
              </div>
              <div className="absolute top-3 right-3">
                <SeverityBadge severity={detection.severity} />
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                  <Eye className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-white font-medium">{detection.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Detection Details */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpanded(expanded === detection.id ? null : detection.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{detection.location}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {detection.coordinates.lat.toFixed(4)}, {detection.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                    <Navigation className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
                    {expanded === detection.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expanded === detection.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-slate-700/50 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-900/50">
                        <p className="text-xs text-slate-400">Size</p>
                        <p className="text-sm text-white font-medium capitalize">{detection.size} ({detection.distance})</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/50">
                        <p className="text-xs text-slate-400">Detected</p>
                        <p className="text-sm text-white font-medium">{detection.timestamp}</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm">
                      <ExternalLink className="w-4 h-4" />
                      View on Map
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
