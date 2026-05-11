'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import {
  Shield, CheckCircle, XCircle, Clock, Eye, Loader2, Image, MapPin
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'

const mockDetections = [
  { id: 'det-001', mediaUrl: 'https://example.com/img1.jpg', location: { lat: 28.6139, lng: 77.209 }, status: 'pending', confidence: 0.94, potholeCount: 2, createdAt: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 'det-002', mediaUrl: 'https://example.com/img2.jpg', location: { lat: 28.6189, lng: 77.214 }, status: 'pending', confidence: 0.87, potholeCount: 1, createdAt: new Date(Date.now() - 1000 * 60 * 60) },
  { id: 'det-003', mediaUrl: 'https://example.com/img3.jpg', location: { lat: 28.6239, lng: 77.219 }, status: 'approved', confidence: 0.76, potholeCount: 3, createdAt: new Date(Date.now() - 1000 * 60 * 120) },
  { id: 'det-004', mediaUrl: 'https://example.com/img4.jpg', location: { lat: 28.6339, lng: 77.224 }, status: 'rejected', confidence: 0.45, potholeCount: 0, createdAt: new Date(Date.now() - 1000 * 60 * 180) },
]

const statusConfig = {
  pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
}

export default function ModerationPage() {
  const [detections, setDetections] = useState(mockDetections)
  const [loading, setLoading] = useState(false)
  const [selectedDetection, setSelectedDetection] = useState<typeof mockDetections[0] | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending'>('pending')

  const filteredDetections = detections.filter(d => {
    if (statusFilter === 'pending' && d.status !== 'pending') return false
    return true
  })

  const pendingCount = detections.filter(d => d.status === 'pending').length

  const updateStatus = async (detectionId: string, newStatus: 'approved' | 'rejected') => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setDetections(prev => prev.map(d =>
      d.id === detectionId ? { ...d, status: newStatus } : d
    ))
    setLoading(false)
    setShowDetailDialog(false)
  }

  const viewDetail = (detection: typeof mockDetections[0]) => {
    setSelectedDetection(detection)
    setShowDetailDialog(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Moderation Queue</h1>
          <p className="text-muted-foreground">Review and approve AI-detected potholes</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Clock className="h-4 w-4 mr-2" />
          {pendingCount} pending review
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'secondary' : 'ghost'}
              onClick={() => setStatusFilter('all')}
            >
              All ({detections.length})
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'secondary' : 'ghost'}
              onClick={() => setStatusFilter('pending')}
            >
              Pending ({pendingCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detections Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Detection ID</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Potholes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDetections.map(detection => {
                const status = statusConfig[detection.status as keyof typeof statusConfig]
                const StatusIcon = status?.icon || Clock

                return (
                  <TableRow key={detection.id}>
                    <TableCell>
                      <span className="font-mono text-sm">{detection.id}</span>
                    </TableCell>
                    <TableCell>
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {detection.location.lat.toFixed(4)}, {detection.location.lng.toFixed(4)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              detection.confidence > 0.8 ? 'bg-severity-low' :
                              detection.confidence > 0.6 ? 'bg-severity-medium' :
                              'bg-severity-high'
                            )}
                            style={{ width: `${detection.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{(detection.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{detection.potholeCount} found</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('capitalize', status?.color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(detection.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewDetail(detection)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {detection.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatus(detection.id, 'approved')}
                              disabled={loading}
                            >
                              <CheckCircle className="h-4 w-4 text-severity-low" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateStatus(detection.id, 'rejected')}
                              disabled={loading}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detection Details</DialogTitle>
            <DialogDescription>
              Review detection and make approval decision
            </DialogDescription>
          </DialogHeader>
          {selectedDetection && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                <Image className="h-16 w-16 text-muted-foreground" />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Detection ID</p>
                  <p className="font-mono">{selectedDetection.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="font-medium">{(selectedDetection.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{selectedDetection.location.lat.toFixed(6)}, {selectedDetection.location.lng.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Potholes Found</p>
                  <p>{selectedDetection.potholeCount}</p>
                </div>
              </div>

              {/* Actions */}
              {selectedDetection.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => updateStatus(selectedDetection.id, 'approved')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Create Potholes
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateStatus(selectedDetection.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
