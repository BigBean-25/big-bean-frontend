'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import Link from 'next/link'

// Helper function to get media URL
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')

const getMediaUrl = (filePath?: string | null): string => {
  if (!filePath || filePath === 'null') return ''
  if (filePath.startsWith('http')) return filePath
  return `${API_BASE}${filePath.startsWith('/') ? filePath : '/' + filePath}`
}

interface HeroBanner {
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

interface HeroBannerProps {
  banners: HeroBanner[]
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPlaying, banners.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="relative h-screen flex items-center justify-center bg-gradient-to-r from-coffee-800 to-coffee-900">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
            Big Bean Café
          </h1>
          <p className="text-xl md:text-2xl text-coffee-200">
            Premium Coffee Roasters
          </p>
        </div>
      </div>
    )
  }

  const currentBanner = banners[currentSlide]
  
  // Responsive media selection logic
  const getMediaUrlForDevice = () => {
    if (isMobile && currentBanner.mobile_media) {
      return getMediaUrl(currentBanner.mobile_media)
    }
    return getMediaUrl(currentBanner.desktop_media)
  }
  
  const mediaUrl = getMediaUrlForDevice()
  const isVideo = currentBanner.media_type === 'video'

  const hasButton1 = !!(currentBanner.button_1_text && currentBanner.button_1_text !== 'null' && currentBanner.button_1_url && currentBanner.button_1_url !== 'null')
  const hasButton2 = !!(currentBanner.button_2_text && currentBanner.button_2_text !== 'null' && currentBanner.button_2_url && currentBanner.button_2_url !== 'null')

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Media */}
      <div className="absolute inset-0">
        {isVideo ? (
          <video
            key={mediaUrl}
            className="absolute inset-0 h-full w-full object-cover"
            src={mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            poster={currentBanner.fallback_image ? getMediaUrl(currentBanner.fallback_image) : undefined}
          />
        ) : (
          <img
            src={mediaUrl}
            alt={currentBanner.title || 'Big Bean Café Hero Banner'}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {/* Overlay — always show a rich coffee gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-[#3D1F0D]/45 to-black/60" />

      {/* Content — vertically and horizontally centered */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          {/* Subtitle — above title */}
          {currentBanner.subtitle && currentBanner.subtitle !== 'null' && (
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[#F5E6D3]/90 md:text-sm lg:text-base">
              {currentBanner.subtitle}
            </p>
          )}

          {/* Title */}
          <h1 className="font-heading text-[42px] font-bold leading-[1.05] text-white drop-shadow-2xl md:text-[56px] lg:text-[68px] xl:text-[76px]">
            {currentBanner.title}
          </h1>

          {/* Description */}
          {currentBanner.description && currentBanner.description !== 'null' && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/90 drop-shadow md:text-lg lg:text-xl">
              {currentBanner.description}
            </p>
          )}

          {/* Buttons */}
          {(hasButton1 || hasButton2) && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {hasButton1 && (
                <Link
                  href={currentBanner.button_1_url!}
                  className="rounded-full px-8 py-3.5 text-base font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ background: '#F5E6D3', color: '#2A120B' }}
                >
                  {currentBanner.button_1_text}
                </Link>
              )}
              {hasButton2 && (
                <Link
                  href={currentBanner.button_2_url!}
                  className="rounded-full border-2 border-white/80 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
                >
                  {currentBanner.button_2_text}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-8 right-8 z-20 rounded-full bg-white/20 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>

          <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentSlide ? 'w-7 bg-white' : 'w-2.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
