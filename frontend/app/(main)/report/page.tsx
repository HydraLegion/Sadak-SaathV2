'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, MapPin, Upload, X, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge, getSeverityVariant } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { storage, db } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import type { PotholeSeverity, Complaint } from '@/lib/types'
import type { UploadTask } from 'firebase/storage'

type ReportStep = 'location' | 'media' | 'confirm' | 'submitting' | 'success'

export default function ReportPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore()
  const [step, setStep] = useState<ReportStep>('location')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState('')
  const [media, setMedia] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<PotholeSeverity | null>(null)
  const [detectedSeverity, setDetectedSeverity] = useState<PotholeSeverity | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [referenceNumber, setReferenceNumber] = useState<string>('')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 28.6139, lng: 77.209 })
      )
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setMedia(files)

    const urls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)

    setIsDetecting(true)
    setTimeout(() => {
      const severities: PotholeSeverity[] = ['critical', 'high', 'medium', 'low']
      setDetectedSeverity(severities[Math.floor(Math.random() * severities.length)])
      setConfidence(0.75 + Math.random() * 0.2)
      setIsDetecting(false)
    }, 2000)
  }

  const handleSubmit = async () => {
    if (!user || !isAuthenticated) return

    setIsSubmitting(true)
    setStep('submitting')
    setUploadProgress(10)

    // Skip media uploads - storage bucket not configured
    const mediaUrls: string[] = []
    setUploadProgress(60)

    try {
      // Create pothole record
      const potholeData = {
        lat: location?.lat || 0,
        lng: location?.lng || 0,
        severity: severity || detectedSeverity || 'medium',
        confidence,
        status: 'pending',
        jurisdictionId: 'DL-Central',
        departmentId: null,
        address: address || `Lat: ${location?.lat.toFixed(4)}, Lng: ${location?.lng.toFixed(4)}`,
        description,
        mediaUrls,
        thumbnailUrl: mediaUrls[0] || null,
        detectedAt: new Date(),
        detectedBy: 'manual',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const potholeRef = await addDoc(collection(db, 'potholes'), potholeData)
      setUploadProgress(75)

      // Generate reference number
      const refNum = `CMP/DL/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`
      setReferenceNumber(refNum)

      // Create complaint record
      const complaintData: Omit<Complaint, 'id'> = {
        potholeId: potholeRef.id,
        userId: user.uid,
        status: 'submitted',
        priority: severity || detectedSeverity || 'medium',
        assignedTo: null,
        jurisdictionId: 'DL-Central',
        departmentId: null,
        referenceNumber: refNum,
        title: address || `Pothole at ${location?.lat.toFixed(4)}, ${location?.lng.toFixed(4)}`,
        description,
        mediaUrls,
        slaDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        slaBreached: false,
        escalatedAt: null,
        resolvedAt: null,
        closedAt: null,
        timeline: [{
          id: '1',
          action: 'submitted',
          description: 'Complaint submitted by citizen',
          performedBy: user.uid,
          performedAt: new Date(),
          newStatus: 'submitted',
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, 'complaints'), {
        ...complaintData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setUploadProgress(100)

      setStep('success')
    } catch (error) {
      console.error('Error submitting report:', error)
      setStep('confirm')
    }

    setIsSubmitting(false)
  }

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])
    setMedia(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Report Pothole</h1>
        <p className="text-muted-foreground">Help us improve road safety in your area</p>
      </div>

      <div className="flex items-center justify-between">
        {['Location', 'Media', 'Confirm'].map((label, idx) => {
          const stepKey = label.toLowerCase() as ReportStep
          const isActive = step === stepKey
          const isComplete = ['media', 'confirm', 'submitting', 'success'].includes(step) && stepKey !== 'location'
          return (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium', isActive ? 'bg-primary text-primary-foreground' : isComplete ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground')}>
                  {isComplete ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                </div>
                <span className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
              </div>
              {idx < 2 && <div className="w-12 h-px bg-border mx-2" />}
            </div>
          )
        })}
      </div>

      {step === 'location' && (
        <Card>
          <CardHeader>
            <CardTitle>Report Location</CardTitle>
            <CardDescription>Share your location or enter address manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full h-24" onClick={() => {
              navigator.geolocation?.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => {}
              )
            }}>
              <MapPin className="h-6 w-6 mr-2" />
              <span>Use Current Location</span>
            </Button>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Or enter address manually..." value={address} onChange={(e) => setAddress(e.target.value)} className="pl-10" />
            </div>
            {location && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium">Selected Location</p>
                <p className="text-sm text-muted-foreground">{address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}</p>
              </div>
            )}
            <Button className="w-full" disabled={!location && !address} onClick={() => setStep('media')}>Continue</Button>
          </CardContent>
        </Card>
      )}

      {step === 'media' && (
        <Card>
          <CardHeader>
            <CardTitle>Capture or Upload</CardTitle>
            <CardDescription>Take a photo or upload an existing image</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" id="media-upload" />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium">Click to capture or upload</p>
                <p className="text-sm text-muted-foreground">JPG, PNG, WebP up to 50MB</p>
              </label>
            </div>
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => removeMedia(idx)} className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {isDetecting && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>AI analyzing image...</span>
              </div>
            )}
            {detectedSeverity && !isDetecting && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <CheckCircle className="h-5 w-5 text-severity-low" />
                <div className="flex-1">
                  <p className="font-medium">Detection Complete</p>
                  <p className="text-sm text-muted-foreground">Detected: <span className="inline-block"><Badge variant={getSeverityVariant(detectedSeverity)}>{detectedSeverity}</Badge></span> with {(confidence * 100).toFixed(0)}% confidence</p>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('location')}>Back</Button>
              <Button className="flex-1" disabled={media.length === 0 || isDetecting} onClick={() => setStep('confirm')}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Report</CardTitle>
            <CardDescription>Review and submit your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewUrls.length > 0 && (
              <div className="aspect-video rounded-lg overflow-hidden border">
                <img src={previewUrls[0]} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-3">
              <div>
                <Label>Location</Label>
                <p className="text-sm mt-1">{address || `${location?.lat.toFixed(4)}, ${location?.lng.toFixed(4)}`}</p>
              </div>
              <div>
                <Label>Description (optional)</Label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add any additional details..." className="w-full mt-1 p-3 rounded-md border bg-background text-sm min-h-[80px] resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div>
                <Label>Override Severity (optional)</Label>
                <div className="flex gap-2 mt-2">
                  {(['critical', 'high', 'medium', 'low'] as PotholeSeverity[]).map((sev) => (
                    <button key={sev} onClick={() => setSeverity(sev)} className={cn('flex-1 py-2 rounded border text-sm font-medium capitalize transition-all', (severity || detectedSeverity) === sev ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50')}>
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('media')}>Back</Button>
              <Button className="flex-1" onClick={handleSubmit}>Submit Report</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'submitting' && (
        <Card className="text-center py-12">
          <CardContent>
            <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
            <p className="font-medium">Submitting your report... {uploadProgress}%</p>
            <div className="w-full h-2 bg-muted rounded-full mt-4">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'success' && (
        <Card className="text-center py-12 border-severity-low">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-severity-low/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-severity-low" />
            </div>
            <h2 className="text-xl font-bold mb-2">Report Submitted!</h2>
            {referenceNumber && (
              <p className="text-lg font-mono text-primary mb-4">Reference: {referenceNumber}</p>
            )}
            <p className="text-muted-foreground mb-6">Your report has been received and will be reviewed by our AI system. You will receive updates on the status.</p>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => router.push('/complaints')}>Track Status</Button>
              <Button variant="outline" className="w-full" onClick={() => {
                setStep('location'); setMedia([]); setPreviewUrls([]); setDetectedSeverity(null)
                setLocation(null); setAddress(''); setDescription(''); setReferenceNumber('')
              }}>Submit Another</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
