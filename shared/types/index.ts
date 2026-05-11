// ========================================
// Sadak Saathi — Shared Type Definitions
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
  boundingBoxes: BoundingBox[]
  processedAt: Date
  processedBy: 'ai' | 'manual'
  location: GeoPoint
  metadata: Record<string, unknown>
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  class: string
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
  type: 'state' | 'district' | 'municipal' | 'zone' | 'ward'
  bounds: GeoPoint[]
  center: GeoPoint
  parentId: string | null
  departmentId: string | null
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

export interface MediaAsset {
  id: string
  url: string
  type: MediaType
  bucket: string
  path: string
  size: number
  width: number
  height: number
  duration: number | null
  thumbnailUrl: string | null
  uploadedBy: string
  detectionId: string | null
  potholeId: string | null
  complaintId: string | null
  createdAt: Date
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

export interface AuditLog {
  id: string
  userId: string
  userRole: UserRole
  action: string
  resource: string
  resourceId: string
  changes: Record<string, { before: unknown; after: unknown }>
  ip: string
  userAgent: string
  createdAt: Date
}

export interface ModerationDecision {
  id: string
  detectionId: string
  decision: 'approve' | 'reject' | 'needs_review'
  reason: string
  confidence: number
  moderatedBy: string
  moderatedAt: Date
  notes: string
}

export interface RepairUpdate {
  id: string
  potholeId: string
  complaintId: string | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed'
  description: string
  mediaUrls: string[]
  scheduledDate: Date | null
  completedAt: Date | null
  completedBy: string
  verifiedBy: string | null
  verifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface AnalyticsCache {
  id: string
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  jurisdictionId: string | null
  periodStart: Date
  periodEnd: Date
  metrics: AnalyticsMetrics
  computedAt: Date
}

export interface AnalyticsMetrics {
  totalDetections: number
  verifiedPotholes: number
  resolvedPotholes: number
  avgResolutionTime: number
  severityBreakdown: Record<PotholeSeverity, number>
  byJurisdiction: Record<string, number>
  trend: number[]
}

export interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
}

export interface MapViewport {
  center: GeoPoint
  zoom: number
  bounds: GeoPoint[]
}

// API Response Types
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

// Form Types
export interface ReportPotholeForm {
  media: File[]
  location: GeoPoint | null
  address: string
  description: string
  severity: PotholeSeverity | null
}

export interface LoginForm {
  phone: string
  otp: string
}

export interface ComplaintForm {
  potholeId: string
  title: string
  description: string
  priority: PotholeSeverity
}
