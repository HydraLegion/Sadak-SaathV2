'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Shield, User, Plus, Search, Edit, Trash2, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { collection, query, getDocs, doc, updateDoc, addDoc, serverTimestamp, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User as UserType, UserRole } from '@/lib/types'

const roleConfig: Record<UserRole, { label: string; color: string; permissions: string[] }> = {
  citizen: { label: 'Citizen', color: 'bg-blue-100 text-blue-800', permissions: ['report', 'track_complaints'] },
  inspector: { label: 'Inspector', color: 'bg-green-100 text-green-800', permissions: ['verify', 'update_status'] },
  officer: { label: 'Officer', color: 'bg-purple-100 text-purple-800', permissions: ['assign', 'update_status', 'view_analytics'] },
  admin: { label: 'Admin', color: 'bg-amber-100 text-amber-800', permissions: ['all'] },
  super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-800', permissions: ['all'] },
}

export default function UserManagementPage() {
  const router = useRouter()
  const { hasPermission, isLoading: authLoading } = useAuthStore()
  const isAdmin = hasPermission(['admin', 'super_admin'])
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  const [newUser, setNewUser] = useState({ email: '', displayName: '', phone: '', role: 'citizen' as UserRole })

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard')
    }
  }, [authLoading, isAdmin, router])

  useEffect(() => {
    if (!isAdmin) return

    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserType))
      setUsers(data)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching users:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isAdmin])

  const filteredUsers = users.filter(user => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return user.displayName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(search)
    }
    return true
  })

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setUpdateLoading(true)
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole, updatedAt: serverTimestamp() })
      setShowEditDialog(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
    }
    setUpdateLoading(false)
  }

  const toggleUserActive = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isActive: !currentStatus, updatedAt: serverTimestamp() })
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {(['all', 'citizen', 'inspector', 'officer', 'admin'] as const).map(role => (
                <Button key={role} variant={roleFilter === role ? 'secondary' : 'ghost'} size="sm" onClick={() => setRoleFilter(role)}>
                  {role === 'all' ? 'All' : roleConfig[role].label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => {
                  const role = roleConfig[user.role]
                  return (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{user.displayName || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{user.email || 'No email'}</p>
                          <p className="text-muted-foreground">{user.phone || 'No phone'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('capitalize', role.color)}>{role.label}</Badge>
                      </TableCell>
                      <TableCell>{user.jurisdictionId || <span className="text-muted-foreground">All</span>}</TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'secondary' : 'outline'} className="capitalize">{user.isActive ? 'Active' : 'Inactive'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedUser(user); setShowEditDialog(true) }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => toggleUserActive(user.uid, user.isActive)}>
                            {user.isActive ? <XCircle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-severity-low" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user role and permissions</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium">{selectedUser.displayName || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email || 'No email'}</p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(roleConfig) as [UserRole, typeof roleConfig[UserRole]][]).map(([roleKey, config]) => (
                    <Button key={roleKey} variant={selectedUser.role === roleKey ? 'secondary' : 'outline'} onClick={() => updateUserRole(selectedUser.uid, roleKey)} disabled={updateLoading} className="justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account (manual entry - Firebase Auth will be used for actual registration)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input placeholder="Enter full name" value={newUser.displayName} onChange={(e) => setNewUser(p => ({ ...p, displayName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="user@example.com" value={newUser.email} onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input type="tel" placeholder="+91 XXXX XXXX XX" value={newUser.phone} onChange={(e) => setNewUser(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background" value={newUser.role} onChange={(e) => setNewUser(p => ({ ...p, role: e.target.value as UserRole }))}>
                {Object.entries(roleConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">Note: This creates a placeholder. Actual user registration requires Firebase Auth.</p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!newUser.displayName || !newUser.email) return
              setUpdateLoading(true)
              try {
                await addDoc(collection(db, 'users'), {
                  displayName: newUser.displayName,
                  email: newUser.email,
                  phone: newUser.phone,
                  role: newUser.role,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  isActive: true,
                })
                setShowAddDialog(false)
                setNewUser({ email: '', displayName: '', phone: '', role: 'citizen' })
              } catch (error) {
                console.error('Error adding user:', error)
              }
              setUpdateLoading(false)
            }} disabled={updateLoading || !newUser.displayName || !newUser.email}>
              {updateLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
