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
import { collection, query, getDocs, onSnapshot, orderBy } from 'firebase/firestore'
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

function MapContent() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [mapReady, setMapReady] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const mapRef = useRef<L.Map | null>(null)

  const {
    center, zoom, showHeatmap,
    filterSeverity, selectedPotholeId,
    setCenter, setZoom, selectPothole, setShowHeatmap, setSeverityFilter
  } = useMapStore()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
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
    const q = query(collection(db, 'potholes'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pothole))
      setPotholes(data)
      setLoading(false)
    }, (error) => {
      console.error('Error fetching potholes:', error)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleRecenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView([28.6139, 77.209], 12, { animate: true })
    }
  }, [])

  const filteredPotholes = potholes.filter(p => {
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
            <h3 className="text-sm font-medium mb-2">Nearby ({filteredPotholes.length})</h3>
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {filteredPotholes.slice(0, 20).map((pothole) => (
                <button key={pothole.id}
                  onClick={() => { selectPothole(pothole.id); mapRef.current?.setView([pothole.lat, pothole.lng], 16, { animate: true }) }}
                  className={cn('w-full text-left p-2 rounded border transition-all', selectedPotholeId === pothole.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors[pothole.severity] }} />
                    <span className="text-sm truncate flex-1">{pothole.address || 'Unknown Location'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round((pothole.confidence || 0) * 100)}% confidence</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          {!showSidebar && <Button variant="secondary" size="icon" onClick={() => setShowSidebar(true)} className="shadow-lg"><Filter className="h-4 w-4" /></Button>}
          <Button variant="secondary" size="icon" onClick={handleRecenter} className="shadow-lg"><Crosshair className="h-4 w-4" /></Button>
          <div className="bg-card rounded-lg border shadow-lg flex flex-col">
            <Button variant="ghost" size="icon" onClick={() => mapRef.current?.zoomIn()}><ZoomIn className="h-4 w-4" /></Button>
            <div className="h-px bg-border" />
            <Button variant="ghost" size="icon" onClick={() => mapRef.current?.zoomOut()}><ZoomOut className="h-4 w-4" /></Button>
          </div>
          <Button variant="secondary" size="icon" onClick={() => setFullscreen(!fullscreen)} className="shadow-lg">
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        <div className={cn('h-full rounded-lg border overflow-hidden', fullscreen ? 'h-[calc(100vh-2rem)]' : 'h-[600px]')}>
          <MapContainer center={[center.lat, center.lng]} zoom={zoom} className="h-full w-full" ref={mapRef}>
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
