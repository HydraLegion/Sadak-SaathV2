'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, collection, getDocs, query, where, orderBy, serverTimestamp, updateDoc, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  AlertTriangle, CheckCircle, Clock, MapPin, User, FileText,
  MessageSquare, Send, ArrowLeft, Calendar, ChevronRight, Loader2
} from 'lucide-react'
import { cn, formatRelativeTime, formatSLACountdown, getSeverityVariant } from '@/lib/utils'
import type { Complaint, ComplaintStatus, PotholeSeverity, ComplaintTimelineEntry, Pothole } from '@/lib/types'

const statusConfig: Record<ComplaintStatus, { label: string; color: string; icon: React.ElementType; nextActions: string[] }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800', icon: AlertTriangle, nextActions: ['Acknowledge', 'Assign', 'Reject'] },
  acknowledged: { label: 'Acknowledged', color: 'bg-purple-100 text-purple-800', icon: CheckCircle, nextActions: ['Assign', 'Request Info'] },
  assigned: { label: 'Assigned', color: 'bg-amber-100 text-amber-800', icon: User, nextActions: ['Start Work', 'Reassign', 'Request Info'] },
  in_progress: { label: 'In Progress', color: 'bg-orange-100 text-orange-800', icon: Clock, nextActions: ['Mark Resolved', 'Escalate'] },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle, nextActions: ['Verify Repair', 'Reopen'] },
  escalated: { label: 'Escalated', color: 'bg-red-100 text-red-800', icon: AlertTriangle, nextActions: ['Take Action', 'Close'] },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle, nextActions: [] },
}

export default function ComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, hasPermission } = useAuthStore()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [pothole, setPothole] = useState<Pothole | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [comment, setComment] = useState('')
  const [showCommentInput, setShowCommentInput] = useState(false)

  const complaintId = params.id as string
  const canUpdateStatus = hasPermission(['officer', 'admin'])

  // Load complaint
  useEffect(() => {
    if (!complaintId) return

    const loadComplaint = async () => {
      try {
        const docRef = doc(db, 'complaints', complaintId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setComplaint({ id: docSnap.id, ...data } as Complaint)

          // Load associated pothole
          if (data.potholeId) {
            const potholeSnap = await getDoc(doc(db, 'potholes', data.potholeId))
            if (potholeSnap.exists()) {
              setPothole({ id: potholeSnap.id, ...potholeSnap.data() })
            }
          }
        }
      } catch (error) {
        console.error('Failed to load complaint:', error)
      } finally {
        setLoading(false)
      }
    }

    loadComplaint()
  }, [complaintId])

  const updateStatus = async (newStatus: ComplaintStatus, actionComment?: string) => {
    if (!complaint || !user) return

    setUpdating(true)

    try {
      const timelineEntry: ComplaintTimelineEntry = {
        id: `tl-${Date.now()}`,
        action: 'status_change',
        description: `Status changed to ${statusConfig[newStatus].label}`,
        performedBy: user.uid,
        performedAt: new Date(),
        newStatus,
      }

      const updateData: Record<string, any> = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        timeline: [...(complaint.timeline || []), timelineEntry],
      }

      if (newStatus === 'resolved') {
        updateData.resolvedAt = serverTimestamp()
      }

      if (actionComment) {
        updateData.timeline = [
          ...updateData.timeline,
          {
            id: `tl-comment-${Date.now()}`,
            action: 'comment',
            description: actionComment,
            performedBy: user.uid,
            performedAt: new Date(),
          },
        ]
      }

      await updateDoc(doc(db, 'complaints', complaintId), updateData)

      setComplaint(prev => prev ? { ...prev, ...updateData } : null)
      setShowCommentInput(false)
      setComment('')
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const assignOfficer = async (officerId: string) => {
    if (!complaint || !user) return

    setUpdating(true)

    try {
      const timelineEntry: ComplaintTimelineEntry = {
        id: `tl-${Date.now()}`,
        action: 'assigned',
        description: `Assigned to officer ${officerId}`,
        performedBy: user.uid,
        performedAt: new Date(),
      }

      await updateDoc(doc(db, 'complaints', complaintId), {
        assignedTo: officerId,
        status: 'assigned',
        updatedAt: serverTimestamp(),
        timeline: [...(complaint.timeline || []), timelineEntry],
      })

      setComplaint(prev => prev ? { ...prev, assignedTo: officerId, status: 'assigned' } : null)
    } catch (error) {
      console.error('Failed to assign officer:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Complaint not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const status = statusConfig[complaint.status]
  const StatusIcon = status.icon

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{complaint.referenceNumber}</h1>
          <p className="text-muted-foreground">Filed on {formatRelativeTime(complaint.createdAt)}</p>
        </div>
        <Badge className={cn('text-sm px-3 py-1', status.color)}>
          <StatusIcon className="h-4 w-4 mr-1" />
          {status.label}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Details */}
          <Card>
            <CardHeader>
              <CardTitle>{complaint.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{complaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <div className="mt-1">
                    <Badge variant={getSeverityVariant(complaint.priority)} className="capitalize">
                      {complaint.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">SLA Deadline</Label>
                  <p className="mt-1 font-medium">
                    {complaint.slaDeadline ? (
                      <span className={complaint.slaBreached ? 'text-destructive' : ''}>
                        {formatSLACountdown(complaint.slaDeadline)}
                      </span>
                    ) : (
                      'Not set'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {pothole && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{pothole.address}</p>
                <p className="text-sm text-muted-foreground">
                  {pothole.lat?.toFixed(6)}, {pothole.lng?.toFixed(6)}
                </p>
                <div className="mt-4 h-48 rounded-lg bg-muted flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Map preview</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Complaint Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(complaint.timeline || []).map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      {index < (complaint.timeline?.length || 0) - 1 && (
                        <div className="w-px h-full bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{entry.action.replace('_', ' ')}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(entry.performedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              {canUpdateStatus && (
                <div className="mt-6 pt-6 border-t">
                  {showCommentInput ? (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => {
                          if (comment.trim()) {
                            const timelineEntry: ComplaintTimelineEntry = {
                              id: `tl-${Date.now()}`,
                              action: 'comment',
                              description: comment,
                              performedBy: user?.uid || '',
                              performedAt: new Date(),
                            }
                            setComplaint(prev => prev ? {
                              ...prev,
                              timeline: [...(prev.timeline || []), timelineEntry]
                            } : null)
                            setComment('')
                            setShowCommentInput(false)
                          }
                        }}>
                          <Send className="h-4 w-4 mr-2" />
                          Add Comment
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowCommentInput(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => setShowCommentInput(true)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {canUpdateStatus && status.nextActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {status.nextActions.map((action) => {
                  let targetStatus: ComplaintStatus | null = null
                  if (action === 'Acknowledge') targetStatus = 'acknowledged'
                  else if (action === 'Assign') targetStatus = 'assigned'
                  else if (action === 'Start Work') targetStatus = 'in_progress'
                  else if (action === 'Mark Resolved') targetStatus = 'resolved'
                  else if (action === 'Escalate') targetStatus = 'escalated'
                  else if (action === 'Reopen') targetStatus = 'in_progress'
                  else if (action === 'Take Action') targetStatus = 'in_progress'
                  else if (action === 'Close') targetStatus = 'closed'

                  return (
                    <Button
                      key={action}
                      variant={action === 'Escalate' ? 'destructive' : 'outline'}
                      className="w-full justify-between"
                      onClick={() => targetStatus && updateStatus(targetStatus)}
                      disabled={updating}
                    >
                      {action}
                      {targetStatus && <ChevronRight className="h-4 w-4" />}
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Complaint Info */}
          <Card>
            <CardHeader>
              <CardTitle>Complaint Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Complaint ID</span>
                <span className="font-mono">{complaint.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Filed By</span>
                <span>{complaint.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jurisdiction</span>
                <span>{complaint.jurisdictionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span>{complaint.departmentId || 'Not assigned'}</span>
              </div>
              {complaint.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned To</span>
                  <span>{complaint.assignedTo}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatRelativeTime(complaint.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{formatRelativeTime(complaint.updatedAt)}</span>
              </div>
              {complaint.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolved</span>
                  <span>{formatRelativeTime(complaint.resolvedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">SLA Status</span>
                <Badge variant={complaint.slaBreached ? 'destructive' : 'secondary'}>
                  {complaint.slaBreached ? 'Breached' : 'On Track'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
