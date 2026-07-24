'use client'

import { useState, useEffect } from 'react'
import { MapPin, Phone, Clock, Navigation } from 'lucide-react'

interface Outlet {
  id: number
  name: string
  address: string
  phone: string | null
  email: string | null
  opening_hours: string | null
  latitude: number | null
  longitude: number | null
  image: string | null
  status: string
  sort_order: number
  slug?: string | null
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

export default function OutletsPreview() {
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/outlets`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        console.log('Loaded outlets:', data)
        const rawOutlets: Outlet[] = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []
        const getOutletPriority = (o: Outlet) => {
          const name = (o.name || '').toLowerCase()
          const slug = (o.slug || '').toLowerCase()
          return name.includes('koramangala') || slug.includes('koramangala') ? 0 : 1
        }
        const active = rawOutlets
          .filter((o: Outlet) => o.status === 'active')
          .sort((a: Outlet, b: Outlet) => {
            const pd = getOutletPriority(a) - getOutletPriority(b)
            if (pd !== 0) return pd
            return a.sort_order - b.sort_order || b.id - a.id
          })
          .slice(0, 3)
        setOutlets(active)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchOutlets()
  }, [])

  return (
    <section className="section-padding bg-cream-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4" style={{ color: '#3D1F0D' }}>
            Visit Our Koramangala Cafe
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: '#6B3520' }}>
            Find your nearest Big Bean Café and enjoy coffee, food, and café moments.
          </p>
        </div>

        {/* ── Skeleton ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[28px] border border-[#E6C7A8] bg-white animate-pulse shadow-lg">
                <div className="h-[220px] md:h-[240px] xl:h-[280px] bg-gray-200" />
                <div className="p-7 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-10 bg-gray-200 rounded-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 text-gray-500">
            Unable to load outlets right now.
          </div>
        )}

        {!loading && !error && outlets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No outlets added yet.
          </div>
        )}

        {/* ── Cards ── */}
        {!loading && !error && outlets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-10">
            {outlets.map((outlet) => {
              const imgUrl = getImageUrl(outlet.image)
              return (
                <div
                  key={outlet.id}
                  className="group overflow-hidden rounded-[28px] border border-[#E6C7A8] bg-white shadow-[0_18px_50px_rgba(61,31,13,0.10)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(61,31,13,0.18)]"
                >
                  {/* Image */}
                  <div className="relative h-[220px] md:h-[240px] xl:h-[280px] overflow-hidden bg-gradient-to-br from-[#3D1F0D] to-[#1A0D07] flex items-center justify-center">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={outlet.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <MapPin className="w-14 h-14 opacity-30" style={{ color: '#C9943A' }} />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A0D07]/65 via-transparent to-transparent" />
                    {/* Status badge */}
                    <div className="absolute bottom-4 left-4">
                      <span
                        className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(255,247,237,0.92)', color: '#3D1F0D' }}
                      >
                        {outlet.status === 'active' ? 'Open Now' : 'Visit Outlet'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 md:p-8">
                    <h3 className="font-heading text-2xl font-bold mb-4 leading-snug" style={{ color: '#3D1F0D' }}>
                      {outlet.name}
                    </h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#C9943A' }} />
                        <span className="text-sm leading-relaxed" style={{ color: '#6B3520' }}>{outlet.address}</span>
                      </div>
                      {outlet.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 flex-shrink-0" style={{ color: '#C9943A' }} />
                          <span className="text-sm leading-relaxed" style={{ color: '#6B3520' }}>{outlet.phone}</span>
                        </div>
                      )}
                      {outlet.opening_hours && (
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#C9943A' }} />
                          <span className="text-sm leading-relaxed" style={{ color: '#6B3520' }}>{outlet.opening_hours}</span>
                        </div>
                      )}
                    </div>
                    {outlet.latitude && outlet.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-wide transition-all duration-200"
                        style={{ background: '#3D1F0D', color: '#FFF7ED' }}
                        onMouseOver={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#8B5A3C')}
                        onMouseOut={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#3D1F0D')}
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </a>
                    ) : (
                      <a
                        href="/outlets"
                        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-wide transition-all duration-200"
                        style={{ background: '#3D1F0D', color: '#FFF7ED' }}
                        onMouseOver={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#8B5A3C')}
                        onMouseOut={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#3D1F0D')}
                      >
                        View Outlet
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-14 text-center">
          <a
            href="/outlets"
            className="inline-block rounded-full border-2 px-10 py-4 text-base font-bold uppercase tracking-wide transition-all duration-200"
            style={{ borderColor: '#C9943A', color: '#3D1F0D', background: 'transparent' }}
            onMouseOver={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = '#3D1F0D'
              el.style.color = '#FFF7ED'
              el.style.borderColor = '#3D1F0D'
            }}
            onMouseOut={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'transparent'
              el.style.color = '#3D1F0D'
              el.style.borderColor = '#C9943A'
            }}
          >
            View All Outlets
          </a>
        </div>
      </div>
    </section>
  )
}
