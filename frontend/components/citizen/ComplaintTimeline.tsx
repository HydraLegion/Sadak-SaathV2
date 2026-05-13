'use client'

import { motion } from 'framer-motion'
import {
  MapPin, Clock, CheckCircle, AlertTriangle, Truck,
  FileText, MessageSquare, ChevronRight, Building, User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/GlassCard'

interface Complaint {
  id: string
  title: string
  location: string
  status: 'pending' | 'reviewing' | 'assigned' | 'dispatched' | 'resolved'
  submittedAt: string
  updatedAt: string
  department: string
  timeline: {
    status: string
    timestamp: string
    description: string
  }[]
}

interface ComplaintTimelineProps {
  complaints?: Complaint[]
  className?: string
}

const mockComplaints: Complaint[] = [
  {
    id: 'CMP-2024-0847',
    title: 'Large pothole near Metro Station',
    location: 'Nehru Road, Near Metro Station',
    status: 'dispatched',
    submittedAt: '2 days ago',
    updatedAt: '1 hour ago',
    department: 'PWD Road Maintenance',
    timeline: [
      { status: 'submitted', timestamp: '2 days ago', description: 'Complaint registered successfully' },
      { status: 'reviewing', timestamp: '2 days ago', description: 'Complaint under review by admin' },
      { status: 'assigned', timestamp: '1 day ago', description: 'Assigned to PWD Road Maintenance' },
      { status: 'dispatched', timestamp: '1 hour ago', description: 'Repair team dispatched' },
    ]
  },
  {
    id: 'CMP-2024-0846',
    title: 'Multiple potholes on main road',
    location: 'MG Road, Sector 12',
    status: 'assigned',
    submittedAt: '4 days ago',
    updatedAt: '1 day ago',
    department: 'Municipal Corporation',
    timeline: [
      { status: 'submitted', timestamp: '4 days ago', description: 'Complaint registered successfully' },
      { status: 'reviewing', timestamp: '3 days ago', description: 'Complaint under review by admin' },
      { status: 'assigned', timestamp: '1 day ago', description: 'Assigned to Municipal Corporation' },
    ]
  },
  {
    id: 'CMP-2024-0845',
    title: 'Road damage causing accidents',
    location: 'Gandhi Chowk',
    status: 'resolved',
    submittedAt: '1 week ago',
    updatedAt: '3 days ago',
    department: 'NHAI',
    timeline: [
      { status: 'submitted', timestamp: '1 week ago', description: 'Complaint registered successfully' },
      { status: 'reviewing', timestamp: '6 days ago', description: 'Complaint under review by admin' },
      { status: 'assigned', timestamp: '5 days ago', description: 'Assigned to NHAI' },
      { status: 'dispatched', timestamp: '4 days ago', description: 'Repair team dispatched' },
      { status: 'resolved', timestamp: '3 days ago', description: 'Road repaired and verified' },
    ]
  },
]

const statusIcons = {
  submitted: FileText,
  reviewing: Clock,
  assigned: User,
  dispatched: Truck,
  resolved: CheckCircle,
}

const statusColors = {
  submitted: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  reviewing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  assigned: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  dispatched: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
}

export default function ComplaintTimeline({ complaints = mockComplaints, className }: ComplaintTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-2xl bg-slate-900/60 border border-slate-800/50 overflow-hidden', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
            <AlertTriangle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Complaint Tracking</h3>
            <p className="text-sm text-slate-400">{complaints.length} active complaints</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
            1 In Progress
          </span>
        </div>
      </div>

      {/* Complaints List */}
      <div className="divide-y divide-slate-800/50">
        {complaints.map((complaint, i) => (
          <motion.div
            key={complaint.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 hover:bg-slate-800/30 transition-colors"
          >
            {/* Complaint Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-500">{complaint.id}</span>
                  <StatusBadge status={complaint.status} />
                </div>
                <h4 className="text-sm font-medium text-white">{complaint.title}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{complaint.location}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-4">
              {/* Timeline Line */}
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-700" />

              <div className="space-y-4">
                {complaint.timeline.map((item, j) => {
                  const Icon = statusIcons[item.status as keyof typeof statusIcons] || Clock
                  const isCompleted = j < complaint.timeline.length - 1 || item.status === 'resolved'
                  const isActive = j === complaint.timeline.length - 1

                  return (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 + j * 0.05 }}
                      className="relative flex items-start gap-3"
                    >
                      {/* Timeline Dot */}
                      <div className={cn(
                        'relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        isActive
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25'
                          : isCompleted
                          ? 'bg-green-500/20'
                          : 'bg-slate-800/50'
                      )}>
                        {isCompleted && !isActive && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                        {isActive && (
                          <Icon className="w-4 h-4 text-white" />
                        )}
                        {!isCompleted && !isActive && (
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            item.status === 'pending' ? 'bg-slate-600 animate-pulse' : 'bg-slate-600'
                          )} />
                        )}
                      </div>

                      {/* Timeline Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            'text-sm font-medium capitalize',
                            isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                          )}>
                            {item.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-500">{item.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Department Info */}
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Building className="w-3 h-3" />
                <span>{complaint.department}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>Updated {complaint.updatedAt}</span>
              </div>
            </div>

            {/* Action Button */}
            {complaint.status !== 'resolved' && (
              <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors">
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <div className="p-4 border-t border-slate-800/50">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          View All Complaints
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}
