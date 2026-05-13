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
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import {
  ArrowLeft, ChevronRight, Radio, MapPin, Shield,
  CheckCircle, Zap, Clock, Smartphone, Lock, User
} from 'lucide-react'

type AuthStep = 'phone' | 'otp' | 'success'

const floatingElements = [
  { icon: MapPin, x: '10%', y: '20%', delay: 0 },
  { icon: Shield, x: '85%', y: '15%', delay: 0.5 },
  { icon: CheckCircle, x: '75%', y: '70%', delay: 1 },
  { icon: Zap, x: '15%', y: '75%', delay: 1.5 },
]

const features = [
  { icon: Zap, title: 'AI-Powered Detection', desc: 'Advanced pothole identification' },
  { icon: Clock, title: 'Real-time Updates', desc: 'Track complaint status instantly' },
  { icon: Lock, title: 'Secure & Private', desc: 'Your data is protected' },
]

export default function CitizenLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<AuthStep>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const [isValidPhone, setIsValidPhone] = useState(false)

  const { isAuthenticated, isLoading: authLoading } = useAuthStore()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    setIsValidPhone(/^\d{10}$/.test(phone))
  }, [phone])

  const handleSendOTP = useCallback(async () => {
    if (!isValidPhone) return

    setIsLoading(true)
    setError('')

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStep('otp')
      setResendTimer(30)
    } catch {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [isValidPhone])

  const handleVerifyOTP = useCallback(async (enteredOtp: string) => {
    setIsLoading(true)
    setError('')
    setOtp(enteredOtp)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (enteredOtp.length === 6) {
        const demoUser = {
          uid: `demo-${Date.now()}`,
          email: '',
          phone: `+91${phone}`,
          displayName: 'Citizen User',
          role: 'citizen' as const,
          jurisdictionId: null,
          departmentId: null,
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
          role: 'citizen',
          isLoading: false,
        })
        setStep('success')
      } else {
        setError('Invalid OTP. Please try again.')
      }
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [phone])

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
  }

  const handleSuccessComplete = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

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
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-12"
          >
            <Link href="/login" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur opacity-30 -z-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sadak Saathi</h1>
                <p className="text-sm text-blue-400/80">Road Intelligence Platform</p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Citizen{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Portal
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-md">
              Report potholes, track repairs, and contribute to better road infrastructure in your community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-8 mb-12"
          >
            <div>
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-sm text-slate-500">Reports Filed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">85%</p>
              <p className="text-sm text-slate-500">Resolution Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">200+</p>
              <p className="text-sm text-slate-500">Cities</p>
            </div>
          </motion.div>

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
            <Radio className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-blue-400 font-medium">LIVE MONITORING</span>
          </motion.div>
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
            <Link href="/login" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Sadak Saathi</span>
            </Link>
          </div>

          {/* Auth Card */}
          <div className="relative rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-6 sm:p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl" />

            <div className="relative z-10">
              {/* Back Button */}
              <AnimatePresence>
                {step !== 'phone' && (
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

              {/* Header */}
              <motion.div
                key={step}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {step === 'phone' && 'Citizen Login'}
                  {step === 'otp' && 'Verify OTP'}
                  {step === 'success' && 'Success!'}
                </h2>
                <p className="text-sm sm:text-base text-slate-400">
                  {step === 'phone' && 'Enter your mobile number to continue'}
                  {step === 'otp' && `We've sent a code to +91 ${phone.slice(0, 5)} ${phone.slice(5)}`}
                  {step === 'success' && "You're all set!"}
                </p>
              </motion.div>

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

              {/* Phone Input Step */}
              <AnimatePresence mode="wait">
                {step === 'phone' && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-6">
                      <PhoneInput
                        value={phone}
                        onChange={(val) => {
                          setPhone(val)
                          setIsValidPhone(val.length === 10)
                        }}
                        onSubmit={handleSendOTP}
                        disabled={isLoading}
                        isValid={isValidPhone}
                      />

                      <LoadingButton
                        onClick={handleSendOTP}
                        isLoading={isLoading}
                        loadingText="Sending OTP..."
                        disabled={!isValidPhone}
                        className="w-full"
                        size="lg"
                      >
                        Get OTP
                        <ChevronRight className="w-5 h-5" />
                      </LoadingButton>

                      {/* Demo Login */}
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
                          const demoUser = {
                            uid: 'demo-citizen',
                            email: '',
                            phone: '+919999999999',
                            displayName: 'Demo Citizen',
                            role: 'citizen' as const,
                            jurisdictionId: null,
                            departmentId: null,
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
                            role: 'citizen',
                            isLoading: false,
                          })
                          router.push('/dashboard')
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-400/50 transition-all"
                      >
                        <Zap className="w-4 h-4" />
                        Demo Citizen Login
                      </button>
                    </div>
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
                    <div className="space-y-8">
                      <div className="flex justify-center">
                        <OTPInput
                          length={6}
                          onComplete={handleVerifyOTP}
                          disabled={isLoading}
                          error={error}
                          onChange={setOtp}
                        />
                      </div>

                      <div className="text-center space-y-4">
                        {resendTimer > 0 ? (
                          <p className="text-sm text-slate-400">
                            Resend OTP in{' '}
                            <span className="text-blue-400 font-medium">{resendTimer}s</span>
                          </p>
                        ) : (
                          <button
                            onClick={handleResendOTP}
                            disabled={isLoading}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center"
                          >
                            <p className="text-sm text-slate-400">Verifying your code...</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <p className="text-xs text-center text-slate-500">
                        Demo: Enter any 6 digits to verify
                      </p>
                    </div>
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
                      title="Welcome!"
                      message="Authentication successful. Redirecting..."
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
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>
          </motion.p>

          {/* Officer Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-4"
          >
            <Link href="/officer-login" className="text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Government Officer Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}