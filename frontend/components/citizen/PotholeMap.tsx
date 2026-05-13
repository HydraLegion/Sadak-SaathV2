'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Layers, Filter, Locate, ZoomIn, ZoomOut, Navigation } from 'lucide-react'
import { cn } from '@/lib/utils'
import L from 'leaflet'

// Fix Leaflet default icon issue
import 'leaflet/dist/leaflet.css'

interface PotholeMarker {
  id: string
  lat: number
  lng: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  address: string
  status: string
}

interface PotholeMapProps {
  className?: string
  markers?: PotholeMarker[]
}

const mockMarkers: PotholeMarker[] = [
  { id: '1', lat: 21.2514, lng: 81.6296, severity: 'critical', address: 'MG Road, Raipur', status: 'pending' },
  { id: '2', lat: 21.2564, lng: 81.6346, severity: 'high', address: 'GE Road, Shankar Nagar', status: 'assigned' },
  { id: '3', lat: 21.2539, lng: 81.6190, severity: 'medium', address: 'Pandri Road', status: 'in_progress' },
  { id: '4', lat: 21.2639, lng: 81.6240, severity: 'low', address: 'Shankar Nagar', status: 'resolved' },
  { id: '5', lat: 21.2589, lng: 81.6040, severity: 'critical', address: 'Telibandha Road', status: 'pending' },
  { id: '6', lat: 21.2489, lng: 81.6140, severity: 'high', address: 'Tatibandh Road', status: 'assigned' },
]

const severityColors = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e'
}

export default function PotholeMap({ className, markers = mockMarkers }: PotholeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState<PotholeMarker | null>(null)
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('streets')
  const [filterSeverity, setFilterSeverity] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [21.2514, 81.6296],
      zoom: 13,
      zoomControl: false,
    })

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapInstanceRef.current = map
    setMapLoaded(true)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [isClient])

  // Add markers when map is loaded
  useEffect(() => {
    if (!isClient || !mapInstanceRef.current || !mapLoaded) return

    const map = mapInstanceRef.current

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Add markers for each pothole
    markers.forEach((marker) => {
      const color = severityColors[marker.severity]

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
        .addTo(map)
        .on('click', () => setSelectedMarker(marker))

      leafletMarker.bindPopup(`
        <div style="padding: 8px; min-width: 200px;">
          <h4 style="margin: 0 0 8px; font-weight: 600;">${marker.address}</h4>
          <p style="margin: 0; color: #666; font-size: 12px;">Severity: ${marker.severity}</p>
          <p style="margin: 4px 0 0; color: #666; font-size: 12px;">Status: ${marker.status}</p>
        </div>
      `)
    })
  }, [isClient, mapLoaded, markers])

  const handleLocate = () => {
    if (!isClient) return
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([position.coords.latitude, position.coords.longitude], 15)
        }
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative rounded-2xl bg-slate-900/60 border border-slate-800/50 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 shadow-lg">
            <MapPin className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-white">Pothole Map</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">{markers.length} Active</span>
          </div>
        </div>

        {/* Map Controls */}
        <div className="flex items-center gap-2">
          {/* Style Toggle */}
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 shadow-lg">
            {(['streets', 'satellite', 'dark'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                  mapStyle === style
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {style}
              </button>
            ))}
          </div>

          {/* Filter */}
          <div className="relative group">
            <button className="p-2.5 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 shadow-lg text-slate-400 hover:text-white transition-colors">
              <Filter className="w-5 h-5" />
            </button>
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Filter by Severity</p>
              {(['critical', 'high', 'medium', 'low'] as const).map((severity) => (
                <label key={severity} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterSeverity.includes(severity)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilterSeverity([...filterSeverity, severity])
                      } else {
                        setFilterSeverity(filterSeverity.filter(s => s !== severity))
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-300 capitalize">{severity}</span>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: severityColors[severity] }}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      {isClient ? (
        <div ref={mapRef} className="h-[400px] lg:h-[500px]" />
      ) : (
        <div className="h-[400px] lg:h-[500px] flex items-center justify-center bg-slate-900/30">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-400">Loading map...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 shadow-lg">
        <span className="text-xs text-slate-400 font-medium">Severity:</span>
        {(['critical', 'high', 'medium', 'low'] as const).map((severity) => (
          <div key={severity} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: severityColors[severity] }}
            />
            <span className="text-xs text-slate-300 capitalize">{severity}</span>
          </div>
        ))}
      </div>

      {/* Locate Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLocate}
        className="absolute bottom-4 right-4 z-[1000] p-3 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 shadow-lg text-slate-400 hover:text-white transition-colors"
      >
        <Locate className="w-5 h-5" />
      </motion.button>

      {/* Selected Marker Info */}
      {selectedMarker && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-80 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 shadow-xl p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-white">{selectedMarker.address}</p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedMarker.lat.toFixed(4)}, {selectedMarker.lng.toFixed(4)}
              </p>
            </div>
            <button
              onClick={() => setSelectedMarker(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              ×
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className="px-3 py-1.5 rounded-full text-xs font-medium capitalize"
              style={{
                background: `${severityColors[selectedMarker.severity]}20`,
                color: severityColors[selectedMarker.severity],
                border: `1px solid ${severityColors[selectedMarker.severity]}50`
              }}
            >
              {selectedMarker.severity}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-medium capitalize bg-slate-700/50 text-slate-300">
              {selectedMarker.status}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
