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
    name: 'Central Delhi',
    code: 'DL-Central',
    type: 'zone',
    center: { lat: 28.6289, lng: 77.2195 },
    bounds: [
      { lat: 28.62, lng: 77.21 },
      { lat: 28.64, lng: 77.23 },
      { lat: 28.65, lng: 77.22 },
      { lat: 28.63, lng: 77.20 },
    ],
    parentId: 'delhi',
    departmentId: 'PWD-DL',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'North Delhi',
    code: 'DL-North',
    type: 'zone',
    center: { lat: 28.7189, lng: 77.2067 },
    bounds: [
      { lat: 28.70, lng: 77.19 },
      { lat: 28.74, lng: 77.22 },
      { lat: 28.75, lng: 77.21 },
      { lat: 28.71, lng: 77.18 },
    ],
    parentId: 'delhi',
    departmentId: 'PWD-DL',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    name: 'South Delhi',
    code: 'DL-South',
    type: 'zone',
    center: { lat: 28.5355, lng: 77.2500 },
    bounds: [
      { lat: 28.50, lng: 77.23 },
      { lat: 28.57, lng: 77.27 },
      { lat: 28.58, lng: 77.26 },
      { lat: 28.51, lng: 77.22 },
    ],
    parentId: 'delhi',
    departmentId: 'PWD-DL',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
]

// Sample departments
const sampleDepartments = [
  {
    name: 'Public Works Department',
    code: 'PWD-DL',
    jurisdictionId: 'delhi',
    contactEmail: 'pwd-delhi@gov.in',
    contactPhone: '+91-11-23456789',
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
]

// Sample potholes
const samplePotholes = [
  {
    lat: 28.6139,
    lng: 77.209,
    severity: 'critical',
    confidence: 0.94,
    status: 'pending',
    jurisdictionId: 'DL-Central',
    departmentId: 'PWD-DL',
    address: 'MG Road, Connaught Place',
    description: 'Large pothole causing traffic disruption',
    mediaUrls: [],
    thumbnailUrl: null,
    detectedAt: new Date(Date.now() - 1000 * 60 * 15),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    lat: 28.6189,
    lng: 77.214,
    severity: 'high',
    confidence: 0.87,
    status: 'verified',
    jurisdictionId: 'DL-Central',
    departmentId: 'PWD-DL',
    address: 'Barakhamba Road',
    description: 'Multiple potholes near metro station',
    mediaUrls: [],
    thumbnailUrl: null,
    detectedAt: new Date(Date.now() - 1000 * 60 * 45),
    verifiedAt: new Date(Date.now() - 1000 * 60 * 30),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    lat: 28.6239,
    lng: 77.219,
    severity: 'medium',
    confidence: 0.76,
    status: 'in_progress',
    jurisdictionId: 'DL-Central',
    departmentId: 'PWD-DL',
    address: 'Janpath',
    description: 'Road damage reported by citizen',
    mediaUrls: [],
    thumbnailUrl: null,
    detectedAt: new Date(Date.now() - 1000 * 60 * 120),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    lat: 28.6339,
    lng: 77.224,
    severity: 'low',
    confidence: 0.68,
    status: 'resolved',
    jurisdictionId: 'DL-Central',
    departmentId: 'PWD-DL',
    address: 'Sansad Marg',
    description: 'Minor road damage, recently repaired',
    mediaUrls: [],
    thumbnailUrl: null,
    detectedAt: new Date(Date.now() - 1000 * 60 * 180),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
  {
    lat: 28.6289,
    lng: 77.204,
    severity: 'critical',
    confidence: 0.92,
    status: 'pending',
    jurisdictionId: 'DL-Central',
    departmentId: 'PWD-DL',
    address: 'Parliament Street',
    description: 'Deep pothole near government building',
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
