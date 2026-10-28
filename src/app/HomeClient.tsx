'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import HeroBanner from '@/components/home/HeroBanner'
import Highlights from '@/components/home/Highlights'
import FeaturedMenu from '@/components/home/FeaturedMenu'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { getApiUrl } from '@/lib/api'
import type { Outlet } from '@/lib/outlets'

// Below-the-fold sections are code-split: their HTML is still server-rendered
// (SEO/CLS unaffected) but their JS hydrates lazily instead of blocking LCP.
const OrderingInfo = dynamic(() => import('@/components/home/OrderingInfo'))
const OutletsPreview = dynamic(() => import('@/components/home/OutletsPreview'))
const OffersPreview = dynamic(() => import('@/components/home/OffersPreview'))
const AppPromo = dynamic(() => import('@/components/home/AppPromo'))
const EventsPreview = dynamic(() => import('@/components/home/EventsPreview'))
const MerchandisePreview = dynamic(() => import('@/components/home/MerchandisePreview'))
const FranchiseCTA = dynamic(() => import('@/components/home/FranchiseCTA'))

export interface HeroBannerData {
  id: number
  title: string
  subtitle?: string
  description?: string
  media_type: 'image' | 'video'
  desktop_media: string
  mobile_media: string
  fallback_image?: string
  button_1_text?: string
  button_1_url?: string
  button_2_text?: string
  button_2_url?: string
  text_position: 'left' | 'center' | 'right'
  overlay_enabled: boolean
  overlay_opacity: number
  status: 'active' | 'inactive'
  sort_order: number
}

export default function Home({
  initialOutlets = [],
  initialBanners = [],
}: {
  initialOutlets?: Outlet[]
  initialBanners?: HeroBannerData[]
}) {
  const [heroBanners, setHeroBanners] = useState<HeroBannerData[]>(initialBanners)
  const [loading, setLoading] = useState(initialBanners.length === 0)

  useEffect(() => {
    // Server already provided banners — no client-side waterfall needed.
    if (initialBanners.length > 0) return
    fetchHeroBanners()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchHeroBanners = async () => {
    try {
      const API_URL = getApiUrl()
      const response = await fetch(`${API_URL}/home-banners/active`)
      if (response.ok) {
        const data = await response.json()
        setHeroBanners(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch hero banners:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100">
      <Header />
      <main>
        <HeroBanner banners={heroBanners} loading={loading} />
        <div className="animate-slide-up">
          <Highlights />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <FeaturedMenu />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <OrderingInfo />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <OutletsPreview initialOutlets={initialOutlets} />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <OffersPreview />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <AppPromo />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <EventsPreview />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <MerchandisePreview />
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <FranchiseCTA />
        </div>
      </main>
      <Footer />
    </div>
  )
}
