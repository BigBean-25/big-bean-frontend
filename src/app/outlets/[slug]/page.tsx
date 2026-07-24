'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { MapPin, Phone, Clock, Mail, Navigation } from 'lucide-react'

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
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

export default function OutletDetail() {
  const params = useParams()
  const slug = params.slug as string

  const [outlet, setOutlet] = useState<Outlet | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    const fetchOutlet = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/outlets/slug/${slug}`)
        if (res.status === 404) { setNotFound(true); return }
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setOutlet(data.data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchOutlet()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading outlet...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !outlet) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-600 mb-2">Outlet Not Found</h1>
            <p className="text-gray-500 mb-6">The outlet you&apos;re looking for doesn&apos;t exist.</p>
            <a href="/outlets" className="btn-primary">View All Outlets</a>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const imgUrl = getImageUrl(outlet.image)

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative h-72 flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2A120B 0%, #4A2518 50%, #8B4A2F 100%)' }}>
          {imgUrl && (
            <img src={imgUrl} alt={outlet.name}
              className="absolute inset-0 w-full h-full object-cover opacity-30" />
          )}
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-3" style={{ color: '#FFF7ED' }}>
              {outlet.name}
            </h1>
            <p className="text-lg" style={{ color: '#C7A489' }}>{outlet.address}</p>
          </div>
        </section>

        {/* Info */}
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

              {/* Main */}
              <div className="lg:col-span-2 space-y-8">
                {outlet.opening_hours && (
                  <div>
                    <h2 className="text-2xl font-bold text-coffee-900 mb-4">Opening Hours</h2>
                    <div className="flex items-start gap-3 text-gray-700">
                      <Clock className="w-5 h-5 mt-0.5 text-coffee-600 flex-shrink-0" />
                      <p className="leading-relaxed whitespace-pre-line">{outlet.opening_hours}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-bold text-coffee-900 mb-4">Location</h2>
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 mt-0.5 text-coffee-600 flex-shrink-0" />
                    <p>{outlet.address}</p>
                  </div>
                  {outlet.latitude && outlet.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 btn-primary"
                    >
                      <Navigation className="w-4 h-4" />
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-coffee-900 mb-4">Contact</h3>
                  <div className="space-y-3 text-sm">
                    {outlet.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-coffee-600 flex-shrink-0" />
                        <a href={`tel:${outlet.phone}`} className="text-gray-700 hover:text-coffee-700">
                          {outlet.phone}
                        </a>
                      </div>
                    )}
                    {outlet.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-coffee-600 flex-shrink-0" />
                        <a href={`mailto:${outlet.email}`} className="text-gray-700 hover:text-coffee-700 break-all">
                          {outlet.email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-coffee-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{outlet.address}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {outlet.latitude && outlet.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full text-center flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </a>
                  )}
                  {outlet.phone && (
                    <a href={`tel:${outlet.phone}`} className="btn-outline w-full text-center block">
                      Call Now
                    </a>
                  )}
                </div>

                <a href="/outlets" className="block text-center text-sm text-coffee-600 hover:text-coffee-800 hover:underline">
                  ← Back to All Outlets
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-gradient-to-r from-coffee-800 to-coffee-900 text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
              Visit {outlet.name} Today
            </h2>
            <p className="text-xl text-coffee-100 mb-8 max-w-3xl mx-auto">
              Experience the perfect blend of coffee and ambiance at our {outlet.name} outlet
            </p>
            {outlet.latitude && outlet.longitude && (
              <a
                href={`https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-coffee-900"
              >
                Get Directions
              </a>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
