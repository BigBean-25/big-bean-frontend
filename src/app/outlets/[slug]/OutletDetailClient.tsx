'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { MapPin, Phone, Clock, Mail, Navigation, ArrowLeft } from 'lucide-react'

export interface Outlet {
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
  seo_title: string | null
  seo_description: string | null
  seo_h1: string | null
  og_title: string | null
  og_description: string | null
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

export default function OutletDetailClient({ slug, initialOutlet }: { slug: string; initialOutlet?: Outlet | null }) {
  const [outlet, setOutlet] = useState<Outlet | null>(initialOutlet ?? null)
  const [loading, setLoading] = useState(!initialOutlet)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (initialOutlet || !slug) return
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
  }, [slug, initialOutlet])

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
  const mapsHref = outlet.latitude && outlet.longitude
    ? `https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`
    : outlet.address
      ? `https://www.google.com/maps/search/${encodeURIComponent(outlet.address)}`
      : null

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      <style>{`
        @keyframes outletFadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .outlet-fade-up{animation:outletFadeUp .55s ease-out both}
        .outlet-fade-in{animation:outletFadeIn .6s ease-out both}
        @keyframes outletFadeIn{from{opacity:0}to{opacity:1}}
        .outlet-stagger-1{animation-delay:60ms;}
        .outlet-stagger-2{animation-delay:140ms;}
        .outlet-stagger-3{animation-delay:220ms;}
        .outlet-stagger-4{animation-delay:300ms;}
        @keyframes outletDrift{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-48%,-48%) rotate(6deg)}}
        .outlet-drift{animation:outletDrift 16s ease-in-out infinite alternate;}
        @keyframes outletImgZoom{from{transform:scale(1.02)}to{transform:scale(1)}}
        @media(prefers-reduced-motion:reduce){
          .outlet-fade-up,.outlet-fade-in,.outlet-drift,.outlet-hero-bg{animation:none;opacity:1;transform:none;}
          .outlet-stagger-1,.outlet-stagger-2,.outlet-stagger-3,.outlet-stagger-4{animation-delay:0ms;}
        }
        .outlet-hero{position:relative;display:flex;align-items:center;overflow:hidden;min-height:620px;background:linear-gradient(135deg,#120905 0%,#2A120B 50%,#5C2E12 100%);}
        .outlet-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.9;filter:brightness(1.05) contrast(1.08) saturate(1.08);transform:scale(1.02);animation:outletImgZoom .8s ease-out forwards;}
        .outlet-hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(18,9,5,0.86) 0%,rgba(18,9,5,0.72) 34%,rgba(18,9,5,0.42) 62%,rgba(18,9,5,0.22) 100%),linear-gradient(180deg,rgba(18,9,5,0.20) 0%,rgba(18,9,5,0.32) 55%,rgba(18,9,5,0.58) 100%);}
        .outlet-hero-glow{position:absolute;right:0;top:0;width:420px;height:420px;max-width:60vw;max-height:60vh;border-radius:50%;background:rgba(201,148,58,0.15);filter:blur(48px);}
        .outlet-hero-glow2{position:absolute;left:0;bottom:0;width:300px;height:300px;max-width:50vw;max-height:50vh;border-radius:50%;background:rgba(139,74,47,0.20);filter:blur(48px);}
        .outlet-hero-dots{position:absolute;inset:0;opacity:.08;pointer-events:none;background-image:radial-gradient(circle,#C9943A 1px,transparent 1px);background-size:32px 32px;}
        .outlet-hero-inner{position:relative;z-index:10;width:100%;max-width:1600px;margin:0 auto;padding:4rem clamp(1.5rem,5vw,6rem) 3.25rem;}
        .outlet-hero-copy{width:100%;max-width:900px;min-width:0;}
        .outlet-hero-eyebrow{font-size:.72rem;line-height:1;}
        .outlet-hero-title{margin:0 0 1rem;color:#FFF7ED;font-size:clamp(2.5rem,3.8vw,4.25rem);font-weight:900;line-height:.98;letter-spacing:-.025em;text-wrap:balance;text-shadow:0 2px 12px rgba(0,0,0,.5);}
        .outlet-hero-subtitle{max-width:650px;margin-bottom:1.5rem;color:#F5D7BF;font-size:clamp(.92rem,1.1vw,1.05rem);line-height:1.75;text-shadow:0 1px 8px rgba(0,0,0,.5);}
        .outlet-hero-actions{display:flex;flex-wrap:wrap;gap:.75rem;margin-bottom:2rem;}
        .outlet-hero-btn{display:inline-flex;align-items:center;gap:.5rem;min-height:46px;font-size:.78rem;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:.08em;border-radius:100px;padding:.75rem 1.5rem;transition:all .22s;}
        .outlet-hero-btn:active{transform:scale(.98);}
        .outlet-hero-btn-primary{background:#C9943A;color:#120905;box-shadow:0 10px 28px rgba(201,148,58,.32);}
        .outlet-hero-btn-primary:hover{background:#F6D58D;transform:translateY(-2px);}
        .outlet-hero-btn-secondary{background:transparent;color:#FFF7ED;border:1.5px solid rgba(255,255,255,.28);}
        .outlet-hero-btn-secondary:hover{background:rgba(255,255,255,.08);transform:translateY(-2px);}
        .outlet-hero-stats{display:inline-flex;max-width:100%;overflow:hidden;border-radius:22px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.10);backdrop-filter:blur(8px);}
        .outlet-hero-stat{padding:.85rem 1.5rem;text-align:center;border-right:1px solid rgba(255,255,255,.12);min-width:0;}
        .outlet-hero-stat:last-child{border-right:none;}
        .outlet-hero-stat-value{font-size:1.2rem;font-weight:900;color:#F6D58D;line-height:1.1;}
        .outlet-hero-stat-label{font-size:.58rem;font-weight:700;color:#C7A489;text-transform:uppercase;letter-spacing:.1em;margin-top:2px;}
        .outlet-floating-card{position:absolute;right:5%;bottom:8%;max-width:300px;background:rgba(18,9,5,.64);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.18);border-radius:24px;padding:1.25rem;box-shadow:0 24px 70px rgba(18,9,5,.35);z-index:15;}
        .outlet-floating-card-icon{width:40px;height:40px;border-radius:50%;background:rgba(201,148,58,.18);border:1px solid rgba(201,148,58,.35);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .outlet-floating-card-title{font-size:.82rem;font-weight:900;color:#F6D58D;}
        .outlet-floating-card-sub{font-size:.7rem;color:rgba(199,164,137,.85);margin-top:2px;}
        .outlet-floating-card-text{font-size:.72rem;line-height:1.65;color:rgba(245,215,191,.75);margin-top:.6rem;}
        .outlet-info{position:relative;background:linear-gradient(180deg,#FFFDF9 0%,#FFF7ED 100%);overflow:hidden;}
        .outlet-info-glow{position:absolute;inset:0;background:radial-gradient(circle at 20% 30%,rgba(201,148,58,0.10),transparent 45%),radial-gradient(circle at 80% 70%,rgba(139,74,47,0.08),transparent 40%);}
        .outlet-info-inner{position:relative;z-index:5;width:100%;max-width:1340px;margin:0 auto;padding:5.5rem 2rem 5rem;}
        .outlet-info-grid{display:grid;grid-template-columns:1fr;gap:2.5rem;align-items:start;}
        .outlet-info-card{background:rgba(255,255,255,0.92);border:1px solid rgba(201,148,58,0.22);border-radius:26px;padding:1.75rem 2rem;box-shadow:0 8px 34px rgba(61,31,13,0.07);transition:transform .25s,box-shadow .25s;}
        .outlet-info-card:hover{transform:translateY(-4px);box-shadow:0 16px 46px rgba(61,31,13,0.11);}
        .outlet-info-eyebrow{font-size:.65rem;font-weight:900;letter-spacing:.22em;text-transform:uppercase;color:#C9943A;margin-bottom:.65rem;}
        .outlet-info-title{font-size:1.35rem;font-weight:900;color:#3D1F0D;margin-bottom:1.25rem;line-height:1.1;}
        .outlet-info-iconbox{width:44px;height:44px;border-radius:14px;background:rgba(201,148,58,0.10);border:1px solid rgba(201,148,58,0.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .outlet-info-text{font-size:.93rem;color:#6B3520;line-height:1.65;}
        .outlet-info-address{max-width:620px;font-size:.93rem;color:#6B3520;line-height:1.65;}
        .outlet-contact-card{background:rgba(255,247,237,0.94);border:1px solid rgba(201,148,58,0.26);border-radius:30px;padding:2rem;box-shadow:0 10px 38px rgba(61,31,13,0.09);}
        .outlet-contact-header{font-size:.7rem;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:#C9943A;margin-bottom:1.5rem;}
        .outlet-contact-row{display:flex;align-items:flex-start;gap:.85rem;font-size:.9rem;color:#5C2E12;line-height:1.55;}
        .outlet-contact-row a{color:#5C2E12;text-decoration:none;transition:color .18s;}
        .outlet-contact-row a:hover{color:#C9943A;}
        .outlet-contact-value{word-break:break-word;}
        .outlet-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;width:100%;min-height:52px;border-radius:16px;font-size:.82rem;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:.06em;transition:transform .2s,box-shadow .2s,background .2s;}
        .outlet-btn:active{transform:scale(.98);}
        .outlet-btn-primary{background:#3D1F0D;color:#FFF7ED;box-shadow:0 6px 18px rgba(61,31,13,0.25);}
        .outlet-btn-primary:hover{transform:translateY(-2px);background:#5C2E12;box-shadow:0 10px 26px rgba(61,31,13,0.32);}
        .outlet-btn-secondary{background:transparent;color:#3D1F0D;border:1.5px solid #C9943A;}
        .outlet-btn-secondary:hover{transform:translateY(-2px);background:rgba(201,148,58,0.08);color:#3D1F0D;}
        .outlet-back{display:inline-flex;align-items:center;gap:.4rem;font-size:.85rem;font-weight:700;color:#8B5A3C;text-decoration:none;transition:color .18s;}
        .outlet-back:hover{color:#C9943A;}
        .outlet-back svg{transition:transform .18s;}
        .outlet-back:hover svg{transform:translateX(-3px);}
        .outlet-transition{height:1px;background:linear-gradient(90deg,transparent,rgba(201,148,58,0.35),transparent);max-width:1340px;margin:0 auto;}
        .outlet-cta{position:relative;overflow:hidden;background:linear-gradient(135deg,#120905 0%,#2A120B 45%,#4A2114 100%);padding:5.5rem 2rem;}
        .outlet-cta-glow{position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,rgba(201,148,58,0.14),transparent 55%),radial-gradient(circle at 80% 80%,rgba(139,74,47,0.14),transparent 40%);}
        .outlet-cta-dots{position:absolute;inset:0;opacity:.08;pointer-events:none;background-image:radial-gradient(circle,#C9943A 1px,transparent 1px);background-size:32px 32px;}
        .outlet-cta-ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:600px;height:600px;border-radius:50%;border:1px solid rgba(201,148,58,0.10);opacity:.35;pointer-events:none;}
        .outlet-cta-inner{position:relative;z-index:10;max-width:880px;margin:0 auto;text-align:center;}
        .outlet-cta-eyebrow{font-size:.65rem;font-weight:900;letter-spacing:.24em;text-transform:uppercase;color:#C9943A;margin-bottom:.9rem;}
        .outlet-cta-title{font-size:clamp(1.75rem,3.6vw,3.1rem);font-weight:900;color:#FFF7ED;line-height:1.05;margin-bottom:1rem;text-shadow:0 2px 12px rgba(0,0,0,.5);}
        .outlet-cta-desc{font-size:clamp(1rem,1.2vw,1.15rem);line-height:1.7;max-width:700px;margin:0 auto 2.25rem;color:#E6C7A8;}
        .outlet-cta-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:54px;border-radius:100px;padding:.9rem 2.25rem;font-size:.85rem;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:.06em;color:#120905;background:linear-gradient(90deg,#D7A64A,#F0CC83);box-shadow:0 8px 24px rgba(201,148,58,0.32);transition:transform .2s,box-shadow .2s;}
        .outlet-cta-btn:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(201,148,58,0.38);}
        .outlet-cta-btn:active{transform:scale(.98);}
        @media(max-width:1199px){
          .outlet-hero{min-height:560px;}
          .outlet-hero-inner{padding:3.5rem clamp(1.5rem,4vw,3rem) 3rem;}
          .outlet-hero-copy{max-width:720px;}
          .outlet-hero-title{font-size:clamp(2.5rem,5vw,3.75rem);}
          .outlet-info-inner{padding:4.5rem 1.75rem 4rem;}
          .outlet-cta{padding:4.5rem 1.75rem;}
        }
        @media(max-width:899px){
          .outlet-hero{min-height:auto;}
          .outlet-hero-inner{padding-top:4rem;padding-bottom:3rem;}
          .outlet-hero-copy{max-width:680px;}
          .outlet-floating-card{display:none;}
          .outlet-info-inner{padding:3.5rem 1.5rem 3rem;}
          .outlet-cta{padding:3.5rem 1.5rem;}
          .outlet-info-grid{gap:2rem;}
        }
        @media(min-width:1024px){
          .outlet-info-grid{grid-template-columns:1.1fr .9fr;gap:3.5rem;}
        }
        @media(max-width:640px){
          .outlet-hero{align-items:flex-start;}
          .outlet-hero-inner{padding:3rem 1.25rem 2.5rem;}
          .outlet-hero-eyebrow{font-size:.65rem;}
          .outlet-hero-title{font-size:clamp(2.15rem,11vw,3rem);line-height:1;letter-spacing:-.02em;}
          .outlet-hero-subtitle{max-width:100%;margin-bottom:1.5rem;font-size:.9rem;line-height:1.7;}
          .outlet-hero-actions{width:100%;gap:.65rem;margin-bottom:1.5rem;}
          .outlet-hero-btn{width:100%;justify-content:center;}
          .outlet-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:100%;}
          .outlet-hero-stat{padding:.75rem .35rem !important;}
          .outlet-hero-stat-value{font-size:1.05rem;}
          .outlet-hero-stat-label{font-size:.52rem;letter-spacing:.06em !important;}
          .outlet-info-inner{padding:2.5rem 1rem 2.25rem;}
          .outlet-info-card{padding:1.35rem 1.25rem;border-radius:22px;}
          .outlet-contact-card{padding:1.5rem;border-radius:24px;}
          .outlet-info-title{font-size:1.15rem;}
          .outlet-cta{padding:3rem 1rem;}
          .outlet-cta-title{font-size:clamp(1.6rem,7vw,2.2rem);}
          .outlet-cta-desc{font-size:.95rem;}
        }
        @media(max-width:374px){
          .outlet-hero-inner{padding-left:1rem;padding-right:1rem;}
          .outlet-hero-title{font-size:2rem;}
          .outlet-info-inner{padding:2.25rem .85rem 2rem;}
          .outlet-cta{padding:2.75rem .85rem;}
        }
      `}</style>

      <main>
        {/* Hero */}
        <section className="outlet-hero">
          <div className="absolute inset-0 bg-gradient-to-br from-[#120905] via-[#2A120B] to-[#5C2E12]" />
          {imgUrl && <img src={imgUrl} alt={outlet.seo_h1 || outlet.name} className="outlet-hero-bg" />}
          <div className="outlet-hero-overlay" />
          <div className="outlet-hero-glow" />
          <div className="outlet-hero-glow2" />
          <div className="outlet-hero-dots" />

          <div className="outlet-hero-inner">
            <div className="outlet-hero-copy">
              <div className="outlet-fade-up inline-flex items-center gap-2 rounded-full border border-[#C9943A]/35 bg-[#C9943A]/12 px-4 py-1.5 mb-6">
                <MapPin style={{ width: 13, height: 13, color: '#C9943A' }} />
                <span className="outlet-hero-eyebrow font-black tracking-[0.22em] uppercase" style={{ color: '#F7D891' }}>Big Bean Café Outlet</span>
              </div>

              <h1 className="font-heading outlet-hero-title outlet-fade-up outlet-stagger-1">{outlet.seo_h1 || outlet.name}</h1>

              <p className="outlet-hero-subtitle outlet-fade-up outlet-stagger-2">{outlet.address}</p>

              <div className="outlet-hero-actions outlet-fade-up outlet-stagger-3">
                {mapsHref && (
                  <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="outlet-hero-btn outlet-hero-btn-primary">
                    <Navigation style={{ width: 14, height: 14 }} /> Get Directions
                  </a>
                )}
                {outlet.phone && (
                  <a href={`tel:${outlet.phone}`} className="outlet-hero-btn outlet-hero-btn-secondary">
                    <Phone style={{ width: 14, height: 14 }} /> Call Now
                  </a>
                )}
              </div>

              <div className="outlet-hero-stats outlet-fade-up outlet-stagger-4">
                <div className="outlet-hero-stat">
                  <div className="outlet-hero-stat-value">Outlet</div>
                  <div className="outlet-hero-stat-label">Big Bean Café</div>
                </div>
                <div className="outlet-hero-stat">
                  <div className="outlet-hero-stat-value">Daily</div>
                  <div className="outlet-hero-stat-label">Coffee & Food</div>
                </div>
                <div className="outlet-hero-stat">
                  <div className="outlet-hero-stat-value">Bengaluru</div>
                  <div className="outlet-hero-stat-label">Location</div>
                </div>
              </div>
            </div>

            {mapsHref && (
              <div className="outlet-floating-card hidden xl:block outlet-fade-up outlet-stagger-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="outlet-floating-card-icon">
                    <MapPin style={{ width: 18, height: 18, color: '#C9943A' }} />
                  </div>
                  <div>
                    <div className="outlet-floating-card-title">Visit This Outlet</div>
                    <div className="outlet-floating-card-sub">Coffee • Food • Café Experience</div>
                  </div>
                </div>
                <p className="outlet-floating-card-text">
                  Drop by for fresh brews and a warm space to work or relax.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Info */}
        <section className="outlet-info">
          <div className="outlet-info-glow" />
          <div className="outlet-info-inner">
            <div className="outlet-info-grid">

              {/* Left */}
              <div className="space-y-8">
                {outlet.opening_hours && (
                  <div className="outlet-info-card outlet-fade-up">
                    <p className="outlet-info-eyebrow">Opening Hours</p>
                    <h2 className="font-heading outlet-info-title">When We&apos;re Open</h2>
                    <div className="flex items-start gap-4">
                      <div className="outlet-info-iconbox">
                        <Clock className="w-5 h-5 text-[#C9943A]" />
                      </div>
                      <p className="outlet-info-text whitespace-pre-line">{outlet.opening_hours}</p>
                    </div>
                  </div>
                )}

                <div className="outlet-info-card outlet-fade-up outlet-stagger-1">
                  <p className="outlet-info-eyebrow">Location</p>
                  <h2 className="font-heading outlet-info-title">Find Us Here</h2>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="outlet-info-iconbox">
                      <MapPin className="w-5 h-5 text-[#C9943A]" />
                    </div>
                    <p className="outlet-info-address">{outlet.address}</p>
                  </div>
                  {outlet.latitude && outlet.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="outlet-btn outlet-btn-primary"
                    >
                      <Navigation className="w-4 h-4" />
                      Open in Google Maps
                    </a>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="space-y-6">
                <div className="outlet-contact-card outlet-fade-up outlet-stagger-2">
                  <p className="outlet-contact-header">Contact This Outlet</p>
                  <div className="space-y-4">
                    {outlet.phone && (
                      <div className="outlet-contact-row">
                        <div className="outlet-info-iconbox">
                          <Phone className="w-4 h-4 text-[#C9943A]" />
                        </div>
                        <a href={`tel:${outlet.phone}`} className="outlet-contact-value">{outlet.phone}</a>
                      </div>
                    )}
                    {outlet.email && (
                      <div className="outlet-contact-row">
                        <div className="outlet-info-iconbox">
                          <Mail className="w-4 h-4 text-[#C9943A]" />
                        </div>
                        <a href={`mailto:${outlet.email}`} className="outlet-contact-value">{outlet.email}</a>
                      </div>
                    )}
                    <div className="outlet-contact-row">
                      <div className="outlet-info-iconbox">
                        <MapPin className="w-4 h-4 text-[#C9943A]" />
                      </div>
                      <span className="outlet-contact-value">{outlet.address}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 outlet-fade-up outlet-stagger-3">
                  {outlet.latitude && outlet.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="outlet-btn outlet-btn-primary"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </a>
                  )}
                  {outlet.phone && (
                    <a href={`tel:${outlet.phone}`} className="outlet-btn outlet-btn-secondary">
                      <Phone className="w-4 h-4" />
                      Call Now
                    </a>
                  )}
                </div>

                <a href="/outlets" className="outlet-back justify-center outlet-fade-up outlet-stagger-4">
                  <ArrowLeft className="w-4 h-4" /> Back to All Outlets
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="outlet-transition" />
        <section className="outlet-cta">
          <div className="outlet-cta-glow" />
          <div className="outlet-cta-dots" />
          <div className="outlet-cta-ring outlet-drift" />
          <div className="outlet-cta-inner">
            <p className="outlet-cta-eyebrow outlet-fade-up">Visit Us Today</p>
            <h2 className="font-heading outlet-cta-title outlet-fade-up outlet-stagger-1">
              Visit {outlet.name} Today
            </h2>
            <p className="outlet-cta-desc outlet-fade-up outlet-stagger-2">
              Experience the perfect blend of coffee and ambiance at our {outlet.name} outlet
            </p>
            {outlet.latitude && outlet.longitude && (
              <a
                href={`https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="outlet-cta-btn outlet-fade-up outlet-stagger-3"
              >
                <Navigation className="w-4 h-4" />
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
