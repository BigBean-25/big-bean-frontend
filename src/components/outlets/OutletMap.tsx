'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface OutletMapItem {
  id: number
  name: string
  address: string
  latitude: number | string | null
  longitude: number | string | null
}

function pinIcon(selected: boolean) {
  const size = selected ? 38 : 30
  const h = Math.round(size * 1.3)
  const color = selected ? '#A92517' : '#C9943A'
  const pulse = selected
    ? `<circle cx="12" cy="11" r="9" fill="none" stroke="rgba(169,37,23,0.30)" stroke-width="3"/>`
    : ''
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${h}px">
      <svg viewBox="0 0 24 32" width="${size}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        ${pulse}
        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0z"
          fill="${color}" style="filter:drop-shadow(0 2px 5px rgba(0,0,0,0.32))"/>
        <circle cx="12" cy="11" r="5" fill="white" opacity="0.96"/>
      </svg>
    </div>`,
    iconSize: [size, h],
    iconAnchor: [size / 2, h],
    popupAnchor: [0, -h],
  })
}

const BENGALURU: L.LatLngExpression = [12.9716, 77.5946]

function validCoords(o: OutletMapItem): [number, number] | null {
  const lat = Number(o.latitude)
  const lng = Number(o.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null
}

function MapController({
  outlets,
  selectedId,
}: {
  outlets: OutletMapItem[]
  selectedId: number | null
}) {
  const map = useMap()

  const valid = useMemo(
    () => outlets.map(o => ({ o, coords: validCoords(o) })).filter(x => x.coords != null) as { o: OutletMapItem; coords: [number, number] }[],
    [outlets],
  )

  useEffect(() => {
    if (valid.length === 0) return
    if (valid.length === 1) {
      map.setView(valid[0].coords, 15)
    } else {
      const bounds = L.latLngBounds(valid.map(x => x.coords))
      map.fitBounds(bounds, { padding: [60, 40] })
    }
  }, [valid, map])

  useEffect(() => {
    if (selectedId == null) return
    const entry = valid.find(x => x.o.id === selectedId)
    if (!entry) return
    map.flyTo(entry.coords, 16, { animate: true, duration: 0.8 })
  }, [selectedId, valid, map])

  return null
}

interface Props {
  outlets: OutletMapItem[]
  selectedOutletId: number | null
  onMarkerClick: (id: number) => void
}

export default function OutletMap({ outlets, selectedOutletId, onMarkerClick }: Props) {
  const valid = useMemo(
    () => outlets.map(o => ({ o, coords: validCoords(o) })).filter(x => x.coords != null) as { o: OutletMapItem; coords: [number, number] }[],
    [outlets],
  )

  return (
    <MapContainer
      center={BENGALURU}
      zoom={12}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapController outlets={outlets} selectedId={selectedOutletId} />
      {valid.map(({ o, coords }) => (
        <Marker
          key={`${o.id}-${o.id === selectedOutletId}`}
          position={coords}
          icon={pinIcon(o.id === selectedOutletId)}
          eventHandlers={{ click: () => onMarkerClick(o.id) }}
        >
          <Popup>
            <div style={{ minWidth: 150, fontFamily: 'inherit' }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#3D1F0D', marginBottom: 4 }}>
                {o.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6B3520', lineHeight: 1.45 }}>
                {o.address}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
