'use client'

import { useState, useEffect } from 'react'
import HeroBanner from '@/components/home/HeroBanner'
import Highlights from '@/components/home/Highlights'
import FeaturedMenu from '@/components/home/FeaturedMenu'
import OrderingInfo from '@/components/home/OrderingInfo'
import OutletsPreview from '@/components/home/OutletsPreview'
import OffersPreview from '@/components/home/OffersPreview'
import AppPromo from '@/components/home/AppPromo'
import EventsPreview from '@/components/home/EventsPreview'
import MerchandisePreview from '@/components/home/MerchandisePreview'
import FranchiseCTA from '@/components/home/FranchiseCTA'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { getApiUrl } from '@/lib/api'

interface HeroBannerData {
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

export default function Home() {
  const [heroBanners, setHeroBanners] = useState<HeroBannerData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHeroBanners()
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
      <main className="animate-fade-in">
        {!loading && <HeroBanner banners={heroBanners} />}
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
          <OutletsPreview />
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
