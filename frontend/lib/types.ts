// ========================================
// Sadak Saathi — TypeScript Types
// ========================================

export type UserRole = 'citizen' | 'inspector' | 'officer' | 'admin' | 'super_admin'

export type PotholeStatus = 'pending' | 'verified' | 'in_progress' | 'resolved' | 'rejected'

export type PotholeSeverity = 'critical' | 'high' | 'medium' | 'low'

export type ComplaintStatus = 'submitted' | 'acknowledged' | 'assigned' | 'in_progress' | 'resolved' | 'escalated' | 'closed'

export type MediaType = 'image' | 'video'

export interface GeoPoint {
  lat: number
  lng: number
}

export interface User {
  uid: string
  email: string
  phone: string
  displayName: string
  role: UserRole
  jurisdictionId: string | null
  departmentId: string | null
  photoUrl: string | null
  language: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date
  isActive: boolean
}

export interface Pothole {
  id: string
  lat: number
  lng: number
  severity: PotholeSeverity
  confidence: number
  status: PotholeStatus
  jurisdictionId: string
  departmentId: string | null
  mediaUrls: string[]
  thumbnailUrl: string | null
  description: string
  address: string
  detectedAt: Date
  verifiedAt: Date | null
  verifiedBy: string | null
  resolvedAt: Date | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Detection {
  id: string
  mediaUrl: string
  mediaType: MediaType
  thumbnailUrl: string | null
  potholeIds: string[]
  frameCount: number
  confidence: number
  severityScores: Record<PotholeSeverity, number>
  processedAt: Date
  processedBy: 'ai' | 'manual'
  location: GeoPoint
}

export interface Complaint {
  id: string
  potholeId: string
  userId: string
  status: ComplaintStatus
  priority: PotholeSeverity
  assignedTo: string | null
  jurisdictionId: string
  departmentId: string | null
  referenceNumber: string
  title: string
  description: string
  mediaUrls: string[]
  slaDeadline: Date | null
  slaBreached: boolean
  escalatedAt: Date | null
  resolvedAt: Date | null
  closedAt: Date | null
  timeline: ComplaintTimelineEntry[]
  createdAt: Date
  updatedAt: Date
}

export interface ComplaintTimelineEntry {
  id: string
  action: string
  description: string
  performedBy: string
  performedAt: Date
  newStatus?: ComplaintStatus
}

export interface Jurisdiction {
  id: string
  name: string
  code: string
  type: 'state' | 'district' | 'municipal' | 'zone' | 'ward'
  bounds: GeoPoint[]
  center: GeoPoint
  parentId: string | null
  departmentId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Department {
  id: string
  name: string
  code: string
  jurisdictionId: string
  contactEmail: string
  contactPhone: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: 'complaint_update' | 'new_detection' | 'assignment' | 'sla_alert' | 'system'
  title: string
  body: string
  data: Record<string, unknown>
  read: boolean
  clickAction: string
  createdAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: ApiError | null
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface UploadProgress {
  bytesTransferred: number
  totalBytes: number
  progress: number
}
