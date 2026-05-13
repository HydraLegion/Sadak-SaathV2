'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Layers, Thermometer, Filter, Maximize2, Minimize2,
  List, MapPin, Crosshair, ZoomIn, ZoomOut, RefreshCw
} from 'lucide-react'
import { useMapStore } from '@/stores/map'
import { cn, getSeverityVariant } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Pothole, PotholeSeverity } from '@/lib/types'
import Link from 'next/link'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

const severityColors: Record<PotholeSeverity, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#65a30d'
}

// Fallback demo potholes for Raipur area when Firebase is unavailable
const DEMO_POTHOLES: Pothole[] = [
  { id: 'demo-1', lat: 21.2514, lng: 81.6296, severity: 'critical', confidence: 0.94, status: 'pending', address: 'MG Road, Raipur', jurisdictionId: 'CG-Central', departmentId: null, description: 'Demo pothole', mediaUrls: [], thumbnailUrl: null, detectedAt: new Date(), detectedBy: 'demo', verifiedAt: null, verifiedBy: null, resolvedAt: null, createdBy: 'demo', createdAt: new Date(), updatedAt: new Date() },
  { id: 'demo-2', lat: 21.2564, lng: 81.6346, severity: 'high', confidence: 0.87, status: 'verified', address: 'GE Road, Shankar Nagar', jurisdictionId: 'CG-Central', departmentId: null, description: 'Demo pothole', mediaUrls: [], thumbnailUrl: null, detectedAt: new Date(), detectedBy: 'demo', verifiedAt: null, verifiedBy: null, resolvedAt: null, createdBy: 'demo', createdAt: new Date(), updatedAt: new Date() },
  { id: 'demo-3', lat: 21.2539, lng: 81.6190, severity: 'medium', confidence: 0.76, status: 'in_progress', address: 'Pandri Road', jurisdictionId: 'CG-Central', departmentId: null, description: 'Demo pothole', mediaUrls: [], thumbnailUrl: null, detectedAt: new Date(), detectedBy: 'demo', verifiedAt: null, verifiedBy: null, resolvedAt: null, createdBy: 'demo', createdAt: new Date(), updatedAt: new Date() },
  { id: 'demo-4', lat: 21.2639, lng: 81.6240, severity: 'low', confidence: 0.68, status: 'resolved', address: 'Shankar Nagar', jurisdictionId: 'CG-Central', departmentId: null, description: 'Demo pothole', mediaUrls: [], thumbnailUrl: null, detectedAt: new Date(), detectedBy: 'demo', verifiedAt: null, verifiedBy: null, resolvedAt: null, createdBy: 'demo', createdAt: new Date(), updatedAt: new Date() },
  { id: 'demo-5', lat: 21.2589, lng: 81.6040, severity: 'critical', confidence: 0.92, status: 'pending', address: 'Telibandha Road', jurisdictionId: 'CG-Central', departmentId: null, description: 'Demo pothole', mediaUrls: [], thumbnailUrl: null, detectedAt: new Date(), detectedBy: 'demo', verifiedAt: null, verifiedBy: null, resolvedAt: null, createdBy: 'demo', createdAt: new Date(), updatedAt: new Date() },
]

function MapContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [mapReady, setMapReady] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const mapInstanceRef = useRef<L.Map | null>(null)

  const setMapInstance = useCallback((map: L.Map) => {
    mapInstanceRef.current = map
  }, [])

  const {
    center, zoom, showHeatmap,
    filterSeverity, selectedPotholeId,
    setCenter, setZoom, selectPothole, setShowHeatmap, setSeverityFilter
  } = useMapStore()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (searchParams.get('view') === 'heatmap') {
      setShowHeatmap(true)
    }
  }, [searchParams, setShowHeatmap])

  useEffect(() => {
    import('leaflet').then(() => setMapReady(true))
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const q = query(collection(db, 'potholes'), orderBy('createdAt', 'desc'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
          try {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pothole))
            // Use demo data if Firestore returns empty or Firebase isn't connected
            setPotholes(data.length > 0 ? data : DEMO_POTHOLES)
          } catch (e) {
            console.error('Error parsing potholes:', e)
            // Fall back to demo data on error
            setPotholes(DEMO_POTHOLES)
          }
          setLoading(false)
        }, (error) => {
          console.error('Firestore error:', error)
          // Use demo data when Firebase isn't connected
          setPotholes(DEMO_POTHOLES)
          setLoading(false)
        })
        return () => {
          try {
            unsubscribe()
          } catch (e) {
            console.error('Error unsubscribing:', e)
          }
        }
      } catch (error) {
        console.error('Firestore setup error:', error)
        // Use demo data when Firebase isn't connected
        setPotholes(DEMO_POTHOLES)
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [])

  const handleRecenter = useCallback(() => {
    if (mapInstanceRef.current) {
      // Center on Raipur, Chhattisgarh
      mapInstanceRef.current.setView([21.2514, 81.6296], 12, { animate: true })
    }
  }, [])

  const filteredPotholes = potholes.filter(p => {
    // Only show potholes with valid coordinates
    if (!p.lat || !p.lng) return false
    if (filterSeverity.length > 0 && !filterSeverity.includes(p.severity)) return false
    return true
  })

  if (authLoading || loading) {
    return (
      <div className="h-[calc(100vh-8rem)] rounded-lg bg-muted animate-pulse flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!mapReady) {
    return (
      <div className="h-[calc(100vh-8rem)] rounded-lg bg-muted animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-4 animate-fade-in', fullscreen && 'fixed inset-0 z-50 bg-background p-0')}>
      <div className={cn('w-80 bg-card rounded-lg border shrink-0 overflow-hidden transition-all', !showSidebar && 'w-0 opacity-0')}>
        <div className={cn('p-4 space-y-4 h-full overflow-auto', !showSidebar && 'hidden')}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Map Filters</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
              <List className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant={!showHeatmap ? 'secondary' : 'outline'} size="sm" className="flex-1" onClick={() => setShowHeatmap(false)}>
              <MapPin className="h-4 w-4 mr-1" />Markers
            </Button>
            <Button variant={showHeatmap ? 'secondary' : 'outline'} size="sm" className="flex-1" onClick={() => setShowHeatmap(true)}>
              <Thermometer className="h-4 w-4 mr-1" />Heatmap
            </Button>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Severity</h3>
            <div className="flex gap-2 flex-wrap">
              {(['critical', 'high', 'medium', 'low'] as PotholeSeverity[]).map((sev) => (
                <button key={sev} onClick={() => {
                  const newFilter = filterSeverity.includes(sev) ? filterSeverity.filter(s => s !== sev) : [...filterSeverity, sev]
                  setSeverityFilter(newFilter)
                }}
                  className={cn('px-3 py-1 rounded-full text-xs font-medium capitalize transition-all border', filterSeverity.includes(sev) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50')}
                  style={{ borderColor: filterSeverity.includes(sev) ? severityColors[sev] : undefined, backgroundColor: filterSeverity.includes(sev) ? `${severityColors[sev]}20` : undefined, color: filterSeverity.includes(sev) ? severityColors[sev] : undefined }}>
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-3">
              <h3 className="text-sm font-medium mb-2">Legend</h3>
              <div className="space-y-1.5">
                {Object.entries(severityColors).map(([sev, color]) => (
                  <div key={sev} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs capitalize">{sev}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-sm font-medium mb-2">Nearby ({filteredPotholes.length} potholes)</h3>
            <p className="text-xs text-muted-foreground mb-2">Total loaded: {potholes.length}</p>
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {filteredPotholes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No potholes with location data</p>
              ) : (
              filteredPotholes.slice(0, 20).map((pothole) => (
                <button key={pothole.id}
                  onClick={() => { selectPothole(pothole.id); mapInstanceRef.current?.setView([pothole.lat, pothole.lng], 16, { animate: true }) }}
                  className={cn('w-full text-left p-2 rounded border transition-all', selectedPotholeId === pothole.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors[pothole.severity] }} />
                    <span className="text-sm truncate flex-1">{pothole.address || 'Unknown Location'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round((pothole.confidence || 0) * 100)}% confidence</p>
                </button>
              ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          {!showSidebar && <Button variant="secondary" size="icon" onClick={() => setShowSidebar(true)} className="shadow-lg"><Filter className="h-4 w-4" /></Button>}
          <Button variant="secondary" size="icon" onClick={handleRecenter} className="shadow-lg"><Crosshair className="h-4 w-4" /></Button>
          <div className="bg-card rounded-lg border shadow-lg flex flex-col">
            <Button variant="ghost" size="icon" onClick={() => mapInstanceRef.current?.zoomIn()}><ZoomIn className="h-4 w-4" /></Button>
            <div className="h-px bg-border" />
            <Button variant="ghost" size="icon" onClick={() => mapInstanceRef.current?.zoomOut()}><ZoomOut className="h-4 w-4" /></Button>
          </div>
          <Button variant="secondary" size="icon" onClick={() => setFullscreen(!fullscreen)} className="shadow-lg">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        <div className={cn('h-full rounded-lg border overflow-hidden', fullscreen ? 'h-[calc(100vh-2rem)]' : 'h-[600px]')}>
          <MapContainer center={[21.2514, 81.6296]} zoom={zoom || 13} className="h-full w-full" whenReady={(map) => setMapInstance(map.target)}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {!showHeatmap && filteredPotholes.map((pothole) => (
              <CircleMarker key={pothole.id} center={[pothole.lat, pothole.lng]} radius={8}
                pathOptions={{ color: severityColors[pothole.severity], fillColor: severityColors[pothole.severity], fillOpacity: 0.8, weight: 2 }}
                eventHandlers={{ click: () => selectPothole(pothole.id) }}>
                <Popup>
                  <div className="p-1 min-w-[150px]">
                    <h3 className="font-medium">{pothole.address || 'Unknown Location'}</h3>
                    <p className="text-sm text-muted-foreground">Severity: <Badge variant={getSeverityVariant(pothole.severity)} className="capitalize">{pothole.severity}</Badge></p>
                    <p className="text-sm">Confidence: {Math.round((pothole.confidence || 0) * 100)}%</p>
                    <p className="text-xs text-muted-foreground capitalize">{pothole.status?.replace('_', ' ')}</p>
                    <Button size="sm" className="mt-2 w-full" asChild><Link href={`/complaints/${pothole.id}`}>View Details</Link></Button>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            {showHeatmap && filteredPotholes.map((pothole) => (
              <CircleMarker key={`heat-${pothole.id}`} center={[pothole.lat, pothole.lng]} radius={30}
                pathOptions={{ color: 'transparent', fillColor: severityColors[pothole.severity], fillOpacity: 0.3, weight: 0 }} />
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

function MapLoading() {
  return (
    <div className="h-[calc(100vh-8rem)] rounded-lg bg-muted animate-pulse flex items-center justify-center">
      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={<MapLoading />}>
      <MapContent />
    </Suspense>
  )
}
