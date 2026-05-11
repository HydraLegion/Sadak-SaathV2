'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import {
  Plus, Edit, Trash2, MapPin, Building, CheckCircle, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const mockJurisdictions = [
  { code: 'DL-Central', name: 'Central Delhi', type: 'zone', parentId: 'delhi', departmentId: 'PWD-DL', potholeCount: 45, isActive: true },
  { code: 'DL-North', name: 'North Delhi', type: 'zone', parentId: 'delhi', departmentId: 'PWD-DL', potholeCount: 38, isActive: true },
  { code: 'DL-South', name: 'South Delhi', type: 'zone', parentId: 'delhi', departmentId: 'PWD-DL', potholeCount: 52, isActive: true },
  { code: 'DL-East', name: 'East Delhi', type: 'zone', parentId: 'delhi', departmentId: 'PWD-DL', potholeCount: 28, isActive: true },
  { code: 'DL-West', name: 'West Delhi', type: 'zone', parentId: 'delhi', departmentId: 'PWD-DL', potholeCount: 41, isActive: true },
]

export default function JurisdictionsPage() {
  const [jurisdictions, setJurisdictions] = useState(mockJurisdictions)
  const [loading, setLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingJurisdiction, setEditingJurisdiction] = useState<typeof mockJurisdictions[0] | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'zone',
    parentId: 'delhi',
    departmentId: 'PWD-DL',
  })

  const saveJurisdiction = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    if (editingJurisdiction) {
      setJurisdictions(prev => prev.map(j =>
        j.code === editingJurisdiction.code ? { ...j, ...formData } : j
      ))
    } else {
      setJurisdictions(prev => [...prev, { ...formData, potholeCount: 0, isActive: true }])
    }

    setLoading(false)
    setShowAddDialog(false)
    setEditingJurisdiction(null)
    setFormData({ name: '', code: '', type: 'zone', parentId: 'delhi', departmentId: 'PWD-DL' })
  }

  const toggleActive = async (code: string) => {
    setJurisdictions(prev => prev.map(j =>
      j.code === code ? { ...j, isActive: !j.isActive } : j
    ))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jurisdictions</h1>
          <p className="text-muted-foreground">Manage geographic zones and administrative boundaries</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Jurisdiction
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{jurisdictions.length}</p>
            <p className="text-sm text-muted-foreground">Total Zones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{jurisdictions.filter(j => j.isActive).length}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{jurisdictions.reduce((sum, j) => sum + j.potholeCount, 0)}</p>
            <p className="text-sm text-muted-foreground">Total Potholes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">
              {(jurisdictions.reduce((sum, j) => sum + j.potholeCount, 0) / jurisdictions.length).toFixed(0)}
            </p>
            <p className="text-sm text-muted-foreground">Avg per Zone</p>
          </CardContent>
        </Card>
      </div>

      {/* Jurisdictions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {jurisdictions.map(jur => (
              <div
                key={jur.code}
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  jur.isActive ? 'bg-card' : 'bg-muted/50 opacity-60'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{jur.name}</p>
                      <p className="text-sm text-muted-foreground">{jur.code}</p>
                    </div>
                  </div>
                  <Badge variant={jur.isActive ? 'secondary' : 'outline'}>
                    {jur.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{jur.departmentId}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{jur.potholeCount}</p>
                    <p className="text-xs text-muted-foreground">Potholes</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingJurisdiction(jur)
                        setFormData({
                          name: jur.name,
                          code: jur.code,
                          type: jur.type,
                          parentId: jur.parentId,
                          departmentId: jur.departmentId,
                        })
                        setShowAddDialog(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(jur.code)}
                    >
                      {jur.isActive ? (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-severity-low" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open)
        if (!open) {
          setEditingJurisdiction(null)
          setFormData({ name: '', code: '', type: 'zone', parentId: 'delhi', departmentId: 'PWD-DL' })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingJurisdiction ? 'Edit Jurisdiction' : 'Add Jurisdiction'}
            </DialogTitle>
            <DialogDescription>
              {editingJurisdiction ? 'Update jurisdiction details' : 'Create a new geographic zone'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Central Delhi"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                placeholder="DL-Central"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="zone">Zone</option>
                <option value="ward">Ward</option>
                <option value="municipal">Municipal</option>
                <option value="district">District</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.departmentId}
                onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
              >
                <option value="PWD-DL">PWD Delhi</option>
                <option value="MCD-DL">MCD Delhi</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveJurisdiction} disabled={loading || !formData.name || !formData.code}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingJurisdiction ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
