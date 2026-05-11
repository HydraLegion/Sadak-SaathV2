import { z } from 'zod'

// ========================================
// Sadak Saathi — Validation Schemas
// ========================================

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format')

export const emailSchema = z.string().email('Invalid email format')

export const userRoleSchema = z.enum(['citizen', 'inspector', 'officer', 'admin', 'super_admin'])

export const potholeSeveritySchema = z.enum(['critical', 'high', 'medium', 'low'])

export const potholeStatusSchema = z.enum(['pending', 'verified', 'in_progress', 'resolved', 'rejected'])

export const complaintStatusSchema = z.enum([
  'submitted', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'escalated', 'closed'
])

export const mediaTypeSchema = z.enum(['image', 'video'])

// User Schemas
export const createUserSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema,
  displayName: z.string().min(2).max(100),
  role: userRoleSchema.default('citizen'),
  jurisdictionId: z.string().optional(),
  departmentId: z.string().optional(),
  language: z.string().default('en'),
})

export const updateUserSchema = createUserSchema.partial()

// Authentication Schemas
export const sendOtpSchema = z.object({
  phone: phoneSchema,
  purpose: z.enum(['login', 'register', 'reset_password']).default('login'),
})

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).regex(/[A-Z]/, 'Password must contain uppercase')
    .regex(/[a-z]/, 'Password must contain lowercase')
    .regex(/[0-9]/, 'Password must contain number'),
  displayName: z.string().min(2).max(100),
  phone: phoneSchema,
})

// Pothole Schemas
export const createPotholeSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  severity: potholeSeveritySchema,
  jurisdictionId: z.string(),
  mediaUrls: z.array(z.string().url()).max(5).optional(),
  thumbnailUrl: z.string().url().optional(),
  description: z.string().max(500).optional(),
  address: z.string().max(500),
})

export const updatePotholeSchema = createPotholeSchema.partial().extend({
  id: z.string(),
  status: potholeStatusSchema.optional(),
})

// Detection Schemas
export const createDetectionSchema = z.object({
  mediaUrl: z.string().url(),
  mediaType: mediaTypeSchema,
  location: geoPointSchema,
  metadata: z.record(z.unknown()).optional(),
})

export const boundingBoxSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().positive(),
  height: z.number().positive(),
  confidence: z.number().min(0).max(1),
  class: z.string(),
})

export const detectionResultSchema = z.object({
  id: z.string(),
  mediaUrl: z.string().url(),
  potholeIds: z.array(z.string()),
  frameCount: z.number().int().positive(),
  confidence: z.number().min(0).max(1),
  severityScores: z.record(potholeSeveritySchema, z.number().min(0).max(1)),
  boundingBoxes: z.array(boundingBoxSchema),
  location: geoPointSchema,
})

// Complaint Schemas
export const createComplaintSchema = z.object({
  potholeId: z.string(),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  priority: potholeSeveritySchema.default('medium'),
  mediaUrls: z.array(z.string().url()).max(5).optional(),
})

export const updateComplaintSchema = z.object({
  id: z.string(),
  status: complaintStatusSchema.optional(),
  assignedTo: z.string().optional().nullable(),
  priority: potholeSeveritySchema.optional(),
  description: z.string().min(10).max(2000).optional(),
})

export const assignComplaintSchema = z.object({
  complaintId: z.string(),
  assignedTo: z.string(),
  notes: z.string().max(500).optional(),
})

// Jurisdiction Schemas
export const jurisdictionSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(['state', 'district', 'municipal', 'zone', 'ward']),
  bounds: z.array(geoPointSchema).min(3),
  center: geoPointSchema,
  parentId: z.string().optional(),
  departmentId: z.string().optional(),
})

export const departmentSchema = z.object({
  name: z.string().min(2).max(200),
  code: z.string().min(2).max(20),
  jurisdictionId: z.string(),
  contactEmail: emailSchema,
  contactPhone: phoneSchema,
  isActive: z.boolean().default(true),
})

// Upload Schemas
export const uploadMetadataSchema = z.object({
  type: mediaTypeSchema,
  detectionId: z.string().optional(),
  potholeId: z.string().optional(),
  complaintId: z.string().optional(),
  description: z.string().max(200).optional(),
})

// Filter Schemas
export const potholeFiltersSchema = z.object({
  status: potholeStatusSchema.optional(),
  severity: potholeSeveritySchema.optional(),
  jurisdictionId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'severity', 'confidence']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const complaintFiltersSchema = potholeFiltersSchema.omit({
  severity: true, sortBy: true
}).extend({
  priority: potholeSeveritySchema.optional(),
  assignedTo: z.string().optional(),
  sortBy: z.enum(['createdAt', 'priority', 'slaDeadline']).default('createdAt'),
})

// Analytics Schemas
export const analyticsQuerySchema = z.object({
  jurisdictionId: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
})

// Moderation Schemas
export const moderationDecisionSchema = z.object({
  detectionId: z.string(),
  decision: z.enum(['approve', 'reject', 'needs_review']),
  reason: z.string().min(10).max(500),
  notes: z.string().max(1000).optional(),
})

// Notification Schemas
export const notificationPreferencesSchema = z.object({
  complaintUpdates: z.boolean().default(true),
  newDetections: z.boolean().default(true),
  assignments: z.boolean().default(true),
  slaAlerts: z.boolean().default(true),
  marketing: z.boolean().default(false),
})

// Repair Update Schemas
export const repairUpdateSchema = z.object({
  potholeId: z.string(),
  complaintId: z.string().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'failed']),
  description: z.string().min(10).max(1000),
  mediaUrls: z.array(z.string().url()).max(5).optional(),
  scheduledDate: z.coerce.date().optional(),
})
