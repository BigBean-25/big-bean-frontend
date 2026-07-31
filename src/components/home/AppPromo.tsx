'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { QrCode, ArrowRight, Check, Smartphone, Star, Zap, Gift } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace(/\/api$/, '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  const img = String(image).trim()
  if (!img) return null
  if (img.startsWith('http://') || img.startsWith('https://')) return img
  if (img.startsWith('/uploads')) return `${API_BASE_URL}${img}`
  if (img.startsWith('uploads/')) return `${API_BASE_URL}/${img}`
  return `${API_BASE_URL}/${img.replace(/^\/+/, '')}`
}

interface AppPromoData {
  id: number
  eyebrow: string | null
  title: string
  subtitle: string | null
  feature_1: string | null
  feature_2: string | null
  feature_3: string | null
  feature_4: string | null
  google_play_url: string | null
  app_store_url: string | null
  order_url: string | null
  qr_image: string | null
  mockup_image: string | null
  background_image: string | null
  button_text: string | null
}

const FALLBACK: AppPromoData = {
  id: 0,
  eyebrow: 'BIG BEAN CAFÉ APP',
  title: 'Order on the Go with Big Bean Café App',
  subtitle: 'Download our app for quick ordering, rewards, exclusive offers, and seamless café ordering.',
  feature_1: 'Mobile ordering & payment',
  feature_2: 'Exclusive app-only deals',
  feature_3: 'QR code ordering in-store',
  feature_4: 'Big Coins rewards',
  google_play_url: '#',
  app_store_url: '#',
  order_url: 'https://bigbeancafe.store',
  qr_image: null,
  mockup_image: null,
  background_image: null,
  button_text: 'Order Online Now',
}

export default function AppPromo() {
  const [data, setData] = useState<AppPromoData>(FALLBACK)

  useEffect(() => {
    fetch(`${API_URL}/app-promos/active`)
      .then(r => r.json())
      .then(d => {
        const items: AppPromoData[] = d.data || []
        if (items.length > 0) setData(items[0])
      })
      .catch(() => {})
  }, [])

  const features = [data.feature_1, data.feature_2, data.feature_3, data.feature_4].filter(Boolean) as string[]
  const qrUrl = getImageUrl(data.qr_image)
  const mockupUrl = getImageUrl(data.mockup_image)
  const bgUrl = getImageUrl(data.background_image)
  const orderUrl = data.order_url || 'https://bigbeancafe.store'
  const gpUrl = data.google_play_url || '#'
  const asUrl = data.app_store_url || '#'

  return (
    <section
      className="app-promo-section relative flex min-h-[auto] items-center overflow-hidden py-8 lg:min-h-[580px] lg:py-10"
      style={bgUrl ? { backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'linear-gradient(135deg,#FFF7ED,#F6E6D1)' }}
    >
      {/* Dark coffee overlay for readability */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'linear-gradient(90deg,rgba(20,8,2,0.76),rgba(61,31,13,0.55),rgba(255,247,237,0.18))' }}
      />

      {/* Subtle left glow only — keeps right/phone side clean */}
      <div className="glow-circle pointer-events-none absolute -bottom-28 -left-24 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(169,37,23,0.16)_0%,transparent_70%)] blur-3xl" />

      <div className="container-custom relative z-10 mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">

          {/* LEFT: glass content card */}
          <div className="order-1">
            <div
              className="relative z-10 rounded-[28px] border p-5 shadow-2xl backdrop-blur-xl sm:p-6 lg:rounded-[34px] lg:p-7"
              style={{
                background: 'linear-gradient(135deg, rgba(61,31,13,0.92), rgba(42,18,11,0.86))',
                borderColor: 'rgba(255,247,237,0.18)',
              }}
            >
              {/* Eyebrow */}
              <div className="fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-[#E6C7A8] bg-white/70 px-4 py-1.5 shadow-sm">
                <Smartphone className="h-3.5 w-3.5 text-[#8B5A3C]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#8B5A3C]">
                  {data.eyebrow || 'BIG BEAN CAFÉ APP'}
                </span>
              </div>

              {/* Title */}
              <h2
                className="fade-up font-heading font-black leading-[1.05] text-[#FFF7ED]"
                style={{
                  fontSize: 'clamp(1.8rem, 3.2vw, 3.2rem)',
                  textShadow: '0 4px 18px rgba(0,0,0,0.35)',
                }}
              >
                {data.title}
              </h2>

              {/* Subtitle */}
              {data.subtitle && (
                <p
                  className="fade-up mt-4 max-w-[540px] text-[15px] leading-relaxed text-[#F6E6D1] lg:text-[17px]"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.25)' }}
                >
                  {data.subtitle}
                </p>
              )}

              {/* Feature grid 2x2 */}
              <div className="fade-up mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-md"
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#C9943A]/20">
                      <Check className="h-3.5 w-3.5 text-[#C9943A]" strokeWidth={3} />
                    </span>
                    <span className="text-[13px] font-bold leading-snug text-[#FFF7ED] sm:text-sm">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA row */}
              <div className="fade-up mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={orderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button inline-flex h-12 flex-shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#A92517] to-[#3D1F0D] px-7 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#A92517]/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#A92517]/30"
                >
                  {data.button_text || 'Order Online Now'}
                  <ArrowRight className="h-4 w-4" />
                </a>

                {/* QR mini card */}
                <div className="qr-card flex items-center gap-3 rounded-2xl border border-[#E6C7A8] bg-white/90 p-3.5 shadow-sm backdrop-blur-sm">
                  {qrUrl ? (
                    <img
                      src={qrUrl}
                      alt="Scan QR"
                      className="h-[72px] w-[72px] flex-shrink-0 rounded-lg border border-[#E6C7A8] object-cover lg:h-[76px] lg:w-[76px]"
                    />
                  ) : (
                    <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-lg border border-[#E6C7A8] bg-[#FDF0E0] lg:h-[76px] lg:w-[76px]">
                      <QrCode className="h-9 w-9 text-[#C9943A]" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-black text-[#3D1F0D]">Scan & Order</p>
                    <p className="text-[11px] font-medium leading-tight text-[#8B5A3C]">Menu, offers & rewards</p>
                  </div>
                </div>
              </div>

              {/* Store badges */}
              <div className="fade-up mt-4 flex flex-wrap items-center justify-start gap-3 sm:justify-start">
                <a href={gpUrl} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play"
                  className="inline-flex items-center justify-center transition-transform duration-200 hover:-translate-y-0.5">
                  <Image src="/images/app/google-play-badge.png" alt="Get it on Google Play"
                    width={150} height={46} className="store-badge h-auto w-[130px] object-contain sm:w-[145px]" />
                </a>
                <a href={asUrl} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store"
                  className="inline-flex items-center justify-center transition-transform duration-200 hover:-translate-y-0.5">
                  <Image src="/images/app/app-store-badge.png" alt="Download on the App Store"
                    width={150} height={46} className="store-badge h-auto w-[130px] object-contain sm:w-[145px]" />
                </a>
              </div>

              {/* Learn more */}
              <div className="fade-up mt-4">
                <a
                  href="/app"
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#F6E6D1] transition-colors hover:text-white"
                >
                  Learn more about the app
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: realistic phone mockup */}
          <div className="relative order-2 flex items-center justify-center py-6 lg:py-2">
            {/* Dark phone shell */}
            <div
              className="phone-card relative"
              style={{
                background: '#111111',
                borderRadius: '44px',
                padding: '9px',
                width: 'clamp(250px, 60vw, 350px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}
            >
              {/* Side buttons — purely decorative */}
              <div style={{ position: 'absolute', left: -3, top: 90, width: 3, height: 28, background: '#2a2a2a', borderRadius: '2px 0 0 2px' }} />
              <div style={{ position: 'absolute', left: -3, top: 130, width: 3, height: 44, background: '#2a2a2a', borderRadius: '2px 0 0 2px' }} />
              <div style={{ position: 'absolute', right: -3, top: 110, width: 3, height: 52, background: '#2a2a2a', borderRadius: '0 2px 2px 0' }} />

              {/* Screen */}
              <div style={{ borderRadius: '36px', overflow: 'hidden', background: '#ffffff' }}>
                {/* Notch bar */}
                <div style={{ height: 28, background: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 78, height: 13, background: '#000000', borderRadius: 999 }} />
                </div>

                {/* Screenshot — object-contain keeps full image visible without cropping */}
                <div style={{ height: 'clamp(380px, 44vh, 490px)', background: '#ffffff', overflow: 'hidden' }}>
                  {mockupUrl ? (
                    <img
                      src={mockupUrl}
                      alt="Big Bean Café App"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top center', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#F8F4F0' }}>
                      <Smartphone style={{ width: 48, height: 48, color: '#C9943A', opacity: 0.55 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8B80' }}>
                        Big Bean Café App
                      </span>
                    </div>
                  )}
                </div>

                {/* Home indicator */}
                <div style={{ height: 24, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 120, height: 4, background: 'rgba(17,17,17,0.15)', borderRadius: 999 }} />
                </div>
              </div>

              {/* Floating feature badges — desktop only */}
              <div className="hidden lg:block">
                <div className="badge-float absolute -left-[72px] top-14 inline-flex items-center gap-2 rounded-full border border-[#E6D4C0] bg-white px-3 py-2 shadow-md">
                  <Star className="h-4 w-4 text-[#C9943A]" />
                  <span className="text-xs font-black text-[#3D1F0D]">Big Coins</span>
                </div>
                <div className="badge-float-2 absolute -right-[70px] top-28 inline-flex items-center gap-2 rounded-full border border-[#E6D4C0] bg-white px-3 py-2 shadow-md">
                  <Zap className="h-4 w-4 text-[#A92517]" />
                  <span className="text-xs font-black text-[#3D1F0D]">Fast Orders</span>
                </div>
                <div className="badge-float-3 absolute -left-[70px] bottom-14 inline-flex items-center gap-2 rounded-full border border-[#E6D4C0] bg-white px-3 py-2 shadow-md">
                  <Gift className="h-4 w-4 text-[#167E68]" />
                  <span className="text-xs font-black text-[#3D1F0D]">QR Ordering</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .glow-circle {
          animation: softPulse 6s ease-in-out infinite;
        }
        @keyframes softPulse {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        .phone-card {
          animation: appFloat 5s ease-in-out infinite;
        }
        @keyframes appFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .badge-float {
          animation: badgeBob 4s ease-in-out infinite;
        }
        .badge-float-2 {
          animation: badgeBob 4.5s ease-in-out infinite 0.5s;
        }
        .badge-float-3 {
          animation: badgeBob 5s ease-in-out infinite 1s;
        }
        @keyframes badgeBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .fade-up {
          animation: fadeUp 0.7s ease-out both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .glow-circle, .phone-card, .badge-float, .badge-float-2, .badge-float-3, .fade-up {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}
