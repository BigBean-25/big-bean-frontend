'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import {
  MapPin, Phone, Clock, Mail, Navigation, ArrowLeft, ChevronLeft, ChevronRight,
  Wifi, PlugZap, Car, Trees, Laptop, Snowflake, PartyPopper, Users, PawPrint,
  Music, Building, ParkingSquare, CalendarRange, ArrowRight, Coffee,
} from 'lucide-react'
import type {
  Outlet, OutletGalleryItem, OutletContent, OutletMenuItem,
} from '@/lib/outlets'

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

const getShortName = (name?: string | null): string => {
  if (!name) return ''
  return name.replace(/^big bean cafe\s*[-–—]?\s*/i, '').trim() || name
}

const FACILITY_META: Record<string, { label: string; Icon: typeof Wifi }> = {
  wifi:             { label: 'Wi-Fi',            Icon: Wifi },
  charging_points:  { label: 'Charging Points',  Icon: PlugZap },
  parking:          { label: 'Parking',          Icon: ParkingSquare },
  outdoor_seating:  { label: 'Outdoor Seating',  Icon: Trees },
  work_friendly:    { label: 'Work Friendly',    Icon: Laptop },
  air_conditioning: { label: 'Air Conditioning', Icon: Snowflake },
  event_space:      { label: 'Event Space',      Icon: PartyPopper },
  family_friendly:  { label: 'Family Friendly',  Icon: Users },
  pet_friendly:     { label: 'Pet Friendly',     Icon: PawPrint },
  live_music:       { label: 'Live Music',       Icon: Music },
  rooftop:          { label: 'Rooftop',          Icon: Building },
  drive_thru:       { label: 'Drive Thru',       Icon: Car },
}

interface Props {
  slug: string
  initialOutlet?: Outlet | null
  initialGallery?: OutletGalleryItem[]
  initialContent?: OutletContent
  initialMenuItems?: OutletMenuItem[]
}

export default function OutletDetailClient({
  slug,
  initialOutlet,
  initialGallery = [],
  initialContent = { facilities: [], event_space_text: '' },
  initialMenuItems = [],
}: Props) {
  const [outlet, setOutlet] = useState<Outlet | null>(initialOutlet ?? null)
  const [loading, setLoading] = useState(!initialOutlet)
  const [notFound, setNotFound] = useState(false)
  const menuTrackRef = useRef<HTMLDivElement>(null)

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

  const scrollMenu = (dir: -1 | 1) => {
    const track = menuTrackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('.outlet-menu-card')
    const step = card ? card.offsetWidth + 20 : 300
    track.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

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
  const shortName = getShortName(outlet.name)
  const mapsHref = outlet.latitude && outlet.longitude
    ? `https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`
    : outlet.address
      ? `https://www.google.com/maps/search/${encodeURIComponent(outlet.address)}`
      : null

  const galleryImages = initialGallery
    .map((g) => ({ id: g.id, src: getImageUrl(g.image), alt: g.title || `${outlet.name} interior` }))
    .filter((g): g is { id: number; src: string; alt: string } => !!g.src)
  const featuredImages = galleryImages.slice(0, 3)
  const extraImages = galleryImages.slice(3)

  const facilities = initialContent.facilities.filter((k) => FACILITY_META[k])
  const hasEventSpace = facilities.includes('event_space')
  const menuUrl = `/menu?outlet=${outlet.id}`

  // Presentation-only parsing of the free-text opening_hours field —
  // split each line into "days" and "time" so hours render as a
  // structured schedule rather than a plain paragraph.
  const hoursRows = (outlet.opening_hours || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Only split on a colon that follows a day-range label (letters/spaces
      // only) — never a colon inside the time itself ("MON ... 08:00 AM").
      const m = line.match(/^([A-Za-z][A-Za-z\s\-–—,&]*?)\s*:\s*([0-9][\s\S]*)$/)
      return m
        ? { days: m[1].trim(), time: m[2].trim() }
        : { days: '', time: line }
    })
  const isDaily = /daily|every\s*day|mon(?:day)?\s*[-–—]\s*sun(?:day)?|mon(?:day)?\s+to\s+sun(?:day)?/i.test(outlet.opening_hours || '')

  return (
    <div className="min-h-screen bg-cream-50">
      <Header />

      {/* dangerouslySetInnerHTML keeps <style> text identical between SSR and
          client render — React SSR escapes quotes in style children ('' → &#x27;)
          which otherwise triggers a hydration text mismatch. */}
      <style dangerouslySetInnerHTML={{ __html: `
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
        .outlet-hero-badges{display:flex;flex-wrap:wrap;gap:.55rem;margin-bottom:1.75rem;}
        .outlet-hero-badge{display:inline-flex;align-items:center;gap:.45rem;border-radius:100px;padding:.45rem .95rem;font-size:.72rem;font-weight:800;color:#F6D58D;background:rgba(255,247,237,0.10);border:1px solid rgba(201,148,58,0.32);backdrop-filter:blur(6px);}
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
        .outlet-section{position:relative;background:linear-gradient(180deg,#FFFDF9 0%,#FFF7ED 100%);overflow:hidden;}
        .outlet-section-glow{position:absolute;inset:0;background:radial-gradient(circle at 20% 30%,rgba(201,148,58,0.10),transparent 45%),radial-gradient(circle at 80% 70%,rgba(139,74,47,0.08),transparent 40%);}
        .outlet-section-inner{position:relative;z-index:5;width:100%;max-width:1340px;margin:0 auto;padding:4.5rem 2rem;}
        .outlet-section-inner + .outlet-section-inner{padding-top:0;}
        .outlet-eyebrow{font-size:.65rem;font-weight:900;letter-spacing:.22em;text-transform:uppercase;color:#C9943A;margin-bottom:.65rem;}
        .outlet-h2{font-size:clamp(1.6rem,3vw,2.4rem);font-weight:900;color:#3D1F0D;line-height:1.1;}
        .outlet-sub{font-size:.95rem;color:#6B3520;line-height:1.7;}
        .outlet-center-head{text-align:center;max-width:760px;margin:0 auto 2.75rem;}
        .outlet-center-head .outlet-sub{margin-top:.85rem;}
        .outlet-menu-head{position:relative;display:flex;align-items:flex-end;justify-content:center;}
        .outlet-menu-arrows{position:absolute;right:0;bottom:.4rem;display:flex;gap:.7rem;}
        .outlet-pair{display:grid;grid-template-columns:1fr;gap:1.5rem;align-items:start;}
        @media(min-width:1024px){.outlet-pair{grid-template-columns:1fr 1fr;gap:2rem;}}
        .outlet-pcard{position:relative;display:flex;flex-direction:column;background:linear-gradient(180deg,#FFFFFF 0%,#FFFDF9 100%);border:1px solid rgba(201,148,58,0.24);border-radius:26px;padding:clamp(1.6rem,2.6vw,2.4rem);box-shadow:0 14px 44px rgba(61,31,13,0.09);overflow:hidden;transition:transform .25s,box-shadow .25s;}
        .outlet-pcard::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,rgba(201,148,58,0) 0%,rgba(201,148,58,0.55) 50%,rgba(201,148,58,0) 100%);}
        .outlet-pcard:hover{transform:translateY(-4px);box-shadow:0 22px 56px rgba(61,31,13,0.13);}
        .outlet-pcard-head{display:flex;align-items:center;gap:1rem;margin-bottom:1.6rem;}
        .outlet-pcard-icon{width:54px;height:54px;border-radius:18px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(201,148,58,0.18),rgba(201,148,58,0.07));border:1px solid rgba(201,148,58,0.32);box-shadow:0 6px 16px rgba(201,148,58,0.15);}
        .outlet-open-badge{margin-left:auto;display:inline-flex;align-items:center;gap:.45rem;border-radius:100px;padding:.45rem .95rem;background:rgba(201,148,58,0.12);border:1px solid rgba(201,148,58,0.35);font-size:.62rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#8B5A3C;white-space:nowrap;}
        .outlet-open-dot{width:7px;height:7px;border-radius:50%;background:#4CAF50;box-shadow:0 0 0 3px rgba(76,175,80,0.18);flex-shrink:0;}
        .outlet-hours-list{display:flex;flex-direction:column;margin-bottom:1.4rem;}
        .outlet-hours-row{display:flex;align-items:baseline;gap:.75rem;padding:.72rem .15rem;border-bottom:1px dashed rgba(139,74,47,0.18);}
        .outlet-hours-row:last-child{border-bottom:none;}
        .outlet-hours-days{font-size:.95rem;font-weight:800;color:#3D1F0D;}
        .outlet-hours-leader{flex:1;min-width:12px;}
        .outlet-hours-time{font-size:.95rem;font-weight:900;color:#A97B2F;letter-spacing:.02em;white-space:nowrap;text-align:right;}
        .outlet-hours-foot{padding-top:1.15rem;border-top:1px solid rgba(201,148,58,0.2);display:flex;align-items:center;gap:.6rem;font-size:.83rem;color:#8B5A3C;font-weight:600;}
        .outlet-hours-foot a{color:#3D1F0D;font-weight:800;text-decoration:none;transition:color .18s;}
        .outlet-hours-foot a:hover{color:#C9943A;}
        .outlet-crow{display:flex;align-items:center;gap:.95rem;padding:.85rem 0;border-bottom:1px solid rgba(201,148,58,0.15);}
        .outlet-crow:last-of-type{border-bottom:none;}
        .outlet-crow-icon{width:46px;height:46px;border-radius:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(201,148,58,0.10);border:1px solid rgba(201,148,58,0.28);}
        .outlet-crow-label{display:block;font-size:.6rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#A97B2F;margin-bottom:.2rem;}
        .outlet-crow-value{display:block;font-size:.98rem;font-weight:700;color:#3D1F0D;line-height:1.5;word-break:break-word;text-decoration:none;transition:color .18s;}
        a.outlet-crow-value:hover{color:#C9943A;}
        .outlet-maps-btn{margin-top:1.6rem;display:inline-flex;align-items:center;justify-content:center;gap:.6rem;width:100%;min-height:54px;border-radius:16px;background:linear-gradient(135deg,#3D1F0D,#5C2E12);color:#FFF7ED;font-size:.8rem;font-weight:900;text-transform:uppercase;letter-spacing:.1em;text-decoration:none;box-shadow:0 10px 26px rgba(61,31,13,0.25);transition:transform .2s,box-shadow .2s,filter .2s;}
        .outlet-maps-btn:hover{transform:translateY(-2px);box-shadow:0 16px 36px rgba(61,31,13,0.32);filter:brightness(1.12);}
        .outlet-maps-btn:active{transform:scale(.98);}
        .outlet-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:52px;border-radius:100px;font-size:.82rem;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:.06em;transition:transform .2s,box-shadow .2s,background .2s;padding:.75rem 1.8rem;}
        .outlet-btn:active{transform:scale(.98);}
        .outlet-btn-primary{background:#3D1F0D;color:#FFF7ED;box-shadow:0 6px 18px rgba(61,31,13,0.25);}
        .outlet-btn-primary:hover{transform:translateY(-2px);background:#5C2E12;box-shadow:0 10px 26px rgba(61,31,13,0.32);}
        .outlet-btn-secondary{background:transparent;color:#3D1F0D;border:1.5px solid #C9943A;}
        .outlet-btn-secondary:hover{transform:translateY(-2px);background:rgba(201,148,58,0.08);color:#3D1F0D;}
        .outlet-back{display:inline-flex;align-items:center;gap:.4rem;font-size:.85rem;font-weight:700;color:#8B5A3C;text-decoration:none;transition:color .18s;}
        .outlet-back:hover{color:#C9943A;}
        .outlet-back svg{transition:transform .18s;}
        .outlet-back:hover svg{transform:translateX(-3px);}

        /* ── Menu carousel ── */
        .outlet-menu-track{display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:.5rem .25rem 1.25rem;scrollbar-width:none;}
        .outlet-menu-track::-webkit-scrollbar{display:none;}
        .outlet-menu-card{scroll-snap-align:start;flex:0 0 min(78vw,270px);background:#fff;border:1px solid #EAD9C2;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(61,31,13,0.08);transition:transform .25s,box-shadow .25s;}
        .outlet-menu-card:hover{transform:translateY(-5px);box-shadow:0 18px 44px rgba(61,31,13,0.14);}
        .outlet-menu-card-img{position:relative;width:100%;height:180px;background:linear-gradient(135deg,#3D1F0D,#6B3520);}
        .outlet-menu-card-body{padding:1rem 1.1rem 1.15rem;}
        .outlet-menu-cat{font-size:.62rem;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:#C9943A;margin-bottom:.3rem;}
        .outlet-menu-name{font-size:.95rem;font-weight:800;color:#3D1F0D;line-height:1.3;margin-bottom:.35rem;}
        .outlet-menu-price{font-size:.9rem;font-weight:900;color:#8B5A3C;}
        .outlet-menu-arrow{width:44px;height:44px;border-radius:50%;border:1.5px solid #C9943A;background:#FFF7ED;color:#3D1F0D;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;}
        .outlet-menu-arrow:hover{background:#3D1F0D;color:#F6D58D;}

        /* ── Gallery (compact editorial) ── */
        .outlet-gallery-grid{display:grid;grid-template-columns:1fr;gap:1rem;max-width:1060px;margin:0 auto;}
        @media(min-width:768px){
          .outlet-gallery-grid{grid-template-columns:1.25fr 1fr;grid-template-rows:repeat(2,minmax(150px,195px));}
          .outlet-gallery-main{grid-row:1 / span 2;}
          .outlet-gallery-grid.count-1{grid-template-columns:1fr;grid-template-rows:minmax(220px,320px);max-width:720px;}
          .outlet-gallery-grid.count-1 .outlet-gallery-main{grid-row:auto;}
          .outlet-gallery-grid.count-2{grid-template-columns:1fr 1fr;grid-template-rows:minmax(200px,290px);}
          .outlet-gallery-grid.count-2 .outlet-gallery-main{grid-row:auto;}
        }
        .outlet-gallery-item{position:relative;border-radius:22px;overflow:hidden;background:linear-gradient(135deg,#3D1F0D,#6B3520);border:1px solid rgba(201,148,58,0.25);min-height:200px;}
        .outlet-gallery-item img{transition:transform .6s ease;}
        .outlet-gallery-item:hover img{transform:scale(1.04);}
        .outlet-gallery-strip{display:flex;gap:.9rem;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:.5rem .25rem 1rem;scrollbar-width:none;max-width:1060px;margin:0 auto;}
        .outlet-gallery-strip::-webkit-scrollbar{display:none;}
        .outlet-gallery-thumb{scroll-snap-align:start;flex:0 0 180px;height:120px;position:relative;border-radius:18px;overflow:hidden;border:1px solid rgba(201,148,58,0.25);}

        /* ── Facilities ── */
        .outlet-facility-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1.1rem;max-width:980px;margin:0 auto;}
        .outlet-facility{height:100%;background:rgba(255,255,255,0.92);border:1px solid rgba(201,148,58,0.24);border-radius:20px;padding:1.25rem 1rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.7rem;text-align:center;transition:transform .2s,box-shadow .2s;}
        .outlet-facility:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(61,31,13,0.10);}
        .outlet-facility-icon{width:46px;height:46px;border-radius:15px;background:rgba(201,148,58,0.12);border:1px solid rgba(201,148,58,0.28);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .outlet-facility-label{font-size:.82rem;font-weight:800;color:#3D1F0D;line-height:1.3;}

        /* ── Event space ── */
        .outlet-event{position:relative;overflow:hidden;border-radius:32px;background:linear-gradient(135deg,#120905 0%,#2A120B 50%,#4A2114 100%);padding:3.75rem clamp(1.5rem,5vw,4rem);}
        .outlet-event-inner{display:flex;flex-direction:column;align-items:center;text-align:center;gap:0;}
        .outlet-event-glow{position:absolute;inset:0;background:radial-gradient(circle at 50% 20%,rgba(201,148,58,0.16),transparent 55%);}
        .outlet-event-dots{position:absolute;inset:0;opacity:.08;pointer-events:none;background-image:radial-gradient(circle,#C9943A 1px,transparent 1px);background-size:32px 32px;}
        .outlet-event-btn{display:inline-flex;align-items:center;gap:.5rem;border-radius:100px;padding:.85rem 2rem;font-size:.8rem;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:.06em;color:#120905;background:linear-gradient(90deg,#D7A64A,#F0CC83);box-shadow:0 8px 24px rgba(201,148,58,0.32);transition:transform .2s,box-shadow .2s;}
        .outlet-event-btn:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(201,148,58,0.38);}

        .outlet-transition{height:1px;background:linear-gradient(90deg,transparent,rgba(201,148,58,0.35),transparent);max-width:1340px;margin:0 auto;}
        .outlet-cta{position:relative;overflow:hidden;background:linear-gradient(135deg,#120905 0%,#2A120B 45%,#4A2114 100%);padding:5.5rem 2rem;}
        .outlet-cta-glow{position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,rgba(201,148,58,0.14),transparent 55%),radial-gradient(circle at 80% 80%,rgba(139,74,47,0.14),transparent 40%);}
        .outlet-cta-dots{position:absolute;inset:0;opacity:.08;pointer-events:none;background-image:radial-gradient(circle,#C9943A 1px,transparent 1px);background-size:32px 32px;}
        .outlet-cta-ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:600px;height:600px;border-radius:50%;border:1px solid rgba(201,148,58,0.10);opacity:.35;pointer-events:none;}
        .outlet-cta-inner{position:relative;z-index:10;max-width:880px;margin:0 auto;text-align:center;}
        .outlet-cta-eyebrow{font-size:.65rem;font-weight:900;letter-spacing:.24em;text-transform:uppercase;color:#C9943A;margin-bottom:.9rem;}
        .outlet-cta-title{font-size:clamp(1.75rem,3.6vw,3.1rem);font-weight:900;color:#FFF7ED;line-height:1.05;margin-bottom:1rem;text-shadow:0 2px 12px rgba(0,0,0,.5);}
        .outlet-cta-desc{font-size:clamp(1rem,1.2vw,1.15rem);line-height:1.7;max-width:700px;margin:0 auto 2.25rem;color:#E6C7A8;}
        .outlet-cta-btns{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center;}
        .outlet-cta-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;min-height:54px;border-radius:100px;padding:.9rem 2.25rem;font-size:.85rem;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:.06em;color:#120905;background:linear-gradient(90deg,#D7A64A,#F0CC83);box-shadow:0 8px 24px rgba(201,148,58,0.32);transition:transform .2s,box-shadow .2s;}
        .outlet-cta-btn:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(201,148,58,0.38);}
        .outlet-cta-btn-outline{background:transparent;color:#FFF7ED;border:1.5px solid rgba(255,255,255,.3);box-shadow:none;}
        .outlet-cta-btn-outline:hover{background:rgba(255,255,255,.08);}
        .outlet-cta-btn:active{transform:scale(.98);}

        @media(max-width:1199px){
          .outlet-hero{min-height:560px;}
          .outlet-hero-inner{padding:3.5rem clamp(1.5rem,4vw,3rem) 3rem;}
          .outlet-hero-copy{max-width:720px;}
          .outlet-hero-title{font-size:clamp(2.5rem,5vw,3.75rem);}
          .outlet-section-inner{padding:4rem 1.75rem;}
          .outlet-cta{padding:4.5rem 1.75rem;}
        }
        @media(max-width:899px){
          .outlet-hero{min-height:auto;}
          .outlet-hero-inner{padding-top:4rem;padding-bottom:3rem;}
          .outlet-hero-copy{max-width:680px;}
          .outlet-floating-card{display:none;}
          .outlet-section-inner{padding:3rem 1.5rem;}
          .outlet-cta{padding:3.5rem 1.5rem;}
        }
        @media(max-width:640px){
          .outlet-hero{align-items:flex-start;}
          .outlet-hero-inner{padding:2.9rem 1.25rem 2.4rem;}
          .outlet-hero-eyebrow{font-size:.65rem;}
          .outlet-hero-title{font-size:clamp(2rem,10vw,2.75rem);line-height:1.02;letter-spacing:-.02em;margin-bottom:.9rem;}
          .outlet-hero-subtitle{max-width:100%;margin-bottom:1.4rem;font-size:.9rem;line-height:1.7;}
          .outlet-hero-badges{gap:.45rem;margin-bottom:1.6rem;}
          .outlet-hero-actions{width:100%;gap:.65rem;margin-bottom:1.5rem;}
          .outlet-hero-btn{width:100%;justify-content:center;min-height:50px;}
          .outlet-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:100%;}
          .outlet-hero-stat{padding:.75rem .35rem !important;}
          .outlet-hero-stat-value{font-size:1.05rem;}
          .outlet-hero-stat-label{font-size:.52rem;letter-spacing:.06em !important;}
          .outlet-section-inner{padding:2.5rem 1rem;}
          .outlet-h2{font-size:clamp(1.4rem,6.5vw,1.9rem);}
          .outlet-pcard{padding:1.4rem 1.2rem;border-radius:22px;}
          .outlet-pcard-head{gap:.85rem;margin-bottom:1.2rem;flex-wrap:wrap;}
          .outlet-pcard-icon{width:46px;height:46px;border-radius:15px;}
          .outlet-hours-row{padding:.62rem .1rem;gap:.5rem;}
          .outlet-crow{padding:.75rem 0;}
          .outlet-crow-icon{width:42px;height:42px;}
          .outlet-menu-track{padding:.4rem .5rem 1.1rem;scroll-padding-left:.5rem;}
          .outlet-menu-cta a{width:min(100%,340px);}
          .outlet-cta{padding:2.6rem 1rem;}
          .outlet-cta-title{font-size:clamp(1.55rem,7vw,2.1rem);}
          .outlet-cta-desc{font-size:.93rem;margin-bottom:1.75rem;}
          .outlet-cta-btns{flex-direction:column;align-items:stretch;width:min(100%,340px);margin:0 auto;}
          .outlet-cta-btns .outlet-cta-btn{width:100%;}
          .outlet-facility-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem;max-width:460px;}
          .outlet-facility{min-height:110px;padding:1.1rem .8rem;}
          .outlet-facility-label{overflow-wrap:break-word;}
          .outlet-gallery-item{min-height:185px;border-radius:18px;}
          .outlet-gallery-main{min-height:215px;}
          .outlet-gallery-thumb{flex:0 0 160px;height:105px;}
          .outlet-event{padding:2.4rem 1.15rem;border-radius:24px;}
        }
        @media(max-width:374px){
          .outlet-hero-inner{padding-left:1rem;padding-right:1rem;}
          .outlet-hero-title{font-size:1.95rem;}
          .outlet-hero-badge{font-size:.62rem;padding:.4rem .7rem;}
          .outlet-section-inner{padding:2.25rem .85rem;}
          .outlet-cta{padding:2.4rem .85rem;}
          .outlet-open-badge{padding:.35rem .7rem;font-size:.55rem;}
          .outlet-hours-row{flex-direction:column;align-items:flex-start;gap:.15rem;}
          .outlet-hours-leader{display:none;}
          .outlet-hours-time{text-align:left;white-space:normal;}
          .outlet-facility{padding:1rem .6rem;}
          .outlet-facility-label{font-size:.75rem;}
          .outlet-event{padding:2rem 1rem;}
          .outlet-menu-card{flex-basis:80vw;}
        }
      ` }} />

      <main>
        {/* ── HERO ─────────────────────────────────────────────── */}
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
                <span className="outlet-hero-eyebrow font-black tracking-[0.22em] uppercase" style={{ color: '#F7D891' }}>
                  Big Bean Café {shortName ? `– ${shortName}` : 'Outlet'}
                </span>
              </div>

              <h1 className="font-heading outlet-hero-title outlet-fade-up outlet-stagger-1">
                {outlet.seo_h1 || (shortName ? `Big Bean Cafe – ${shortName}` : outlet.name)}
              </h1>

              <p className="outlet-hero-subtitle outlet-fade-up outlet-stagger-2">{outlet.address}</p>

              <div className="outlet-hero-badges outlet-fade-up outlet-stagger-2">
                <span className="outlet-hero-badge"><MapPin style={{ width: 12, height: 12 }} /> Bengaluru</span>
                {outlet.opening_hours && (
                  <span className="outlet-hero-badge"><Clock style={{ width: 12, height: 12 }} /> {outlet.opening_hours}</span>
                )}
                {outlet.phone && (
                  <span className="outlet-hero-badge"><Phone style={{ width: 12, height: 12 }} /> {outlet.phone}</span>
                )}
              </div>

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

        {/* ── HOURS + CONTACT CARDS ────────────────────────────── */}
        <section className="outlet-section">
          <div className="outlet-section-glow" />
          <div className="outlet-section-inner">
            <div className="outlet-pair">
              {/* When We're Open */}
              <div className="outlet-pcard outlet-fade-up">
                <div className="outlet-pcard-head">
                  <div className="outlet-pcard-icon">
                    <Clock style={{ width: 24, height: 24, color: '#C9943A' }} />
                  </div>
                  <div>
                    <p className="outlet-eyebrow" style={{ marginBottom: '.3rem' }}>Opening Hours</p>
                    <h2 className="font-heading outlet-h2">When We&apos;re Open</h2>
                  </div>
                  {isDaily && (
                    <span className="outlet-open-badge">
                      <span className="outlet-open-dot" /> Open Daily
                    </span>
                  )}
                </div>

                <div className="outlet-hours-list">
                  {hoursRows.length > 0 ? (
                    hoursRows.map((row, i) => (
                      <div key={i} className="outlet-hours-row">
                        {row.days ? (
                          <>
                            <span className="outlet-hours-days">{row.days}</span>
                            <span className="outlet-hours-leader" />
                            <span className="outlet-hours-time">{row.time}</span>
                          </>
                        ) : (
                          <span className="outlet-hours-days" style={{ fontWeight: 700 }}>{row.time}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="outlet-hours-row">
                      <span className="outlet-hours-days">Hours vary</span>
                      <span className="outlet-hours-leader" />
                      <span className="outlet-hours-time">Call to confirm</span>
                    </div>
                  )}
                </div>

                {outlet.phone && (
                  <div className="outlet-hours-foot">
                    <Phone style={{ width: 15, height: 15, color: '#C9943A', flexShrink: 0 }} />
                    <span>
                      Prefer to call? <a href={`tel:${outlet.phone}`}>{outlet.phone}</a>
                    </span>
                  </div>
                )}
              </div>

              {/* Contact This Outlet */}
              <div className="outlet-pcard outlet-fade-up outlet-stagger-1">
                <div className="outlet-pcard-head">
                  <div className="outlet-pcard-icon">
                    <Phone style={{ width: 24, height: 24, color: '#C9943A' }} />
                  </div>
                  <div>
                    <p className="outlet-eyebrow" style={{ marginBottom: '.3rem' }}>Contact</p>
                    <h2 className="font-heading outlet-h2">Contact This Outlet</h2>
                  </div>
                </div>

                <div>
                  {outlet.phone && (
                    <div className="outlet-crow">
                      <div className="outlet-crow-icon">
                        <Phone style={{ width: 18, height: 18, color: '#C9943A' }} />
                      </div>
                      <div className="min-w-0">
                        <span className="outlet-crow-label">Phone</span>
                        <a href={`tel:${outlet.phone}`} className="outlet-crow-value">{outlet.phone}</a>
                      </div>
                    </div>
                  )}
                  {outlet.email && (
                    <div className="outlet-crow">
                      <div className="outlet-crow-icon">
                        <Mail style={{ width: 18, height: 18, color: '#C9943A' }} />
                      </div>
                      <div className="min-w-0">
                        <span className="outlet-crow-label">Email</span>
                        <a href={`mailto:${outlet.email}`} className="outlet-crow-value">{outlet.email}</a>
                      </div>
                    </div>
                  )}
                  <div className="outlet-crow">
                    <div className="outlet-crow-icon">
                      <MapPin style={{ width: 18, height: 18, color: '#C9943A' }} />
                    </div>
                    <div className="min-w-0">
                      <span className="outlet-crow-label">Address</span>
                      <span className="outlet-crow-value">{outlet.address}</span>
                    </div>
                  </div>
                </div>

                {mapsHref && (
                  <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="outlet-maps-btn">
                    <Navigation style={{ width: 15, height: 15, color: '#C9943A' }} />
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── OUTLET MENU ──────────────────────────────────────── */}
        <section className="outlet-section">
          <div className="outlet-section-glow" />
          <div className="outlet-section-inner">
            <div className="outlet-menu-head mb-9">
              <div className="outlet-center-head" style={{ marginBottom: 0 }}>
                <p className="outlet-eyebrow">Menu Preview</p>
                <h2 className="font-heading outlet-h2">Coffee, Food &amp; Your Favourites</h2>
                <p className="outlet-sub">Explore the {shortName || outlet.name} menu</p>
              </div>
              {initialMenuItems.length > 1 && (
                <div className="outlet-menu-arrows hidden md:flex">
                  <button type="button" aria-label="Scroll menu left" className="outlet-menu-arrow" onClick={() => scrollMenu(-1)}>
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button type="button" aria-label="Scroll menu right" className="outlet-menu-arrow" onClick={() => scrollMenu(1)}>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {initialMenuItems.length > 0 ? (
              <div ref={menuTrackRef} className="outlet-menu-track">
                {initialMenuItems.map((item) => (
                  <a key={item.id} href={menuUrl} className="outlet-menu-card" style={{ textDecoration: 'none' }}>
                    <div className="outlet-menu-card-img">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 78vw, 270px"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Coffee className="w-10 h-10" style={{ color: 'rgba(201,148,58,0.5)' }} />
                        </div>
                      )}
                    </div>
                    <div className="outlet-menu-card-body">
                      <p className="outlet-menu-cat">{item.category_name}</p>
                      <p className="outlet-menu-name">{item.name}</p>
                      {item.display_price && <p className="outlet-menu-price">{item.display_price}</p>}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="outlet-sub mb-6">Fresh coffee, food and desserts are served at this outlet — explore the full menu for today&apos;s availability.</p>
            )}

            <div className="outlet-menu-cta mt-9 flex justify-center">
              <a href={menuUrl} className="outlet-btn outlet-btn-primary">
                View {shortName || outlet.name} Menu <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ── STEP INSIDE GALLERY ──────────────────────────────── */}
        {galleryImages.length > 0 && (
          <section className="outlet-section">
            <div className="outlet-section-glow" />
            <div className="outlet-section-inner">
              <div className="outlet-center-head">
                <p className="outlet-eyebrow">Inside the Outlet</p>
                <h2 className="font-heading outlet-h2">Step Inside Our {shortName || outlet.name} Cafe</h2>
              </div>

              <div className={`outlet-gallery-grid count-${Math.min(featuredImages.length, 3)}`}>
                {featuredImages.map((img, i) => (
                  <div key={img.id} className={`outlet-gallery-item ${i === 0 ? 'outlet-gallery-main' : ''}`}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes={i === 0 ? '(max-width: 768px) 100vw, 55vw' : '(max-width: 768px) 100vw, 40vw'}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>

              {extraImages.length > 0 && (
                <div className="outlet-gallery-strip mt-5">
                  {extraImages.map((img) => (
                    <div key={img.id} className="outlet-gallery-thumb">
                      <Image src={img.src} alt={img.alt} fill sizes="220px" style={{ objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── FACILITIES & COMFORT ─────────────────────────────── */}
        {facilities.length > 0 && (
          <section className="outlet-section">
            <div className="outlet-section-glow" />
            <div className="outlet-section-inner">
              <div className="outlet-center-head">
                <p className="outlet-eyebrow">At This Outlet</p>
                <h2 className="font-heading outlet-h2">Facilities &amp; Comfort</h2>
              </div>
              <div className="outlet-facility-grid">
                {facilities.map((key) => {
                  const { label, Icon } = FACILITY_META[key]
                  return (
                    <div key={key} className="outlet-facility">
                      <div className="outlet-facility-icon">
                        <Icon style={{ width: 18, height: 18, color: '#C9943A' }} />
                      </div>
                      <span className="outlet-facility-label">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── PRIVATE EVENTS insert — all outlet pages ─────────── */}
        <section className="outlet-section">
          <div className="outlet-section-glow" />
          <div className="outlet-section-inner">
            <div className="outlet-event outlet-fade-up">
              <div className="outlet-event-glow" />
              <div className="outlet-event-dots" />
              <div className="outlet-event-inner relative z-10 max-w-2xl mx-auto">
                <p className="outlet-eyebrow" style={{ color: '#C9943A', marginBottom: '1rem' }}>Private Events</p>
                <h2 className="font-heading" style={{ fontSize: 'clamp(1.6rem,3.4vw,2.6rem)', fontWeight: 900, color: '#FFF7ED', lineHeight: 1.1, marginBottom: '1.15rem' }}>
                  Space for Your Next Gathering
                </h2>
                <p style={{ color: '#E6C7A8', lineHeight: 1.7, marginBottom: '2rem' }}>
                  {initialContent.event_space_text
                    ? initialContent.event_space_text
                    : slug === 'koramangala'
                      ? 'Planning a birthday, team gathering or celebration in Koramangala? Explore our dedicated first-floor event space with a 100-seat capacity and discuss the arrangements for your date.'
                      : `Planning a gathering at our ${shortName} cafe? Share your preferred date, group size and occasion to discuss the seating and arrangements available at this location.`}
                </p>
                <a href={`/private-events#${slug}`} className="outlet-event-btn">
                  <CalendarRange className="w-4 h-4" /> {slug === 'koramangala' ? 'Explore Koramangala Event Space' : 'Enquire About Events'}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ───────────────────────────────────────── */}
        <div className="outlet-transition" />
        <section className="outlet-cta">
          <div className="outlet-cta-glow" />
          <div className="outlet-cta-dots" />
          <div className="outlet-cta-ring outlet-drift" />
          <div className="outlet-cta-inner">
            <p className="outlet-cta-eyebrow outlet-fade-up">Visit Us Today</p>
            <h2 className="font-heading outlet-cta-title outlet-fade-up outlet-stagger-1">
              Visit Big Bean Cafe {shortName}
            </h2>
            <p className="outlet-cta-desc outlet-fade-up outlet-stagger-2">
              {outlet.address}
            </p>
            <div className="outlet-cta-btns outlet-fade-up outlet-stagger-3">
              {mapsHref && (
                <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="outlet-cta-btn">
                  <Navigation className="w-4 h-4" /> Get Directions
                </a>
              )}
              {outlet.phone && (
                <a href={`tel:${outlet.phone}`} className="outlet-cta-btn outlet-cta-btn-outline">
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              )}
            </div>
            <div className="mt-8 outlet-fade-up outlet-stagger-4">
              <a href="/outlets" className="outlet-back justify-center" style={{ color: '#C7A489' }}>
                <ArrowLeft className="w-4 h-4" /> Back to All Outlets
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
