/**
 * Sadak Saathi — Firestore Collection Setup
 *
 * Run this in browser console or as a Next.js API route
 * to initialize Firestore with collections and sample data.
 */

import { getApps, initializeApp } from 'firebase/app'
import {
  getFirestore, collection, doc, setDoc, serverTimestamp, addDoc
} from 'firebase/firestore'

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Avoid duplicate app initialization
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
const db = getFirestore(app)

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  POTHOLES: 'potholes',
  DETECTIONS: 'detections',
  COMPLAINTS: 'complaints',
  JURISDICTIONS: 'jurisdictions',
  DEPARTMENTS: 'departments',
  MEDIA_ASSETS: 'media_assets',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
  MODERATION_DECISIONS: 'moderation_decisions',
  REPAIR_UPDATES: 'repair_updates',
  ANALYTICS_CACHE: 'analytics_cache',
}

// Sample jurisdictions data
const sampleJurisdictions = [
  {
    name: 'Central Raipur',
    code: 'CG-Central',
    type: 'zone',
    center: { lat: 21.2514, lng: 81.6296 },
    bounds: [
      { lat: 21.24, lng: 81.62 },
      { lat: 21.26, lng: 81.64 },
      { lat: 21.27, lng: 81.63 },
      { lat: 21.25, lng: 81.61 },
    ],
    parentId: 'chhattisgarh',
    departmentId: 'PWD-CG',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'North Raipur',
    code: 'CG-North',
    type: 'zone',
    center: { lat: 21.2800, lng: 81.6200 },
    bounds: [
      { lat: 21.27, lng: 81.61 },
      { lat: 21.29, lng: 81.63 },
      { lat: 21.30, lng: 81.62 },
      { lat: 21.28, lng: 81.60 },
    ],
    parentId: 'chhattisgarh',
    departmentId: 'PWD-CG',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'South Raipur',
    code: 'CG-South',
    type: 'zone',
    center: { lat: 21.2200, lng: 81.6400 },
    bounds: [
      { lat: 21.21, lng: 81.63 },
      { lat: 21.23, lng: 81.65 },
      { lat: 21.24, lng: 81.64 },
      { lat: 21.22, lng: 81.62 },
    ],
    parentId: 'chhattisgarh',
    departmentId: 'PWD-CG',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
]

// Sample departments
const sampleDepartments = [
  {
    name: 'Public Works Department',
    code: 'PWD-CG',
    jurisdictionId: 'chhattisgarh',
    contactEmail: 'pwd-cg@gov.in',
    contactPhone: '+91-771-2225678',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
]

// Sample potholes
const samplePotholes = [
  {
    lat: 21.2514,
    lng: 81.6296,
    severity: 'critical',
    confidence: 0.94,
    status: 'pending',
    jurisdictionId: 'CG-Central',
    departmentId: 'PWD-CG',
    address: 'MG Road, Raipur',
    description: 'Large pothole causing traffic disruption',
    mediaUrls: [],
    thumbnailUrl: null,
    detectedAt: new Date(Date.now() - 1000 * 60 * 15),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    lat: 21.2564,
    lng: 81.6346,
    severity: 'high',
    confidence: 0.87,
    status: 'verified',
    jurisdictionId: 'CG-Central',
    departmentId: 'PWD-CG',
    address: 'GE Road',
    description: 'Multiple potholes near railway station',
    mediaUrls: [],
    thumbnailUrl: null,
    detectedAt: new Date(Date.now() - 1000 * 60 * 45),
    verifiedAt: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    lat: 21.2539,
    lng: 81.6190,
    severity: 'medium',
    confidence: 0.76,
    status: 'in_progress',
    jurisdictionId: 'CG-Central',
    departmentId: 'PWD-CG',
    address: 'Shankar Nagar Road',
    description: 'Road damage reported by citizen',
    mediaUrls: [],
    thumbnailUrl: null,
    detectedAt: new Date(Date.now() - 1000 * 60 * 120),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    lat: 21.2639,
    lng: 81.6240,
    severity: 'low',
    confidence: 0.68,
    status: 'resolved',
    jurisdictionId: 'CG-Central',
    departmentId: 'PWD-CG',
    address: 'Pandri Road',
    description: 'Minor road damage, recently repaired',
    mediaUrls: [],
    thumbnailUrl: null,
    detectedAt: new Date(Date.now() - 1000 * 60 * 180),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    lat: 21.2589,
    lng: 81.6040,
    severity: 'critical',
    confidence: 0.92,
    status: 'pending',
    jurisdictionId: 'CG-Central',
    departmentId: 'PWD-CG',
    address: 'Telibandha Road',
    description: 'Deep pothole near commercial area',
    mediaUrls: [],
    thumbnailUrl: null,
    detectedAt: new Date(Date.now() - 1000 * 60 * 60),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
]

// Setup function
export async function initializeCollections() {
  const results = {
    success: true,
    created: [] as string[],
    errors: [] as { collection: string; error: string }[],
  }

  // Create jurisdictions
  console.log('📍 Creating jurisdictions...')
  for (const data of sampleJurisdictions) {
    try {
      await setDoc(doc(db, COLLECTIONS.JURISDICTIONS, data.code), data)
      results.created.push(`jurisdictions/${data.code}`)
      console.log(`   ✓ ${data.code}`)
    } catch (error) {
      results.errors.push({ collection: 'jurisdictions', error: String(error) })
    }
  }

  // Create departments
  console.log('🏢 Creating departments...')
  for (const data of sampleDepartments) {
    try {
      await setDoc(doc(db, COLLECTIONS.DEPARTMENTS, data.code), data)
      results.created.push(`departments/${data.code}`)
      console.log(`   ✓ ${data.code}`)
    } catch (error) {
      results.errors.push({ collection: 'departments', error: String(error) })
    }
  }

  // Create sample potholes
  console.log('🕳️ Creating sample potholes...')
  for (let i = 0; i < samplePotholes.length; i++) {
    const data = samplePotholes[i]
    const id = `pothole-${String(i + 1).padStart(4, '0')}`
    try {
      await setDoc(doc(db, COLLECTIONS.POTHOLES, id), data)
      results.created.push(`potholes/${id}`)
      console.log(`   ✓ ${id}`)
    } catch (error) {
      results.errors.push({ collection: 'potholes', error: String(error) })
    }
  }

  return results
}

// Export for use in API routes
export { db, app }
