'use client'

import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MapPin, Phone, Clock, Navigation, Search, X, ArrowRight } from 'lucide-react'

const OutletMap = dynamic(() => import('./OutletMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#EDE0CC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'inherit',
      }}
    >
      <div style={{ textAlign: 'center', color: '#8B5A3C' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Loading map…</div>
      </div>
    </div>
  ),
})

interface Outlet {
  id: number
  name: string
  address: string
  phone: string | null
  opening_hours: string | null
  latitude: number | string | null
  longitude: number | string | null
  status: string
}

interface Props {
  outlets: Outlet[]
  loading: boolean
  error: boolean
}

function hasValidCoords(o: Outlet) {
  const lat = Number(o.latitude)
  const lng = Number(o.longitude)
  return Number.isFinite(lat) && Number.isFinite(lng)
}

export default function OutletMapLocator({ outlets, loading, error }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return outlets
    return outlets.filter(
      o =>
        o.name.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q),
    )
  }, [outlets, searchTerm])

  const selected = useMemo(
    () => (selectedId != null ? outlets.find(o => o.id === selectedId) ?? null : null),
    [selectedId, outlets],
  )

  const mapsHref = useMemo(() => {
    if (!selected) return null
    const lat = Number(selected.latitude)
    const lng = Number(selected.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return `https://www.google.com/maps?q=${lat},${lng}`
    if (selected.address) return `https://www.google.com/maps/search/${encodeURIComponent(selected.address)}`
    return null
  }, [selected])

  const handleMarkerClick = useCallback((id: number) => {
    setSelectedId(id)
    setTimeout(() => {
      const el = document.getElementById(`oi-${id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 80)
  }, [])

  const handleListClick = useCallback((outlet: Outlet) => {
    setSelectedId(outlet.id)
  }, [])

  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '3.5rem 2rem 4rem' }}>
      <style>{`
        .oml-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(300px, 0.9fr);
          gap: 24px;
          align-items: start;
        }
        .oml-map-wrap {
          height: 560px;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(61,31,13,0.14);
          border: 1px solid #E6C7A8;
          background: #EDE0CC;
        }
        .oml-panel {
          height: 560px;
          background: #FFF7ED;
          border-radius: 28px;
          border: 1px solid #E6C7A8;
          box-shadow: 0 8px 32px rgba(61,31,13,0.10);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .oml-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 0.85rem 0.85rem;
        }
        .oml-list::-webkit-scrollbar { width: 4px; }
        .oml-list::-webkit-scrollbar-track { background: transparent; }
        .oml-list::-webkit-scrollbar-thumb { background: #E6C7A8; border-radius: 4px; }
        @media (max-width: 900px) {
          .oml-grid { grid-template-columns: 55fr 45fr; gap: 16px; }
          .oml-map-wrap { height: 480px; }
          .oml-panel { height: 480px; }
        }
        @media (max-width: 768px) {
          .oml-grid { grid-template-columns: 1fr; }
          .oml-map-wrap { height: 350px; }
          .oml-panel { height: auto; min-height: 300px; max-height: 520px; }
        }
      `}</style>

      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.22em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Our Locations
        </p>
        <h2
          className="font-heading"
          style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.1, marginBottom: '0.75rem' }}
        >
          Find a Big Bean Café Near You
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#6B3520', maxWidth: 500, margin: '0 auto', lineHeight: 1.75 }}>
          Search and explore our locations across Bengaluru
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="oml-grid">
          <div className="oml-map-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#9B6B50', fontSize: '0.9rem', fontWeight: 600 }}>Loading outlets…</div>
          </div>
          <div className="oml-panel" style={{ padding: '1.1rem', gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 74, borderRadius: 14, background: '#F0E6D6', opacity: 0.7 - i * 0.12 }} />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: 28, background: '#fff', border: '1px solid #E6C7A8' }}>
          <MapPin style={{ width: 48, height: 48, color: '#E6C7A8', margin: '0 auto 1rem' }} />
          <h3 className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3D1F0D', marginBottom: '0.5rem' }}>
            Unable to load outlets
          </h3>
          <p style={{ color: '#9B6B50' }}>Please try again later.</p>
        </div>
      )}

      {/* Main locator */}
      {!loading && !error && (
        <div className="oml-grid">
          {/* Map */}
          <div className="oml-map-wrap">
            <OutletMap
              outlets={outlets}
              selectedOutletId={selectedId}
              onMarkerClick={handleMarkerClick}
            />
          </div>

          {/* Right panel */}
          <div className="oml-panel">
            {/* Search */}
            <div style={{ padding: '0.9rem 0.85rem 0.4rem', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search
                  style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#8B5A3C', pointerEvents: 'none' }}
                />
                <input
                  type="text"
                  aria-label="Search outlets by name or area"
                  placeholder="Search outlets by name or area…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', background: '#FBF4EC', border: '1.5px solid #E6C7A8', borderRadius: 100, padding: '0.65rem 2.2rem 0.65rem 2.55rem', fontSize: '0.82rem', color: '#3D1F0D', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#C9943A')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E6C7A8')}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'flex' }}
                  >
                    <X style={{ width: 13, height: 13, color: '#9B6B50' }} />
                  </button>
                )}
              </div>
            </div>

            {/* Result count */}
            <div style={{ padding: '0 0.85rem 0.45rem', flexShrink: 0 }}>
              <span style={{ fontSize: '0.7rem', color: '#8B5A3C', fontWeight: 700 }}>
                {filtered.length} location{filtered.length !== 1 ? 's' : ''}
                {searchTerm ? ' matching' : ' across Bengaluru'}
              </span>
            </div>

            {/* Outlet list */}
            <div className="oml-list">
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <p style={{ color: '#9B6B50', fontSize: '0.85rem', marginBottom: '0.75rem' }}>No outlets found</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{ fontSize: '0.75rem', fontWeight: 800, color: '#C9943A', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                filtered.map(outlet => {
                  const isSel = outlet.id === selectedId
                  return (
                    <div
                      key={outlet.id}
                      id={`oi-${outlet.id}`}
                      role="button"
                      tabIndex={0}
                      aria-current={isSel ? 'true' : undefined}
                      onClick={() => handleListClick(outlet)}
                      onKeyDown={e => e.key === 'Enter' && handleListClick(outlet)}
                      style={{
                        border: isSel ? '1.5px solid #C9943A' : '1px solid #E6C7A8',
                        borderRadius: 16,
                        padding: '0.8rem 0.9rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        background: isSel ? 'rgba(201,148,58,0.10)' : '#fff',
                        transition: 'border-color 0.18s, background 0.18s',
                        outline: 'none',
                      }}
                      onMouseEnter={e => {
                        if (!isSel) {
                          ;(e.currentTarget as HTMLElement).style.borderColor = '#C9943A'
                          ;(e.currentTarget as HTMLElement).style.background = 'rgba(201,148,58,0.05)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSel) {
                          ;(e.currentTarget as HTMLElement).style.borderColor = '#E6C7A8'
                          ;(e.currentTarget as HTMLElement).style.background = '#fff'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <MapPin
                          style={{ width: 13, height: 13, color: isSel ? '#C9943A' : '#8B5A3C', flexShrink: 0, marginTop: 2 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#3D1F0D', lineHeight: 1.3, marginBottom: '0.18rem' }}>
                            {outlet.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#6B3520', lineHeight: 1.45 }}>
                            {outlet.address}
                          </div>
                          {outlet.phone && (
                            <div style={{ fontSize: '0.68rem', color: '#8B5A3C', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.28rem' }}>
                              <Phone style={{ width: 9, height: 9, color: '#C9943A', flexShrink: 0 }} />
                              {outlet.phone}
                            </div>
                          )}
                          {outlet.opening_hours && (
                            <div style={{ fontSize: '0.68rem', color: '#8B5A3C', marginTop: '0.18rem', display: 'flex', alignItems: 'center', gap: '0.28rem' }}>
                              <Clock style={{ width: 9, height: 9, color: '#C9943A', flexShrink: 0 }} />
                              {outlet.opening_hours}
                            </div>
                          )}
                          {!hasValidCoords(outlet) && (
                            <div style={{ fontSize: '0.62rem', color: '#9B6B50', marginTop: '0.2rem', fontStyle: 'italic' }}>
                              Map location unavailable
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Selected outlet detail + actions */}
            {selected && (
              <div
                style={{
                  flexShrink: 0,
                  borderTop: '1px solid #E6C7A8',
                  padding: '0.85rem 0.9rem',
                  background: '#FBF4EC',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#3D1F0D', marginBottom: '0.55rem' }}>
                  {selected.name}
                </div>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <Link
                    href="/reservations"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.32rem', background: '#C9943A', color: '#120905', borderRadius: 100, padding: '0 0.95rem', height: 34, fontSize: '0.67rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#F6D58D')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#C9943A')}
                  >
                    Reserve Table <ArrowRight style={{ width: 10, height: 10 }} />
                  </Link>
                  {mapsHref && (
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.32rem', background: '#3D1F0D', color: '#FFF7ED', borderRadius: 100, padding: '0 0.95rem', height: 34, fontSize: '0.67rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#5C2E12')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#3D1F0D')}
                    >
                      <Navigation style={{ width: 10, height: 10 }} /> Directions
                    </a>
                  )}
                  {selected.phone && (
                    <a
                      href={`tel:${selected.phone}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.32rem', background: 'transparent', color: '#3D1F0D', border: '1.5px solid #E6C7A8', borderRadius: 100, padding: '0 0.95rem', height: 34, fontSize: '0.67rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                      onMouseEnter={e => { ;(e.currentTarget as HTMLElement).style.borderColor = '#C9943A'; ;(e.currentTarget as HTMLElement).style.color = '#C9943A' }}
                      onMouseLeave={e => { ;(e.currentTarget as HTMLElement).style.borderColor = '#E6C7A8'; ;(e.currentTarget as HTMLElement).style.color = '#3D1F0D' }}
                    >
                      <Phone style={{ width: 10, height: 10 }} /> Call
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
