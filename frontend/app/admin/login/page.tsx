'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import PhoneInput from '@/components/auth/PhoneInput'
import OTPInput from '@/components/auth/OTPInput'
import LoadingButton from '@/components/auth/LoadingButton'
import ErrorAlert from '@/components/auth/ErrorAlert'
import SuccessState from '@/components/auth/SuccessState'
import AccessDeniedState from '@/components/auth/AccessDeniedState'
import RoleValidationLoader from '@/components/auth/RoleValidationLoader'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { checkOfficerAuthorization, type AuthorizedOfficer } from '@/lib/officerAuth'
import type { UserRole } from '@/lib/types'
import {
  ArrowLeft, ChevronRight, Radio, Shield, Lock,
  AlertTriangle, Building, Eye, Database, User, MapPin, Crown, Zap
} from 'lucide-react'

type AuthStep = 'phone' | 'validating' | 'access_denied' | 'otp' | 'authorizing' | 'success'
type AccessDeniedReason = 'not_authorized' | 'inactive' | 'invalid_role' | 'error' | 'pending_approval' | 'not_found' | 'demo'

interface OfficerInfo {
  name: string
  role: UserRole
  district: string
  department: string
}

const floatingElements = [
  { icon: Shield, x: '8%', y: '18%', delay: 0 },
  { icon: Lock, x: '88%', y: '12%', delay: 0.7 },
  { icon: Building, x: '78%', y: '72%', delay: 1.2 },
  { icon: Eye, x: '12%', y: '78%', delay: 1.7 },
]

const features = [
  { icon: Shield, title: 'Officer Verification', desc: 'Government ID validation' },
  { icon: Lock, title: 'Encrypted Access', desc: 'Secure data transmission' },
  { icon: Building, title: 'Department Dashboard', desc: 'Full administrative control' },
]

export default function OfficerLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<AuthStep>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const [isValidPhone, setIsValidPhone] = useState(false)
  const [accessDeniedReason, setAccessDeniedReason] = useState<AccessDeniedReason>('not_authorized')
  const [officerInfo, setOfficerInfo] = useState<OfficerInfo | null>(null)
  const [authorizedOfficer, setAuthorizedOfficer] = useState<AuthorizedOfficer | null>(null)

  const { isAuthenticated, isLoading: authLoading, role } = useAuthStore()

  useEffect(() => {
    if (!authLoading && isAuthenticated && (role === 'admin' || role === 'officer' || role === 'super_admin')) {
      router.push('/admin/dashboard')
    }
  }, [authLoading, isAuthenticated, role, router])

  const handlePhoneSubmit = useCallback(async () => {
    if (!isValidPhone) return

    setIsLoading(true)
    setError('')
    setStep('validating')

    try {
      // Check officer authorization against Firestore
      const result = await checkOfficerAuthorization(phone)

      if (!result.authorized) {
        setAccessDeniedReason(result.reason || 'not_authorized')
        setStep('access_denied')
        setIsLoading(false)
        return
      }

      // Officer is authorized - store their info
      if (result.officer) {
        setAuthorizedOfficer(result.officer)
        setOfficerInfo({
          name: result.officer.name,
          role: result.officer.role,
          district: result.officer.district,
          department: result.officer.department,
        })
      }

      // Simulate sending OTP
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStep('otp')
      setResendTimer(30)
    } catch (err) {
      setError('Failed to verify officer credentials. Please try again.')
      setStep('phone')
    } finally {
      setIsLoading(false)
    }
  }, [isValidPhone, phone])

  const handleVerifyOTP = useCallback(async (enteredOtp: string) => {
    setIsLoading(true)
    setError('')
    setOtp(enteredOtp)
    setStep('authorizing')

    try {
      // Simulate verification
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (enteredOtp.length === 6) {
        // Create user object from authorized officer data
        const userRole = authorizedOfficer?.role || 'officer'

        const demoUser = {
          uid: authorizedOfficer?.uid || `officer-${Date.now()}`,
          email: '',
          phone: `+91${phone}`,
          displayName: authorizedOfficer?.name || 'Officer',
          role: userRole,
          jurisdictionId: authorizedOfficer?.district || null,
          departmentId: authorizedOfficer?.department || null,
          photoUrl: null,
          language: 'en',
          lastLoginAt: new Date(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        useAuthStore.setState({
          user: demoUser,
          isAuthenticated: true,
          role: userRole,
          isLoading: false,
        })

        setStep('success')
      } else {
        setError('Invalid OTP. Please try again.')
        setStep('otp')
      }
    } catch {
      setError('Verification failed. Please try again.')
      setStep('otp')
    } finally {
      setIsLoading(false)
    }
  }, [authorizedOfficer, phone])

  const handleResendOTP = useCallback(async () => {
    setResendTimer(30)
    setError('')
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleBack = () => {
    setStep('phone')
    setPhone('')
    setOtp('')
    setError('')
    setOfficerInfo(null)
    setAuthorizedOfficer(null)
  }

  const handleSuccessComplete = () => {
    router.push('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Panel - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px]"
          />

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
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-12"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-2xl blur opacity-30 -z-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sadak Saathi</h1>
              <p className="text-sm text-purple-400/80">Officer Portal</p>
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
              Government{' '}
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Control Center
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-md">
              Authorized personnel only. Access the complete road infrastructure
              management system for officers and administrators.
            </p>
          </motion.div>

          {/* Warning Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 mb-8"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
            <p className="text-sm text-yellow-200">
              This portal is restricted to authorized government officers only.
              Unauthorized access is a punishable offense.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-8 mb-12"
          >
            <div>
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-slate-500">Active Officers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-sm text-slate-500">Departments</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">1M+</p>
              <p className="text-sm text-slate-500">Reports Handled</p>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Icon className="w-5 h-5 text-purple-400" />
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

        {/* Secure Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-8 left-12 flex items-center gap-2"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Lock className="w-3 h-3 text-purple-500" />
            <span className="text-xs text-purple-400 font-medium">ENCRYPTED CONNECTION</span>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Auth Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-400 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="text-xl font-bold text-white block">Sadak Saathi</span>
              <span className="text-xs text-purple-400">Officer Portal</span>
            </div>
          </div>

          {/* Auth Card */}
          <div className="relative rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-6 sm:p-8 shadow-2xl">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-3xl" />

            <div className="relative z-10">
              {/* Back Button */}
              <AnimatePresence>
                {step !== 'phone' && step !== 'validating' && step !== 'access_denied' && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={handleBack}
                    className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Phone Step */}
              <AnimatePresence mode="wait">
                {step === 'phone' && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-purple-400" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Officer Login
                      </h2>
                      <p className="text-sm sm:text-base text-slate-400">
                        Enter your registered mobile number
                      </p>
                    </div>

                    {/* Error Alert */}
                    <AnimatePresence>
                      {error && (
                        <ErrorAlert
                          message={error}
                          type="error"
                          onDismiss={() => setError('')}
                          className="mb-6"
                        />
                      )}
                    </AnimatePresence>

                    <div className="space-y-6">
                      <PhoneInput
                        value={phone}
                        onChange={(val) => {
                          setPhone(val)
                          setIsValidPhone(val.length === 10)
                        }}
                        onSubmit={handlePhoneSubmit}
                        disabled={isLoading}
                        isValid={isValidPhone}
                      />

                      <LoadingButton
                        onClick={handlePhoneSubmit}
                        isLoading={isLoading}
                        loadingText="Verifying..."
                        disabled={!isValidPhone}
                        className="w-full"
                        size="lg"
                        variant="primary"
                      >
                        Verify & Continue
                        <ChevronRight className="w-5 h-5" />
                      </LoadingButton>

                      {/* Demo Login Button */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="px-2 bg-slate-900/50 text-slate-500">Or</span>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          setIsLoading(true)
                          // Demo admin login
                          const demoUser = {
                            uid: 'demo-admin',
                            email: 'admin@sadaksaathi.gov.in',
                            phone: '+919999999999',
                            displayName: 'Demo Admin',
                            role: 'admin' as const,
                            jurisdictionId: 'All India',
                            departmentId: 'PWD',
                            photoUrl: null,
                            language: 'en',
                            lastLoginAt: new Date(),
                            isActive: true,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                          }
                          useAuthStore.setState({
                            user: demoUser,
                            isAuthenticated: true,
                            role: 'admin',
                            isLoading: false,
                          })
                          router.push('/admin/dashboard')
                        }}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all"
                      >
                        <Zap className="w-4 h-4" />
                        Demo Admin Login
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Validating Step */}
                {step === 'validating' && (
                  <motion.div
                    key="validating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                        <Database className="w-8 h-8 text-purple-400 animate-pulse" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Verifying Officer
                      </h2>
                      <p className="text-sm sm:text-base text-slate-400">
                        Checking authorization against government records...
                      </p>
                    </div>

                    <RoleValidationLoader
                      currentStep="validating"
                      officerName={officerInfo?.name}
                      role={officerInfo?.role}
                      district={officerInfo?.district}
                    />
                  </motion.div>
                )}

                {/* Access Denied Step */}
                {step === 'access_denied' && (
                  <motion.div
                    key="access_denied"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AccessDeniedState
                      reason={accessDeniedReason}
                      contactEmail="admin@sadaksaathi.gov.in"
                      contactPhone="+91 1800-XXX-XXXX"
                    />
                  </motion.div>
                )}

                {/* OTP Step */}
                {step === 'otp' && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Officer Info Banner */}
                    {officerInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3"
                      >
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <Shield className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{officerInfo.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="capitalize">{officerInfo.role.replace('_', ' ')}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {officerInfo.district}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-green-400" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Verify OTP
                      </h2>
                      <p className="text-sm sm:text-base text-slate-400">
                        We've sent a code to +91 {phone.slice(0, 5)} {phone.slice(5)}
                      </p>
                    </div>

                    {/* Error Alert */}
                    <AnimatePresence>
                      {error && (
                        <ErrorAlert
                          message={error}
                          type="error"
                          onDismiss={() => setError('')}
                          className="mb-6"
                        />
                      )}
                    </AnimatePresence>

                    <div className="space-y-8">
                      {/* OTP Input */}
                      <div className="flex justify-center">
                        <OTPInput
                          length={6}
                          onComplete={handleVerifyOTP}
                          disabled={isLoading}
                          error={error}
                          onChange={setOtp}
                        />
                      </div>

                      {/* Resend Timer */}
                      <div className="text-center space-y-4">
                        {resendTimer > 0 ? (
                          <p className="text-sm text-slate-400">
                            Resend OTP in{' '}
                            <span className="text-purple-400 font-medium">{resendTimer}s</span>
                          </p>
                        ) : (
                          <button
                            onClick={handleResendOTP}
                            disabled={isLoading}
                            className="text-sm text-purple-400 hover:text-purple-300 font-medium disabled:opacity-50"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>

                      {/* Demo hint */}
                      <p className="text-xs text-center text-slate-500">
                        Demo: Enter any 6 digits to verify
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Authorizing Step */}
                {step === 'authorizing' && (
                  <motion.div
                    key="authorizing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-blue-400 animate-pulse" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Authorizing Access
                      </h2>
                      <p className="text-sm sm:text-base text-slate-400">
                        Finalizing your session...
                      </p>
                    </div>

                    <RoleValidationLoader
                      currentStep="authorizing"
                      officerName={officerInfo?.name}
                      role={officerInfo?.role}
                      district={officerInfo?.district}
                    />
                  </motion.div>
                )}

                {/* Success Step */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SuccessState
                      title="Access Granted"
                      message="Redirecting to dashboard..."
                      onComplete={handleSuccessComplete}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6 text-xs sm:text-sm text-slate-500"
          >
            Having trouble?{' '}
            <Link href="/admin/support" className="text-purple-400 hover:text-purple-300">
              Contact IT Support
            </Link>
          </motion.p>

          {/* Citizen Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-4"
          >
            <Link
              href="/login"
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Citizen Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
