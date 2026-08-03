'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface MapOutlet {
  id: number | string
  name: string
  address?: string | null
  latitude?: number | string | null
  longitude?: number | string | null
}

interface AboutOutletsMapProps {
  outlets: MapOutlet[]
  activeOutletId: number | string | null
  onOutletSelect: (outlet: MapOutlet) => void
  loading?: boolean
}

const BENGALURU_CENTER: [number, number] = [12.9716, 77.5946]
const DEFAULT_ZOOM = 12

function isValidCoord(lat: unknown, lng: unknown): boolean {
  const la = Number(lat)
  const lo = Number(lng)
  return (
    Number.isFinite(la) && Number.isFinite(lo) &&
    la >= -90 && la <= 90 && la !== 0 &&
    lo >= -180 && lo <= 180 && lo !== 0
  )
}

function toLatLng(outlet: MapOutlet): [number, number] | null {
  if (!isValidCoord(outlet.latitude, outlet.longitude)) return null
  return [Number(outlet.latitude), Number(outlet.longitude)]
}

function makeIcon(active: boolean) {
  const color = active ? '#C9943A' : '#3D1F0D'
  const border = active ? '#FFF7ED' : '#E6C7A8'
  const size = active ? 36 : 30
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.3}" viewBox="0 0 30 39">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10 15 24 15 24S30 25 30 15C30 6.7 23.3 0 15 0z"
        fill="${color}" stroke="${border}" stroke-width="2"/>
      <circle cx="15" cy="15" r="5.5" fill="${border}"/>
    </svg>
  `.trim()

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size * 1.3],
    iconAnchor: [size / 2, size * 1.3],
    popupAnchor: [0, -(size * 1.3)],
  })
}

function FitBoundsOnLoad({ outlets }: { outlets: MapOutlet[] }) {
  const map = useMap()
  useEffect(() => {
    const validPoints: [number, number][] = outlets
      .map(toLatLng)
      .filter((p): p is [number, number] => p !== null)

    if (validPoints.length === 0) return

    if (validPoints.length === 1) {
      map.setView(validPoints[0], DEFAULT_ZOOM)
      return
    }

    const bounds = L.latLngBounds(validPoints)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

function PanToActive({
  outlets,
  activeOutletId,
}: {
  outlets: MapOutlet[]
  activeOutletId: number | string | null
}) {
  const map = useMap()
  const prevId = useRef<number | string | null>(null)

  useEffect(() => {
    if (activeOutletId === null || activeOutletId === prevId.current) return
    prevId.current = activeOutletId

    const outlet = outlets.find(o => String(o.id) === String(activeOutletId))
    if (!outlet) return
    const pos = toLatLng(outlet)
    if (!pos) return

    map.flyTo(pos, 15, { duration: 0.8, easeLinearity: 0.25 })
  }, [activeOutletId, map, outlets])

  return null
}

export default function AboutOutletsMap({
  outlets,
  activeOutletId,
  onOutletSelect,
  loading = false,
}: AboutOutletsMapProps) {
  const validOutlets = outlets.filter(o => toLatLng(o) !== null)

  if (loading) {
    return (
      <div className="about-outlets-map about-map-skeleton">
        <div className="about-map-skeleton-content">Loading outlet map…</div>
      </div>
    )
  }

  if (validOutlets.length === 0) {
    return (
      <div className="about-outlets-map" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.82rem', color: '#8A6650', fontWeight: 700 }}>Map unavailable</span>
        <span style={{ fontSize: '0.73rem', color: '#B89880' }}>Outlet coordinates have not been configured.</span>
      </div>
    )
  }

  return (
    <div className="about-outlets-map" style={{ position: 'relative' }}>
      <MapContainer
        center={BENGALURU_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBoundsOnLoad outlets={outlets} />
        <PanToActive outlets={outlets} activeOutletId={activeOutletId} />

        {validOutlets.map(outlet => {
          const pos = toLatLng(outlet)!
          const isActive = String(activeOutletId) === String(outlet.id)
          return (
            <Marker
              key={outlet.id}
              position={pos}
              icon={makeIcon(isActive)}
              zIndexOffset={isActive ? 1000 : 0}
              eventHandlers={{
                click: () => onOutletSelect(outlet),
              }}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <strong style={{ fontSize: '0.85rem', color: '#3D1F0D', display: 'block', marginBottom: '0.2rem' }}>
                    {outlet.name}
                  </strong>
                  {outlet.address && (
                    <span style={{ fontSize: '0.75rem', color: '#6B3520', lineHeight: 1.5, display: 'block' }}>
                      {outlet.address}
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
