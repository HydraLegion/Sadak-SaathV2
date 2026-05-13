'use client'

import { useState } from 'react'
import { getApps, initializeApp, getApp } from 'firebase/app'
import {
  getFirestore, doc, setDoc, serverTimestamp, collection
} from 'firebase/firestore'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Database, MapPin, Building } from 'lucide-react'

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase (avoid duplicate app)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const db = getFirestore(app)

// Sample data
const jurisdictions = [
  { code: 'CG-Central', name: 'Central Raipur', type: 'zone', center: { lat: 21.2514, lng: 81.6296 }, parentId: 'chhattisgarh', departmentId: 'PWD-CG', isActive: true },
  { code: 'CG-North', name: 'North Raipur', type: 'zone', center: { lat: 21.2800, lng: 81.6200 }, parentId: 'chhattisgarh', departmentId: 'PWD-CG', isActive: true },
  { code: 'CG-South', name: 'South Raipur', type: 'zone', center: { lat: 21.2200, lng: 81.6400 }, parentId: 'chhattisgarh', departmentId: 'PWD-CG', isActive: true },
  { code: 'CG-East', name: 'East Raipur', type: 'zone', center: { lat: 21.2600, lng: 81.6800 }, parentId: 'chhattisgarh', departmentId: 'PWD-CG', isActive: true },
  { code: 'CG-West', name: 'West Raipur', type: 'zone', center: { lat: 21.2400, lng: 81.5800 }, parentId: 'chhattisgarh', departmentId: 'PWD-CG', isActive: true },
]

const departments = [
  { code: 'PWD-CG', name: 'Public Works Department', jurisdictionId: 'chhattisgarh', contactEmail: 'pwd-cg@gov.in', contactPhone: '+91-771-2225678', isActive: true },
]

const potholes = [
  { id: 'pothole-0001', lat: 21.2514, lng: 81.6296, severity: 'critical', confidence: 0.94, status: 'pending', jurisdictionId: 'CG-Central', address: 'MG Road, Raipur', description: 'Large pothole causing traffic disruption' },
  { id: 'pothole-0002', lat: 21.2564, lng: 81.6346, severity: 'high', confidence: 0.87, status: 'verified', jurisdictionId: 'CG-Central', address: 'GE Road', description: 'Multiple potholes near railway station' },
  { id: 'pothole-0003', lat: 21.2539, lng: 81.6190, severity: 'medium', confidence: 0.76, status: 'in_progress', jurisdictionId: 'CG-Central', address: 'Shankar Nagar Road', description: 'Road damage reported by citizen' },
  { id: 'pothole-0004', lat: 21.2639, lng: 81.6240, severity: 'low', confidence: 0.68, status: 'resolved', jurisdictionId: 'CG-Central', address: 'Pandri Road', description: 'Minor road damage, recently repaired' },
  { id: 'pothole-0005', lat: 21.2589, lng: 81.6040, severity: 'critical', confidence: 0.92, status: 'pending', jurisdictionId: 'CG-Central', address: 'Telibandha Road', description: 'Deep pothole near commercial area' },
]

type StepStatus = 'pending' | 'loading' | 'success' | 'error'

interface SetupResult {
  collection: string
  item: string
  status: StepStatus
  error?: string
}

export default function SetupPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<SetupResult[]>([])
  const [completed, setCompleted] = useState(false)

  const runSetup = async () => {
    setIsRunning(true)
    setResults([])
    setCompleted(false)

    const steps = [
      { name: 'Jurisdictions', items: jurisdictions, collection: 'jurisdictions', icon: MapPin },
      { name: 'Departments', items: departments, collection: 'departments', icon: Building },
      { name: 'Potholes', items: potholes, collection: 'potholes', icon: Database },
    ]

    for (const step of steps) {
      for (const item of step.items) {
        const id = (item as { code?: string; id?: string }).code || (item as { code?: string; id?: string }).id || String(Math.random())
        setResults(prev => [...prev, { collection: step.name, item: id, status: 'loading' }])

        try {
          await setDoc(doc(db, step.collection, id), {
            ...item,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          setResults(prev => prev.map(r =>
            r.item === id && r.collection === step.name ? { ...r, status: 'success' } : r
          ))
        } catch (error) {
          setResults(prev => prev.map(r =>
            r.item === id && r.collection === step.name
              ? { ...r, status: 'error', error: String(error) } : r
          ))
        }
      }
    }

    setIsRunning(false)
    setCompleted(true)
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sadak Saathi</h1>
          <p className="text-muted-foreground mt-2">Firestore Database Setup</p>
        </div>

        {/* Setup Card */}
        <Card>
          <CardHeader>
            <CardTitle>Initialize Collections</CardTitle>
            <CardDescription>
              Click the button below to create the required Firestore collections with sample data.
              This will add jurisdictions, departments, and sample potholes to your database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={runSetup}
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                'Initialize Firestore'
              )}
            </Button>

            {/* Progress */}
            {results.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Progress</h3>
                <div className="max-h-[300px] overflow-auto space-y-1">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded text-sm ${
                        result.status === 'success' ? 'bg-green-50 text-green-700' :
                        result.status === 'error' ? 'bg-red-50 text-red-700' :
                        'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {result.status === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                      {result.status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span className="flex-1">{result.collection}: {result.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {completed && (
              <div className={`p-4 rounded-lg ${errorCount > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                <p className="font-medium">
                  {errorCount > 0
                    ? `Completed with ${errorCount} error(s)`
                    : 'Setup Complete!'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {successCount} documents created successfully.
                </p>
                {errorCount === 0 && (
                  <Button className="mt-4" asChild>
                    <a href="/dashboard">Go to Dashboard</a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Before Running Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Enable Firestore</p>
                <p className="text-sm text-muted-foreground">
                  Go to Firebase Console → Build → Firestore Database → Create database (test mode)
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Set Temporary Rules</p>
                <p className="text-sm text-muted-foreground">
                  In Firestore Rules, paste: <code className="bg-muted px-1 rounded">allow read, write: if true;</code>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Click Initialize Button</p>
                <p className="text-sm text-muted-foreground">
                  This will create all required collections with sample data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Note */}
        <p className="text-xs text-center text-muted-foreground">
          After setup, remember to update Firestore security rules for production.
        </p>
      </div>
    </div>
  )
}
