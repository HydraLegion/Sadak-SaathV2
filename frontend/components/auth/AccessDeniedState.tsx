'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, Building, Lock, User, Mail, Phone, FileText } from 'lucide-react'

interface AccessDeniedStateProps {
  reason?: 'not_authorized' | 'inactive' | 'invalid_role' | 'error' | 'pending_approval' | 'not_found'
  officerName?: string
  district?: string
  contactEmail?: string
  contactPhone?: string
}

const reasonConfig = {
  not_authorized: {
    icon: AlertTriangle,
    title: 'Access Denied',
    subtitle: 'Your mobile number is not authorized for officer access',
    description: 'Only pre-approved government officers can access this portal. If you believe this is an error, please contact your district administrator.',
    showContact: true,
  },
  not_found: {
    icon: AlertTriangle,
    title: 'Officer Not Found',
    subtitle: 'No officer found with this mobile number',
    description: 'The mobile number entered is not registered in our system. Please verify your number or contact the administrator.',
    showContact: true,
  },
  inactive: {
    icon: Lock,
    title: 'Account Inactive',
    subtitle: 'Your officer account has been deactivated',
    description: 'Your account is currently inactive. Please contact the system administrator to restore access.',
    showContact: true,
  },
  invalid_role: {
    icon: Shield,
    title: 'Insufficient Permissions',
    subtitle: 'Your role does not have admin access',
    description: 'You are logged in as a citizen. This portal is restricted to government officers and administrators only.',
    showContact: false,
  },
  error: {
    icon: AlertTriangle,
    title: 'Access Error',
    subtitle: 'Unable to verify officer credentials',
    description: 'An error occurred while verifying your credentials. Please try again later or contact the administrator.',
    showContact: true,
  },
  pending_approval: {
    icon: FileText,
    title: 'Account Pending Approval',
    subtitle: 'Your officer application is under review',
    description: 'Your registration is awaiting verification. You will receive an SMS confirmation once approved.',
    showContact: true,
  },
}

export default function AccessDeniedState({
  reason = 'not_authorized',
  officerName,
  district,
  contactEmail = 'admin@sadaksaathi.gov.in',
  contactPhone = '+91 1800-XXX-XXXX',
}: AccessDeniedStateProps) {
  const config = reasonConfig[reason as keyof typeof reasonConfig] ?? reasonConfig.not_authorized
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-6"
    >
      {/* Icon with animated ring */}
      <div className="relative">
        {/* Pulse ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-red-500/20"
        />

        {/* Icon container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/30 flex items-center justify-center"
        >
          <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-red-400" />
        </motion.div>

        {/* Shield badge */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-900 border-2 border-red-500/50 flex items-center justify-center">
          <Lock className="w-4 h-4 text-red-400" />
        </div>
      </div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center space-y-2 max-w-sm"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-white">{config.title}</h3>
        <p className="text-sm sm:text-base text-red-400 font-medium">{config.subtitle}</p>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{config.description}</p>
      </motion.div>

      {/* Officer Details Card (if available) */}
      <AnimatePresence>
        {(officerName || district) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-xs p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-3"
          >
            {officerName && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-700/50">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Officer Name</p>
                  <p className="text-sm text-white font-medium">{officerName}</p>
                </div>
              </div>
            )}
            {district && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-700/50">
                  <Building className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">District</p>
                  <p className="text-sm text-white font-medium">{district}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Support Button */}
      <AnimatePresence>
        {config.showContact && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-3 w-full max-w-xs"
          >
            <a
              href={`mailto:${contactEmail}?subject=Officer%20Access%20Request&body=Name:%20%0AMobile:%20%0ADistrict:%20%0ADepartment:%20`}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Contact Administrator</span>
            </a>

            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {contactPhone}
              </span>
              <span>|</span>
              <span>{contactEmail}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return to Citizen Login */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <a
          href="/login"
          className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Return to Citizen Login
        </a>
      </motion.div>
    </motion.div>
  )
}