'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Phone, Mail, Eye, EyeOff, Loader2, User, Shield } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/lib/types'

export default function AuthPage() {
  const [tab, setTab] = useState<'phone' | 'email'>('email')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoRole, setDemoRole] = useState<'citizen' | 'officer' | 'admin'>('admin')
  const [error, setError] = useState('')
  const router = useRouter()

  const { isLoading, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    setError('')

    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 800))

      // Create demo user based on selected role
      const demoUser = {
        uid: `demo-${demoRole}-${Date.now()}`,
        email: `demo@${demoRole}.com`,
        phone: '+919876543210',
        displayName: demoRole === 'admin' ? 'Demo Admin' : demoRole === 'officer' ? 'Demo Officer' : 'Demo Citizen',
        role: demoRole as UserRole,
        jurisdictionId: demoRole === 'citizen' ? null : 'DL-Central',
        departmentId: demoRole === 'citizen' ? null : 'PWD-DL',
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
        role: demoRole,
        isLoading: false,
      })

      router.push('/dashboard')
    } catch (err) {
      setError('Login failed. Please try again.')
    }

    setDemoLoading(false)
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    }
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5, 10)}`
  }

  const handleSendOtp = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      return
    }
    setShowOtpInput(true)
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return

    setDemoLoading(true)
    setError('')

    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create demo user for officer
      const demoUser = {
        uid: `demo-officer-${Date.now()}`,
        email: 'demo@officer.com',
        phone: `+91${phone.replace(/\D/g, '')}`,
        displayName: 'Demo Officer',
        role: 'officer' as UserRole,
        jurisdictionId: 'DL-Central',
        departmentId: 'PWD-DL',
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
        role: 'officer',
        isLoading: false,
      })

      router.push('/dashboard')
    } catch (err) {
      setError('OTP verification failed. Please try again.')
    }

    setDemoLoading(false)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setDemoLoading(true)
    setError('')

    try {
      // Simulate login
      await new Promise(resolve => setTimeout(resolve, 500))

      // Create demo user based on email
      const role = email.includes('admin') ? 'admin' : email.includes('officer') ? 'officer' : 'citizen'

      const demoUser = {
        uid: `demo-${role}-${Date.now()}`,
        email: email,
        phone: '',
        displayName: email.split('@')[0],
        role: role as UserRole,
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
      setError('Login failed. Please check your credentials.')
    }

    setDemoLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-foreground">SS</span>
          </div>
          <h1 className="text-3xl font-bold">Sadak Saathi</h1>
          <p className="text-muted-foreground mt-2">AI-Powered Road Intelligence Platform</p>
        </div>

        {/* Demo Login Section */}
        <Card className="border-severity-low/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-severity-low" />
              Demo Access
            </CardTitle>
            <CardDescription>Quick access with pre-configured demo accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setDemoRole('citizen')}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all',
                  demoRole === 'citizen'
                    ? 'border-green-500 bg-green-500/10 text-green-500'
                    : 'border-muted hover:border-green-500/50'
                )}
              >
                <User className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs">Citizen</span>
              </button>
              <button
                onClick={() => setDemoRole('officer')}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all',
                  demoRole === 'officer'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-muted hover:border-blue-500/50'
                )}
              >
                <Shield className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs">Officer</span>
              </button>
              <button
                onClick={() => setDemoRole('admin')}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all',
                  demoRole === 'admin'
                    ? 'border-red-500 bg-red-500/10 text-red-500'
                    : 'border-muted hover:border-red-500/50'
                )}
              >
                <Shield className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs">Admin</span>
              </button>
            </div>

            <Button
              className={cn(
                'w-full h-12 text-lg',
                demoRole === 'citizen' && 'bg-green-500 hover:bg-green-600',
                demoRole === 'officer' && 'bg-blue-500 hover:bg-blue-600',
                demoRole === 'admin' && 'bg-red-500 hover:bg-red-600'
              )}
              onClick={handleDemoLogin}
              disabled={demoLoading}
            >
              {demoLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <User className="h-5 w-5 mr-2" />}
              Login as {demoRole.charAt(0).toUpperCase() + demoRole.slice(1)}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or sign in with credentials</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in with your credentials</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab) }}>
              <TabsList className="w-full">
                <TabsTrigger value="phone" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone
                </TabsTrigger>
                <TabsTrigger value="email" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="phone" className="space-y-4 mt-4">
                {!showOtpInput ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-12"
                        />
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleSendOtp} disabled={phone.replace(/\D/g, '').length < 10}>
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Send OTP
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm">OTP sent to</p>
                      <p className="font-medium">{formatPhone(phone)}</p>
                      <button className="text-sm text-primary hover:underline mt-2" onClick={() => setShowOtpInput(false)}>
                        Change number
                      </button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-2xl tracking-[1em] font-mono"
                        maxLength={6}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">For demo, enter any 6 digits</p>
                    <Button className="w-full" onClick={handleVerifyOtp} disabled={otp.length !== 6}>
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Verify & Sign In
                    </Button>
                  </>
                )}
              </TabsContent>

              <TabsContent value="email" className="space-y-4 mt-4">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="officer@pwd.gov.in" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || !email || !password}>
                    {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</> : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
            <p>New user? <button className="text-primary hover:underline" onClick={() => router.push('/login')}>Register here</button></p>
          </CardFooter>
        </Card>

        <div className="flex justify-center gap-2">
          {['English', 'हिंदी', 'தமிழ்', 'मराठी'].map((lang) => (
            <button key={lang} className={cn('px-3 py-1 rounded-full text-sm transition-colors', lang === 'English' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80')}>
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
