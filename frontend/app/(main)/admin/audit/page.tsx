'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  FileText, Search, Download, Calendar, User, MapPin, Filter, RefreshCw
} from 'lucide-react'
import { formatRelativeTime, formatSLACountdown } from '@/lib/utils'

const mockAuditLogs = [
  { id: 'log-001', userId: 'demo-admin-001', userRole: 'admin', action: 'update_status', resource: 'complaints', resourceId: 'complaint-0001', changes: { status: { before: 'assigned', after: 'in_progress' } }, createdAt: new Date(Date.now() - 1000 * 60 * 5) },
  { id: 'log-002', userId: 'demo-officer-001', userRole: 'officer', action: 'assign', resource: 'complaints', resourceId: 'complaint-0002', changes: { assignedTo: { before: null, after: 'demo-inspector-001' } }, createdAt: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 'log-003', userId: 'demo-admin-001', userRole: 'admin', action: 'create_user', resource: 'users', resourceId: 'demo-inspector-001', changes: {}, createdAt: new Date(Date.now() - 1000 * 60 * 60) },
  { id: 'log-004', userId: 'demo-officer-001', userRole: 'officer', action: 'update_priority', resource: 'complaints', resourceId: 'complaint-0003', changes: { priority: { before: 'medium', after: 'high' } }, createdAt: new Date(Date.now() - 1000 * 60 * 120) },
  { id: 'log-005', userId: 'demo-citizen-001', userRole: 'citizen', action: 'create_complaint', resource: 'complaints', resourceId: 'complaint-0004', changes: {}, createdAt: new Date(Date.now() - 1000 * 60 * 180) },
]

const actionLabels: Record<string, string> = {
  create_complaint: 'Created complaint',
  update_status: 'Updated status',
  assign: 'Assigned officer',
  update_priority: 'Changed priority',
  create_user: 'Created user',
  delete_user: 'Deleted user',
  approve_detection: 'Approved detection',
  reject_detection: 'Rejected detection',
  login: 'User login',
  logout: 'User logout',
}

export default function AuditLogPage() {
  const [logs] = useState(mockAuditLogs)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string | 'all'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all')
  const [selectedLog, setSelectedLog] = useState<typeof mockAuditLogs[0] | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  const filteredLogs = logs.filter(log => {
    if (search) {
      const searchLower = search.toLowerCase()
      if (!log.userId.toLowerCase().includes(searchLower) && !log.resourceId.toLowerCase().includes(searchLower)) {
        return false
      }
    }
    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false
    }
    if (dateFilter === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (log.createdAt < today) return false
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      if (log.createdAt < weekAgo) return false
    }
    return true
  })

  const uniqueActions = [...new Set(logs.map(l => l.action))]

  const viewDetail = (log: typeof mockAuditLogs[0]) => {
    setSelectedLog(log)
    setShowDetailDialog(true)
  }

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Resource ID'].join(','),
      ...filteredLogs.map(log => [
        log.createdAt.toISOString(),
        log.userId,
        log.userRole,
        log.action,
        log.resource,
        log.resourceId,
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">Track all system activities and changes</p>
        </div>
        <Button variant="outline" onClick={exportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user or resource ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                className="h-10 px-3 rounded-md border border-input bg-background"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {actionLabels[action] || action}
                  </option>
                ))}
              </select>
              <select
                className="h-10 px-3 rounded-md border border-input bg-background"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map(log => (
                <TableRow
                  key={log.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => viewDetail(log)}
                >
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatRelativeTime(log.createdAt)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{log.userId}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {log.userRole}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {actionLabels[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{log.resourceId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {Object.keys(log.changes).length > 0 ? (
                      <span className="text-sm text-muted-foreground">
                        {Object.keys(log.changes).length} changes
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>Complete details of the activity</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">{selectedLog.createdAt.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Action</p>
                  <p className="font-medium capitalize">
                    {actionLabels[selectedLog.action] || selectedLog.action}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{selectedLog.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{selectedLog.userRole}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Changes</p>
                {Object.keys(selectedLog.changes).length > 0 ? (
                  <div className="p-3 rounded-lg bg-muted space-y-2">
                    {Object.entries(selectedLog.changes).map(([key, change]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span className="font-medium capitalize">{key}:</span>
                        <span className="line-through text-destructive">{JSON.stringify((change as any).before)}</span>
                        <span>→</span>
                        <span className="text-severity-low">{JSON.stringify((change as any).after)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No changes recorded</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Resource</p>
                <p className="font-mono">{selectedLog.resource}/{selectedLog.resourceId}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
