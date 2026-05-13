'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { AuthorizedOfficer } from '@/lib/officerAuth'
import { RoleBadge } from '@/components/auth/SecureAccessBadge'
import {
  Shield, Plus, Search, MoreVertical, CheckCircle, XCircle,
  Edit2, Trash2, Phone, Building, MapPin, User, AlertTriangle,
  X, Loader2, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/lib/types'

type Role = 'officer' | 'admin' | 'super_admin' | 'inspector'

const roleOptions: { value: Role; label: string; color: string }[] = [
  { value: 'super_admin', label: 'Super Admin', color: 'text-purple-400' },
  { value: 'admin', label: 'District Admin', color: 'text-blue-400' },
  { value: 'officer', label: 'Officer', color: 'text-green-400' },
  { value: 'inspector', label: 'Inspector', color: 'text-orange-400' },
]

// Demo officers for when Firebase isn't set up
const demoOfficers: (AuthorizedOfficer & { createdAt?: Date; updatedAt?: Date })[] = [
  {
    uid: 'admin_001',
    name: 'Chief Engineer - Chhattisgarh',
    mobile: '9999999999',
    role: 'super_admin',
    district: 'All India',
    department: 'Ministry of Road Transport',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'admin_002',
    name: 'District Administrator - Central',
    mobile: '8888888888',
    role: 'admin',
    district: 'Raipur Central',
    department: 'PWD-CG',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    uid: 'officer_001',
    name: 'Road Inspector - Pandri',
    mobile: '6666666666',
    role: 'officer',
    district: 'Raipur Central',
    department: 'PWD-CG',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

interface OfficerFormData {
  uid: string
  name: string
  mobile: string
  role: Role
  district: string
  department: string
  isActive: boolean
}

export default function ManageOfficersPage() {
  const [officers, setOfficers] = useState<(AuthorizedOfficer & { createdAt?: Date; updatedAt?: Date })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [firebaseError, setFirebaseError] = useState(false)

  useEffect(() => {
    fetchOfficers()
  }, [])

  const fetchOfficers = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, 'authorized_officers'),
        orderBy('name')
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as (AuthorizedOfficer & { createdAt?: Date; updatedAt?: Date })[]
      setOfficers(data)
      setFirebaseError(false)
    } catch (error) {
      console.error('Error fetching officers:', error)
      setFirebaseError(true)
      // Use demo data when Firebase isn't available
      setOfficers(demoOfficers)
    }
    setLoading(false)
  }

  const handleAddOfficer = async (data: OfficerFormData) => {
    try {
      const { setDoc } = await import('firebase/firestore')
      await setDoc(doc(db, 'authorized_officers', data.uid), {
        name: data.name,
        mobile: data.mobile,
        role: data.role,
        district: data.district,
        department: data.department,
        isActive: data.isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      await fetchOfficers()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding officer:', error)
      // For demo, just add locally
      setOfficers([...officers, { ...data, createdAt: new Date(), updatedAt: new Date() }])
      setShowAddModal(false)
    }
  }

  const handleToggleActive = async (uid: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'authorized_officers', uid), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      })
      await fetchOfficers()
    } catch (error) {
      console.error('Error toggling officer:', error)
      // For demo, toggle locally
      setOfficers(officers.map(o =>
        o.uid === uid ? { ...o, isActive: !currentStatus } : o
      ))
    }
  }

  const handleDeleteOfficer = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'authorized_officers', uid))
      await fetchOfficers()
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting officer:', error)
      // For demo, delete locally
      setOfficers(officers.filter(o => o.uid !== uid))
      setShowDeleteConfirm(null)
    }
  }

  const filteredOfficers = officers.filter((officer) =>
    officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.mobile.includes(searchTerm) ||
    officer.district.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Officers</h1>
          <p className="text-sm text-slate-400">Add, edit, or remove authorized government officers</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Officer
        </button>
      </div>

      {/* Firebase Warning */}
      {firebaseError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
          <div>
            <p className="text-sm text-yellow-200 font-medium">Demo Mode</p>
            <p className="text-xs text-yellow-300/80">Firebase not connected. Showing sample data.</p>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, mobile, or district..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Officers', value: officers.length, color: 'text-white' },
          { label: 'Active', value: officers.filter(o => o.isActive).length, color: 'text-green-400' },
          { label: 'Inactive', value: officers.filter(o => !o.isActive).length, color: 'text-red-400' },
          { label: 'Districts', value: new Set(officers.map(o => o.district)).size, color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Officers List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOfficers.map((officer, i) => (
            <motion.div
              key={officer.uid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'p-4 rounded-xl border transition-all',
                officer.isActive
                  ? 'bg-slate-900/50 border-slate-800/50 hover:border-slate-700'
                  : 'bg-slate-900/30 border-slate-800/30 opacity-60'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold',
                  officer.isActive ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700/50 text-slate-500'
                )}>
                  {officer.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white truncate">{officer.name}</h3>
                    <RoleBadge role={officer.role} />
                    {!officer.isActive && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      +91 {officer.mobile}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {officer.district}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {officer.department}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(officer.uid, officer.isActive)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      officer.isActive
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    )}
                    title={officer.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {officer.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(officer.uid)}
                    className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Officer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddOfficerModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddOfficer}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirmModal
            officerName={officers.find(o => o.uid === showDeleteConfirm)?.name || ''}
            onConfirm={() => handleDeleteOfficer(showDeleteConfirm)}
            onCancel={() => setShowDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Add Officer Modal Component
function AddOfficerModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (data: OfficerFormData) => void
}) {
  const [form, setForm] = useState<OfficerFormData>({
    uid: '',
    name: '',
    mobile: '',
    role: 'officer',
    district: '',
    department: '',
    isActive: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Officer</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Officer ID</label>
            <input
              type="text"
              required
              placeholder="e.g., officer_001"
              value={form.uid}
              onChange={(e) => setForm({ ...form, uid: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="Enter full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mobile Number</label>
            <input
              type="tel"
              required
              placeholder="10 digit number without +91"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">District</label>
              <input
                type="text"
                required
                placeholder="e.g., Raipur Central"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
              <input
                type="text"
                required
                placeholder="e.g., PWD-CG"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                form.isActive ? 'bg-green-500' : 'bg-slate-700'
              )}
            >
              <div className={cn(
                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                form.isActive ? 'left-7' : 'left-1'
              )} />
            </button>
            <span className="text-sm text-slate-300">Active Account</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              Add Officer
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Delete Confirmation Modal
function DeleteConfirmModal({
  officerName,
  onConfirm,
  onCancel,
}: {
  officerName: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Delete Officer?</h3>
          <p className="text-sm text-slate-400 mb-6">
            Are you sure you want to remove <span className="text-white font-medium">{officerName}</span> from authorized officers?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}