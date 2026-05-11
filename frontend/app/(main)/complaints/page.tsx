'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn, formatRelativeTime, formatSLACountdown } from '@/lib/utils'
import { getSeverityVariant, getStatusVariant } from '@/components/ui/badge'
import { Search, Filter, MoreVertical, Eye, CheckCircle, Clock, AlertTriangle, MapPin, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { collection, query, orderBy, where, getDocs, onSnapshot, getCountFromServer } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth'
import type { Complaint, ComplaintStatus, PotholeSeverity } from '@/lib/types'

const statusConfig: Record<ComplaintStatus, { label: string; color: string; icon: React.ElementType }> = {
  submitted: { label: 'Submitted', color: 'text-blue-600 bg-blue-50', icon: AlertTriangle },
  acknowledged: { label: 'Acknowledged', color: 'text-purple-600 bg-purple-50', icon: Eye },
  assigned: { label: 'Assigned', color: 'text-amber-600 bg-amber-50', icon: MapPin },
  in_progress: { label: 'In Progress', color: 'text-orange-600 bg-orange-50', icon: Clock },
  resolved: { label: 'Resolved', color: 'text-green-600 bg-green-50', icon: CheckCircle },
  escalated: { label: 'Escalated', color: 'text-red-600 bg-red-50', icon: AlertTriangle },
  closed: { label: 'Closed', color: 'text-gray-600 bg-gray-50', icon: CheckCircle },
}

export default function ComplaintsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, role } = useAuthStore()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated) return

    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint))
      setComplaints(data)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching complaints:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isAuthenticated])

  const filteredComplaints = complaints.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      const matchesRef = c.referenceNumber?.toLowerCase().includes(searchLower)
      const matchesTitle = c.title?.toLowerCase().includes(searchLower)
      if (!matchesRef && !matchesTitle) return false
    }
    return true
  })

  const paginatedComplaints = filteredComplaints.slice((page - 1) * pageSize, page * pageSize)

  const statusCounts = {
    all: complaints.length,
    submitted: complaints.filter(c => c.status === 'submitted').length,
    acknowledged: complaints.filter(c => c.status === 'acknowledged').length,
    assigned: complaints.filter(c => c.status === 'assigned').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    escalated: complaints.filter(c => c.status === 'escalated').length,
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Complaints</h1>
          <p className="text-muted-foreground">Track and manage filed complaints</p>
        </div>
        <Button asChild>
          <Link href="/report">
            <AlertTriangle className="h-4 w-4 mr-2" />
            New Complaint
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by reference number or title..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Status</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                  {Object.keys(statusConfig).filter(s => s !== 'closed').map((status) => (
                    <DropdownMenuItem key={status} onClick={() => setStatusFilter(status as ComplaintStatus)}>
                      {statusConfig[status as ComplaintStatus].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); setPage(1); }}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="all">
            All <Badge variant="secondary" className="ml-2">{statusCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted <Badge variant="secondary" className="ml-2">{statusCounts.submitted}</Badge>
          </TabsTrigger>
          <TabsTrigger value="acknowledged">
            Ack <Badge variant="secondary" className="ml-2">{statusCounts.acknowledged}</Badge>
          </TabsTrigger>
          <TabsTrigger value="assigned">
            Assigned <Badge variant="secondary" className="ml-2">{statusCounts.assigned}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="hidden sm:block">
            In Progress <Badge variant="secondary" className="ml-2">{statusCounts.in_progress}</Badge>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="hidden md:block">
            Resolved <Badge variant="secondary" className="ml-2">{statusCounts.resolved}</Badge>
          </TabsTrigger>
          <TabsTrigger value="escalated">
            Escalated <Badge variant="destructive" className="ml-2">{statusCounts.escalated}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>SLA</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No complaints found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedComplaints.map((complaint) => {
                      const status = statusConfig[complaint.status as ComplaintStatus]
                      const StatusIcon = status?.icon || AlertTriangle
                      return (
                        <TableRow key={complaint.id}>
                          <TableCell>
                            <Link href={`/complaints/${complaint.id}`} className="font-mono text-sm hover:underline">
                              {complaint.referenceNumber || complaint.id.slice(0, 8).toUpperCase()}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium max-w-[200px] truncate">{complaint.title || 'Untitled'}</p>
                            <p className="text-xs text-muted-foreground truncate">{complaint.jurisdictionId}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getSeverityVariant(complaint.priority)} className="capitalize">{complaint.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('capitalize', status?.color)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status?.label || complaint.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={cn('text-sm', complaint.slaBreached && 'text-destructive font-medium')}>
                              {complaint.slaDeadline ? formatSLACountdown(complaint.slaDeadline) : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{complaint.assignedTo || <span className="text-muted-foreground">Unassigned</span>}</span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild><Link href={`/complaints/${complaint.id}`}>View Details</Link></DropdownMenuItem>
                                <DropdownMenuItem>Update Status</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">Showing {paginatedComplaints.length} of {filteredComplaints.length} complaints</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 py-2 text-sm">{page}</span>
                  <Button variant="outline" size="sm" disabled={paginatedComplaints.length < pageSize} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
