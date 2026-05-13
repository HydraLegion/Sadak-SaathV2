'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, query, orderBy, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/lib/types'
import {
  Shield, CheckCircle, XCircle, Loader2, Database, Trash2,
  Plus, ArrowRight, AlertTriangle, RefreshCw, User, Phone,
  MapPin, Building, Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OfficerData {
  uid: string
  name: string
  mobile: string
  role: UserRole
  district: string
  department: string
  isActive: boolean
}

const defaultOfficers: OfficerData[] = [
  {
    uid: 'admin_001',
    name: 'Chief Engineer - Chhattisgarh',
    mobile: '9999999999',
    role: 'super_admin',
    district: 'All India',
    department: 'Ministry of Road Transport',
    isActive: true,
  },
  {
    uid: 'admin_002',
    name: 'District Administrator - Central',
    mobile: '8888888888',
    role: 'admin',
    district: 'Raipur Central',
    department: 'PWD-CG',
    isActive: true,
  },
  {
    uid: 'admin_003',
    name: 'District Administrator - South',
    mobile: '7777777777',
    role: 'admin',
    district: 'Raipur South',
    department: 'PWD-CG',
    isActive: true,
  },
  {
    uid: 'officer_001',
    name: 'Road Inspector - Pandri',
    mobile: '6666666666',
    role: 'officer',
    district: 'Raipur Central',
    department: 'PWD-CG',
    isActive: true,
  },
  {
    uid: 'officer_002',
    name: 'Road Inspector - Shankar Nagar',
    mobile: '5555555555',
    role: 'officer',
    district: 'Raipur South',
    department: 'PWD-CG',
    isActive: true,
  },
  {
    uid: 'officer_003',
    name: 'NHAI Supervisor - NH-130',
    mobile: '4444444444',
    role: 'officer',
    district: 'Raipur',
    department: 'NHAI',
    isActive: true,
  },
  {
    uid: 'inspector_001',
    name: 'Quality Inspector - North',
    mobile: '3333333333',
    role: 'inspector',
    district: 'Raipur North',
    department: 'PWD-CG',
    isActive: true,
  },
]

type Status = 'idle' | 'loading' | 'success' | 'error'
type Step = 'checking' | 'review' | 'seeding' | 'complete'

export default function SetupPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, role } = useAuthStore()
  const [step, setStep] = useState<Step>('checking')
  const [status, setStatus] = useState<Status>('idle')
  const [existingOfficers, setExistingOfficers] = useState<string[]>([])
  const [seedResults, setSeedResults] = useState<{ added: number; failed: number; errors: string[] }>({
    added: 0,
    failed: 0,
    errors: [],
  })
  const [cleared, setCleared] = useState(false)

  // Auth check
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
      if (role !== 'admin' && role !== 'super_admin') {
        router.push('/')
        return
      }
      setStep('review')
    }
  }, [authLoading, isAuthenticated, role, router])

  // Fetch existing officers
  const fetchExistingOfficers = async () => {
    try {
      const q = query(collection(db, 'authorized_officers'), orderBy('name'))
      const snapshot = await getDocs(q)
      setExistingOfficers(snapshot.docs.map((doc) => doc.id))
    } catch (error) {
      console.error('Error fetching officers:', error)
    }
  }

  useEffect(() => {
    if (step === 'review') {
      fetchExistingOfficers()
    }
  }, [step])

  const handleClearAndSeed = async () => {
    setStep('seeding')
    setStatus('loading')

    let added = 0
    let failed = 0
    const errors: string[] = []

    try {
      // Clear existing officers
      const q = query(collection(db, 'authorized_officers'))
      const snapshot = await getDocs(q)

      const deletePromises = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, 'authorized_officers', docSnap.id))
      )
      await Promise.all(deletePromises)
      setCleared(true)

      // Add default officers
      for (const officer of defaultOfficers) {
        try {
          await setDoc(doc(db, 'authorized_officers', officer.uid), {
            name: officer.name,
            mobile: officer.mobile,
            role: officer.role,
            district: officer.district,
            department: officer.department,
            isActive: officer.isActive,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          added++
        } catch (error: any) {
          failed++
          errors.push(`${officer.name}: ${error.message}`)
        }
      }

      setSeedResults({ added, failed, errors })
      setStatus(added > 0 ? 'success' : 'error')
      setStep('complete')
    } catch (error: any) {
      setStatus('error')
      setSeedResults({ added: 0, failed: 0, errors: [error.message] })
      setStep('complete')
    }
  }

  const handleSeedOnly = async () => {
    setStep('seeding')
    setStatus('loading')

    let added = 0
    let failed = 0
    const errors: string[] = []

    try {
      // Add default officers (skip if exists)
      for (const officer of defaultOfficers) {
        try {
          await setDoc(
            doc(db, 'authorized_officers', officer.uid),
            {
              name: officer.name,
              mobile: officer.mobile,
              role: officer.role,
              district: officer.district,
              department: officer.department,
              isActive: officer.isActive,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          )
          added++
        } catch (error: any) {
          failed++
          errors.push(`${officer.name}: ${error.message}`)
        }
      }

      setSeedResults({ added, failed, errors })
      setStatus(added > 0 ? 'success' : 'error')
      setStep('complete')
    } catch (error: any) {
      setStatus('error')
      setSeedResults({ added: 0, failed: 0, errors: [error.message] })
      setStep('complete')
    }
  }

  // Loading state
  if (step === 'checking' || authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto" />
          <p className="text-slate-400">Verifying access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">Database Setup</h1>
        <p className="text-slate-400 mt-2">Initialize your officer database with default officers</p>
      </motion.div>

      {/* Review Step */}
      <AnimatePresence>
        {step === 'review' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Warning Card */}
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-200 font-medium">Heads up!</p>
                  <p className="text-sm text-yellow-300/80 mt-1">
                    This will populate the <code className="bg-yellow-500/20 px-1 rounded">authorized_officers</code> collection
                    in your Firestore database.
                  </p>
                </div>
              </div>
            </div>

            {/* Existing Officers Count */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400">Existing officers in database:</span>
                <span className="text-2xl font-bold text-white">{existingOfficers.length}</span>
              </div>
              <button
                onClick={fetchExistingOfficers}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Officers Preview */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
              <h3 className="text-sm font-medium text-white mb-4">Officers to be added:</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {defaultOfficers.map((officer) => (
                  <div
                    key={officer.uid}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{officer.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {officer.mobile}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{officer.role.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full',
                      officer.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    )}>
                      {officer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleClearAndSeed}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all"
              >
                <Trash2 className="w-5 h-5" />
                Clear & Seed Fresh
                <ArrowRight className="w-5 h-5" />
              </button>

              {existingOfficers.length > 0 && (
                <button
                  onClick={handleSeedOnly}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium hover:bg-slate-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add/Update Only (Keep Existing)
                </button>
              )}

              {existingOfficers.length === 0 && (
                <button
                  onClick={handleSeedOnly}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Seed Database
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seeding Step */}
      <AnimatePresence>
        {step === 'seeding' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/50"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Database className="w-12 h-12 text-purple-400 mx-auto" />
              </motion.div>
              <h3 className="text-xl font-bold text-white">Seeding Database...</h3>
              {cleared && (
                <p className="text-sm text-slate-400">Cleared existing officers ✓</p>
              )}
              <p className="text-sm text-slate-400">Adding officers to Firestore...</p>
            </div>

            {/* Progress */}
            <div className="mt-6 space-y-2">
              {defaultOfficers.map((officer, i) => (
                <motion.div
                  key={officer.uid}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-slate-300">Adding {officer.name}...</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Step */}
      <AnimatePresence>
        {step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {/* Result Card */}
            <div className={cn(
              'p-6 rounded-2xl border',
              status === 'success'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            )}>
              <div className="text-center space-y-4">
                {status === 'success' ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white">Setup Complete!</h3>
                    <p className="text-slate-400">
                      Successfully added <span className="text-green-400 font-bold">{seedResults.added}</span> officers
                      to your database.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                    <h3 className="text-2xl font-bold text-white">Setup Failed</h3>
                    <p className="text-slate-400">{seedResults.errors[0] || 'An error occurred'}</p>
                  </>
                )}
              </div>
            </div>

            {/* Errors if any */}
            {seedResults.errors.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <h4 className="text-sm font-medium text-white mb-2">Errors:</h4>
                <div className="space-y-1">
                  {seedResults.errors.map((error, i) => (
                    <p key={i} className="text-xs text-red-400">{error}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/officers')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                <Shield className="w-5 h-5" />
                Manage Officers
              </button>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium hover:bg-slate-700 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}