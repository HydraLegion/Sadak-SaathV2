'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle, Lock, User, Building, MapPin, Database } from 'lucide-react'
import type { UserRole } from '@/lib/types'

interface RoleValidationLoaderProps {
  currentStep: 'verifying' | 'validating' | 'authorizing' | 'loading'
  officerName?: string
  role?: UserRole
  district?: string
}

const steps = [
  { key: 'verifying', label: 'Verifying credentials', icon: Lock },
  { key: 'validating', label: 'Validating officer profile', icon: User },
  { key: 'authorizing', label: 'Checking authorization', icon: Shield },
  { key: 'loading', label: 'Loading dashboard', icon: Database },
]

export default function RoleValidationLoader({
  currentStep,
  officerName,
  role,
  district,
}: RoleValidationLoaderProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-8">
      {/* Animated Shield Icon */}
      <motion.div
        className="relative"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-xl border-2 border-dashed border-blue-500/30"
          />
          <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />
        </div>
      </motion.div>

      {/* Progress Steps */}
      <div className="space-y-4 w-full max-w-xs">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index < currentIndex
          const isActive = index === currentIndex
          const isPending = index > currentIndex

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-green-500/20 text-green-400'
                    : isActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-slate-800/50 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm ${
                  isActive
                    ? 'text-white font-medium'
                    : isCompleted
                    ? 'text-green-400'
                    : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>

              {/* Loading dots for active step */}
              {isActive && (
                <motion.div
                  className="flex gap-1 ml-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-1.5 h-1.5 rounded-full bg-blue-400"
                    />
                  ))}
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Officer Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-xs p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-3"
      >
        {officerName && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Officer</p>
              <p className="text-sm text-white font-medium">{officerName}</p>
            </div>
          </div>
        )}

        {role && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Role</p>
              <p className="text-sm text-white font-medium capitalize">{role.replace('_', ' ')}</p>
            </div>
          </div>
        )}

        {district && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <MapPin className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">District</p>
              <p className="text-sm text-white font-medium">{district}</p>
            </div>
          </div>
        )}

        {!officerName && !role && !district && (
          <p className="text-sm text-slate-400 text-center">Loading officer profile...</p>
        )}
      </motion.div>
    </div>
  )
}