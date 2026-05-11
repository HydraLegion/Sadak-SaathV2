'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, User, Phone, Loader2, ChevronLeft, AlertTriangle, Fingerprint, Lock, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/lib/types'

type LoginType = 'citizen' | 'officer' | 'admin' | null

export default function LoginPage() {
  const router = useRouter()
  const [loginType, setLoginType] = useState<LoginType>(null)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'select' | 'credentials' | 'otp'>('select')

  const handleDemoLogin = async (role: UserRole) => {
    setIsLoading(true)
    setError('')
    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      const demoUser = {
        uid: `demo-${role}-${Date.now()}`,
        email: `demo@${role}.com`,
        phone: '',
        displayName: role === 'admin' ? 'Admin User' : role === 'officer' ? 'Officer User' : 'Citizen User',
        role: role,
        jurisdictionId: role === 'citizen' ? null : 'DL-Central',
        departmentId: role === 'citizen' ? null : 'PWD-DL',
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
        role: role,
        isLoading: false,
      })

      router.push('/dashboard')
    } catch (err) {
      setError('Login failed. Please try again.')
    }
    setIsLoading(false)
  }

  const handlePhoneLogin = async () => {
    if (phone.replace(/\D/g, '').length < 10) return
    setIsLoading(true)
    setError('')
    await new Promise(resolve => setTimeout(resolve, 1000))
    setShowOtpInput(true)
    setStep('otp')
    setIsLoading(false)
  }

  const handleOtpVerify = async () => {
    if (otp.length !== 6) return
    setIsLoading(true)
    setError('')

    await new Promise(resolve => setTimeout(resolve, 500))

    // Set role based on which login type was selected
    const role: UserRole = loginType === 'officer' ? 'officer' : 'citizen'

    const demoUser = {
      uid: `demo-${role}-${Date.now()}`,
      email: 'demo@user.com',
      phone: `+91${phone.replace(/\D/g, '')}`,
      displayName: role === 'officer' ? 'Officer User' : 'Citizen User',
      role: role,
      jurisdictionId: role === 'citizen' ? null : 'DL-Central',
      departmentId: role === 'citizen' ? null : 'PWD-DL',
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
      role: role,
      isLoading: false,
    })

    router.push('/dashboard')
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5, 10)}`
  }

  const getRoleColor = () => {
    switch (loginType) {
      case 'admin': return 'from-purple-500 to-indigo-600'
      case 'officer': return 'from-red-500 to-orange-600'
      default: return 'from-green-500 to-emerald-600'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-red-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-5xl relative z-10">
        {/* Back Button */}
        {loginType && (
          <button
            onClick={() => { setLoginType(null); setStep('select'); setShowOtpInput(false); }}
            className="absolute top-0 left-0 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">RakshaSaathi</span>
          </Link>
        </div>

        {/* Login Type Selection */}
        {loginType === null && step === 'select' && (
          <div className="grid md:grid-cols-3 gap-4 animate-fade-in">
            {/* Citizen Login */}
            <button
              onClick={() => setLoginType('citizen')}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-green-500/50 transition-all group text-left"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">Citizen</h2>
              <p className="text-slate-400 text-sm mb-3">Report accidents and track responses</p>
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Demo Login</span>
            </button>

            {/* Officer Login */}
            <button
              onClick={() => setLoginType('officer')}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-red-500/50 transition-all group text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/20 to-transparent rounded-bl-full" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">Officer</h2>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-medium">Gov</span>
              </div>
              <p className="text-slate-400 text-sm mb-3">Emergency response management</p>
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">Demo Login</span>
            </button>

            {/* Admin Login */}
            <button
              onClick={() => setLoginType('admin')}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-700 hover:border-purple-500/50 transition-all group text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">Admin</h2>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-medium">Super</span>
              </div>
              <p className="text-slate-400 text-sm mb-3">Full system control panel</p>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs">Demo Login</span>
            </button>
          </div>
        )}

        {/* Citizen Login Form */}
        {loginType === 'citizen' && step !== 'otp' && (
          <div className="animate-fade-in">
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-green-500/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Citizen Login</h2>
                  <p className="text-slate-400 text-sm">Sign in to report accidents and track responses</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">{error}</div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => handleDemoLogin('citizen')}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5" />}
                  Quick Demo Login
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-700 w-full absolute" />
                  <span className="bg-slate-900 px-4 text-sm text-slate-500 relative">or</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-green-500 focus:outline-none transition-colors text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePhoneLogin}
                  disabled={phone.replace(/\D/g, '').length < 10 || isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Send OTP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Officer Login Form */}
        {loginType === 'officer' && step !== 'otp' && (
          <div className="animate-fade-in">
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-red-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-2 bg-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Encrypted Connection
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Officer Login</h2>
                  <p className="text-slate-400 text-sm">Verified government officers only</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 mb-6">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                <p className="text-sm text-yellow-200">
                  This portal is for authorized government officers only.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">{error}</div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => handleDemoLogin('officer')}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                  Quick Demo Login
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-700 w-full absolute" />
                  <span className="bg-slate-900 px-4 text-sm text-slate-500 relative">or</span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Official Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-red-500 focus:outline-none transition-colors text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handlePhoneLogin}
                  disabled={phone.replace(/\D/g, '').length < 10 || isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Fingerprint className="w-5 h-5" />}
                  Verify & Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Login Form */}
        {loginType === 'admin' && step !== 'otp' && (
          <div className="animate-fade-in">
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-purple-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-2 bg-purple-500/20 text-purple-400 text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Super Admin Access
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Admin Login</h2>
                  <p className="text-slate-400 text-sm">Full system access and control</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 mb-6">
                <Shield className="w-5 h-5 text-purple-500 shrink-0" />
                <p className="text-sm text-purple-200">
                  This portal is for authorized super administrators only. Unauthorized access is prohibited.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">{error}</div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => handleDemoLogin('admin')}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crown className="w-5 h-5" />}
                  Quick Demo Login (Admin)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OTP Verification */}
        {step === 'otp' && (
          <div className="animate-fade-in">
            <div className={`p-8 rounded-2xl bg-slate-900/80 border border-${loginType === 'officer' ? 'red' : loginType === 'admin' ? 'purple' : 'green'}-500/30`}>
              <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor()} flex items-center justify-center mx-auto mb-4`}>
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold">Verify OTP</h2>
                <p className="text-slate-400 text-sm">Enter the 6-digit code sent to {formatPhone(phone)}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-12 h-14 rounded-xl bg-slate-800/50 border border-slate-700 text-center text-xl font-bold focus:border-red-500 focus:outline-none transition-colors"
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        setOtp(prev => prev.slice(0, i) + val + prev.slice(i + 1))
                        if (val && e.target.nextSibling) {
                          (e.target.nextSibling as HTMLInputElement).focus()
                        }
                      }}
                    />
                  ))}
                </div>

                <p className="text-center text-sm text-slate-500">For demo, enter any 6 digits</p>

                <button
                  onClick={handleOtpVerify}
                  disabled={otp.length !== 6 || isLoading}
                  className={cn(
                    'w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
                    loginType === 'officer'
                      ? 'bg-gradient-to-r from-red-500 to-orange-600'
                      : loginType === 'admin'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600',
                    (otp.length !== 6 || isLoading) && 'opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Verify OTP
                </button>

                <button
                  onClick={() => { setShowOtpInput(false); setStep('select'); setLoginType(null); setOtp('') }}
                  className="w-full text-center text-sm text-slate-400 hover:text-white"
                >
                  Change login method
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          By continuing, you agree to our <Link href="#" className="text-slate-400 hover:text-white">Terms of Service</Link>
        </p>
      </div>
    </div>
  )
}
