'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import Link from 'next/link'
import { MapPin, Phone, Clock, Navigation, Search, Store, ArrowRight, Coffee, X, ExternalLink, Sparkles, BadgeCheck } from 'lucide-react'
import s from './OutletsClient.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

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

interface OutletHero {
  id: number
  eyebrow: string
  title: string
  highlight_text: string | null
  subtitle: string | null
  button_primary_text: string
  button_primary_url: string
  button_secondary_text: string
  button_secondary_url: string
  image: string | null
  stat_1_value: string
  stat_1_label: string
  stat_2_value: string
  stat_2_label: string
  stat_3_value: string
  stat_3_label: string
}

const FILTER_CHIPS = [
  { label: 'All Outlets', value: 'all' },
  { label: 'Open Now', value: 'open' },
  { label: 'Nearby', value: 'nearby' },
  { label: 'Family Friendly', value: 'family' },
  { label: 'Work Friendly', value: 'work' },
]

export default function Outlets() {
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeChip, setActiveChip] = useState('all')
  const [hero, setHero] = useState<OutletHero | null>(null)

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    const load = async () => {
      setLoading(true)
      try {
        const [heroRes, outletsRes] = await Promise.all([
          fetch(`${API_URL}/outlet-hero/active`, { signal: controller.signal }),
          fetch(`${API_URL}/outlets`, { signal: controller.signal }),
        ])

        const [heroJson, outletsJson] = await Promise.all([
          heroRes.json().catch(() => null),
          outletsRes.json().catch(() => null),
        ])

        if (!mounted) return

        if (heroJson?.success && heroJson?.data) setHero(heroJson.data)

        const list: Outlet[] = Array.isArray(outletsJson)
          ? outletsJson
          : Array.isArray(outletsJson?.data)
          ? outletsJson.data
          : []

        const getOutletPriority = (outlet: Outlet) => {
          const name = (outlet.name || '').toLowerCase()
          const slug = (outlet.slug || '').toLowerCase()
          if (slug.includes('koramangala') || name.includes('koramangala')) return 0
          return 1
        }

        const active = list
          .filter((o) => o.status === 'active')
          .sort((a, b) => {
            const priorityDiff = getOutletPriority(a) - getOutletPriority(b)
            if (priorityDiff !== 0) return priorityDiff
            return a.sort_order - b.sort_order || b.id - a.id
          })

        setOutlets(active)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false; controller.abort() }
  }, [])

  const filteredOutlets = outlets.filter(outlet => {
    const q = searchTerm.toLowerCase()
    if (!q && activeChip === 'all') return true
    const matchSearch = !q ||
      outlet.name.toLowerCase().includes(q) ||
      outlet.address.toLowerCase().includes(q)
    return matchSearch
  })

  const heroImg = getImageUrl(hero?.image)

  return (
    <div className="min-h-screen" style={{ background: '#FBF4EC' }}>
      <Header />

      <main>
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section style={{ position: 'relative', minHeight: 520, display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg,#120905 0%,#2A120B 55%,#5C2E12 100%)', overflow: 'hidden', padding: '6rem 0 5rem' }}>
          {/* Dot pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(201,148,58,0.08) 1px,transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none', zIndex: 1 }} />
          {/* Gold glow */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.11),transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: heroImg ? '1fr 1fr' : '1fr', gap: '3.5rem', alignItems: 'center' }}>
            {/* Left */}
            <div style={{ maxWidth: heroImg ? '100%' : 680 }}>
              {/* Eyebrow */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,148,58,0.14)', border: '1px solid rgba(201,148,58,0.32)', borderRadius: 100, padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
                <MapPin style={{ width: 13, height: 13, color: '#C9943A' }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.22em', color: '#F3D59B', textTransform: 'uppercase' }}>
                  {hero?.eyebrow || 'Big Bean Café Outlets'}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading" style={{ fontSize: 'clamp(2.2rem,4.5vw,3.6rem)', fontWeight: 900, color: '#FFF7ED', lineHeight: 1.07, marginBottom: '1.2rem' }}>
                {hero?.title || 'Find Your Favourite'}
                {hero?.highlight_text && (
                  <span style={{ display: 'block', background: 'linear-gradient(90deg,#F6D58D,#C9943A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {hero.highlight_text}
                  </span>
                )}
                {!hero && (
                  <span style={{ display: 'block', background: 'linear-gradient(90deg,#F6D58D,#C9943A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Big Bean Café
                  </span>
                )}
              </h1>

              {/* Subtitle */}
              <p style={{ fontSize: '1rem', color: '#C7A489', lineHeight: 1.8, maxWidth: 500, marginBottom: '2rem' }}>
                {hero?.subtitle || 'Discover warm café spaces across Bengaluru for coffee, food, work, conversations, and memorable moments.'}
              </p>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <a href={hero?.button_primary_url || '#outlet-list'}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#C9943A', color: '#120905', borderRadius: 100, padding: '0.82rem 1.8rem', fontSize: '0.76rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 10px 28px rgba(201,148,58,0.32)', transition: 'all 0.22s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F6D58D'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C9943A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                  <MapPin style={{ width: 14, height: 14 }} />
                  {hero?.button_primary_text || 'Find Nearby Outlet'}
                </a>
                <a href={hero?.button_secondary_url || 'https://bigbeancafe.store'} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: '#FFF7ED', borderRadius: 100, padding: '0.82rem 1.8rem', fontSize: '0.76rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em', border: '1.5px solid rgba(255,255,255,0.28)', transition: 'all 0.22s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                  {hero?.button_secondary_text || 'Order Online'} <ExternalLink style={{ width: 13, height: 13 }} />
                </a>
              </div>

              {/* Stats glass strip */}
              <div style={{ display: 'inline-flex', gap: 0, background: 'rgba(255,247,237,0.07)', border: '1px solid rgba(201,148,58,0.22)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(8px)' }}>
                {[
                  { val: hero?.stat_1_value || '7+', lbl: hero?.stat_1_label || 'Outlets' },
                  { val: hero?.stat_2_value || 'Bengaluru', lbl: hero?.stat_2_label || 'Locations' },
                  { val: hero?.stat_3_value || 'Daily', lbl: hero?.stat_3_label || 'Fresh Brews' },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '0.85rem 1.5rem', borderRight: i < 2 ? '1px solid rgba(201,148,58,0.18)' : 'none', textAlign: 'center' }}>
                    <div className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#F6D58D', lineHeight: 1.1 }}>{s.val}</div>
                    <div style={{ fontSize: '0.65rem', color: '#C7A489', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero image */}
            {heroImg && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: 460, height: 420, borderRadius: 36, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 40px 100px rgba(18,9,5,0.5)', position: 'relative' }}
                  onMouseEnter={e => { const img = (e.currentTarget as HTMLElement).querySelector('img'); if (img) img.style.transform = 'scale(1.04)' }}
                  onMouseLeave={e => { const img = (e.currentTarget as HTMLElement).querySelector('img'); if (img) img.style.transform = 'scale(1)' }}>
                  <img src={heroImg} alt="Outlet" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} />
                  {/* Floating badge */}
                  <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(18,9,5,0.82)', backdropFilter: 'blur(10px)', borderRadius: 14, padding: '0.65rem 1rem', border: '1px solid rgba(201,148,58,0.3)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#F6D58D' }}>Visit your nearby outlet</div>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(199,164,137,0.8)', marginTop: 2 }}>Fresh coffee • Good vibes</div>
                  </div>
                </div>
              </div>
            )}
            {!heroImg && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: 380, height: 380, borderRadius: 36, background: 'linear-gradient(135deg,rgba(201,148,58,0.14),rgba(92,46,18,0.32))', border: '1px solid rgba(201,148,58,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 32px 80px rgba(18,9,5,0.28)' }}>
                  <Store style={{ width: 80, height: 80, color: 'rgba(201,148,58,0.4)' }} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── FLOATING SEARCH CARD ─────────────────────────────────── */}
        <div style={{ maxWidth: 1100, margin: '-45px auto 0', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
          <div style={{ background: '#FFF7ED', border: '1px solid #E6C7A8', borderRadius: 28, padding: '1.5rem 2rem', boxShadow: '0 20px 60px rgba(61,31,13,0.12)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Search input */}
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#8B5A3C' }} />
                <input
                  type="text"
                  placeholder="Search outlets by area, name or address..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', background: '#FBF4EC', border: '1.5px solid #E6C7A8', borderRadius: 100, padding: '0.85rem 3rem 0.85rem 3rem', fontSize: '0.9rem', color: '#3D1F0D', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#C9943A')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E6C7A8')}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <X style={{ width: 15, height: 15, color: '#9B6B50' }} />
                  </button>
                )}
              </div>

              {/* Filter chips + count */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {FILTER_CHIPS.map(chip => (
                    <button key={chip.value} onClick={() => { setActiveChip(chip.value); if (chip.value === 'all') setSearchTerm('') }}
                      style={{ borderRadius: 100, padding: '0.4rem 1rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', border: activeChip === chip.value ? '1.5px solid #C9943A' : '1.5px solid #E6C7A8', background: activeChip === chip.value ? '#3D1F0D' : '#FBF4EC', color: activeChip === chip.value ? '#F6D58D' : '#6B3520', transition: 'all 0.18s' }}>
                      {chip.label}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#9B6B50', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Showing {filteredOutlets.length} outlet{filteredOutlets.length !== 1 ? 's' : ''} across Bengaluru
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── OUTLET GRID ──────────────────────────────────────────── */}
        <section id="outlet-list" style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 2rem 3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.22em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Our Locations</p>
            <h2 className="font-heading" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.1, marginBottom: '0.9rem' }}>
              Find a Big Bean Cafe Near You
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#6B3520', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
              Visit your nearest Big Bean Cafe and enjoy the same quality, comfort and hospitality at every outlet.
            </p>
          </div>

          {/* Skeleton */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 28 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ borderRadius: 30, overflow: 'hidden', border: '1px solid #E6C7A8', background: '#fff' }} className="animate-pulse">
                  <div style={{ height: 240, background: '#E6C7A8', opacity: 0.4 }} />
                  <div style={{ padding: '1.4rem' }}>
                    <div style={{ height: 18, background: '#E6C7A8', borderRadius: 8, width: '60%', marginBottom: 12, opacity: 0.5 }} />
                    <div style={{ height: 13, background: '#E6C7A8', borderRadius: 8, width: '90%', marginBottom: 8, opacity: 0.35 }} />
                    <div style={{ height: 13, background: '#E6C7A8', borderRadius: 8, width: '70%', opacity: 0.3 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: 28, background: '#fff', border: '1px solid #E6C7A8' }}>
              <MapPin style={{ width: 52, height: 52, color: '#E6C7A8', margin: '0 auto 1rem' }} />
              <h3 className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 900, color: '#3D1F0D', marginBottom: '0.5rem' }}>Unable to load outlets right now.</h3>
              <p style={{ color: '#9B6B50', marginBottom: '1.5rem' }}>Please try again later.</p>
              <a href="https://bigbeancafe.store" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#C9943A', color: '#120905', borderRadius: 100, padding: '0.75rem 1.8rem', fontSize: '0.78rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Order Online <ExternalLink style={{ width: 13, height: 13 }} />
              </a>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && outlets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: 28, background: '#fff', border: '1px solid #E6C7A8' }}>
              <Store style={{ width: 52, height: 52, color: '#E6C7A8', margin: '0 auto 1rem' }} />
              <h3 className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 900, color: '#3D1F0D', marginBottom: '0.5rem' }}>No outlets added yet.</h3>
              <p style={{ color: '#9B6B50' }}>Admin can add outlets from the dashboard.</p>
            </div>
          )}

          {/* No search results */}
          {!loading && !error && outlets.length > 0 && filteredOutlets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: 28, background: '#fff', border: '1px solid #E6C7A8' }}>
              <Search style={{ width: 52, height: 52, color: '#E6C7A8', margin: '0 auto 1rem' }} />
              <h3 className="font-heading" style={{ fontSize: '1.3rem', fontWeight: 900, color: '#3D1F0D', marginBottom: '0.5rem' }}>No outlets found</h3>
              <p style={{ color: '#9B6B50', marginBottom: '1.5rem' }}>Try another area or clear your search.</p>
              <button onClick={() => { setSearchTerm(''); setActiveChip('all') }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#3D1F0D', color: '#FFF7ED', borderRadius: 100, padding: '0.75rem 1.8rem', fontSize: '0.78rem', fontWeight: 900, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <X style={{ width: 13, height: 13 }} /> Clear Search
              </button>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && filteredOutlets.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 28 }}>
              {filteredOutlets.map(outlet => {
                const imgUrl = getImageUrl(outlet.image)
                const mapsHref = outlet.latitude && outlet.longitude
                  ? `https://www.google.com/maps?q=${outlet.latitude},${outlet.longitude}`
                  : outlet.address
                  ? `https://www.google.com/maps/search/${encodeURIComponent(outlet.address)}`
                  : null

                return (
                  <div key={outlet.id}
                    style={{ borderRadius: 30, overflow: 'hidden', background: '#fff', border: '1px solid #E6C7A8', boxShadow: '0 4px 20px rgba(61,31,13,0.06)', transition: 'all 0.28s', display: 'flex', flexDirection: 'column' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 52px rgba(61,31,13,0.14)'; (e.currentTarget as HTMLElement).style.borderColor = '#C9943A' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(61,31,13,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = '#E6C7A8' }}>

                    {/* Image area */}
                    <div style={{ height: 240, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#3D1F0D,#6B3520,#C9943A)', flexShrink: 0 }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={outlet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Store style={{ width: 52, height: 52, color: 'rgba(255,247,237,0.35)' }} />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,13,7,0.75) 0%, rgba(26,13,7,0.1) 55%, transparent 100%)' }} />
                      {/* Name + status overlay */}
                      <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <h3 className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFF7ED', lineHeight: 1.2, textShadow: '0 1px 6px rgba(0,0,0,0.5)', maxWidth: '75%' }}>{outlet.name}</h3>
                        <span style={{ background: 'rgba(34,197,94,0.88)', color: '#fff', borderRadius: 20, padding: '0.2rem 0.65rem', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0 }}>Active</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.55rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}>
                        <MapPin style={{ width: 14, height: 14, color: '#C9943A', flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: '0.82rem', color: '#6B3520', lineHeight: 1.55 }}>{outlet.address}</span>
                      </div>
                      {outlet.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <Phone style={{ width: 14, height: 14, color: '#C9943A', flexShrink: 0 }} />
                          <a href={`tel:${outlet.phone}`} style={{ fontSize: '0.82rem', color: '#6B3520', textDecoration: 'none' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#C9943A')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#6B3520')}>{outlet.phone}</a>
                        </div>
                      )}
                      {outlet.opening_hours && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}>
                          <Clock style={{ width: 14, height: 14, color: '#C9943A', flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: '0.82rem', color: '#6B3520', lineHeight: 1.55 }}>{outlet.opening_hours}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0 1.4rem 1.4rem' }}>
                      {mapsHref ? (
                        <a href={mapsHref} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#3D1F0D', color: '#FFF7ED', borderRadius: 100, padding: '0.65rem 0.75rem', fontSize: '0.74rem', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.18s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#5C2E12' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#3D1F0D' }}>
                          <Navigation style={{ width: 13, height: 13 }} /> Directions
                        </a>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#E6C7A8', color: '#9B6B50', borderRadius: 100, padding: '0.65rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center' }}>
                          Coming Soon
                        </span>
                      )}
                      {outlet.phone ? (
                        <a href={`tel:${outlet.phone}`}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'transparent', color: '#3D1F0D', border: '1.5px solid #E6C7A8', borderRadius: 100, padding: '0.65rem 0.75rem', fontSize: '0.74rem', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.18s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9943A'; (e.currentTarget as HTMLElement).style.color = '#C9943A' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E6C7A8'; (e.currentTarget as HTMLElement).style.color = '#3D1F0D' }}>
                          <Phone style={{ width: 13, height: 13 }} /> Call
                        </a>
                      ) : (
                        <a href="https://bigbeancafe.store" target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'transparent', color: '#C9943A', border: '1.5px solid #C9943A', borderRadius: 100, padding: '0.65rem 0.75rem', fontSize: '0.74rem', fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.18s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,148,58,0.08)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                          Order Online
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── LOCATOR SECTION ──────────────────────────────────────── */}
        {!loading && !error && outlets.length > 0 && (
          <section className={s.locatorSectionWrapper}>
            <div className={s.locatorSection}>
              <div className={s.locatorGlow} />

              {/* Left content */}
              <div className={s.locatorLeft}>
                <div className={s.locatorBadge}>
                  <Coffee size={13} />
                  <span>Find Us</span>
                </div>
                <h2 className={`font-heading ${s.locatorTitle}`}>
                  Big Bean Café<br />
                  <span>Across Bengaluru</span>
                </h2>
                <p className={s.locatorSubtitle}>
                  From HSR Layout to Koramangala, Electronic City, RR Nagar and more — our outlets are designed for coffee, food, work and conversations.
                </p>
                <a href="#outlet-list" className={s.locatorButton}>
                  <MapPin size={13} /> View All Outlets
                </a>
              </div>

              {/* Right outlet list card */}
              <div className={s.locatorRight}>
                <p className={s.locatorHeading}>Our Outlet Locations</p>
                {outlets.slice(0, 5).map((o) => (
                  <div key={o.id} className={s.locatorItem}>
                    <div className={s.locatorItemIcon}>
                      <MapPin size={14} />
                    </div>
                    <div className={s.locatorItemText}>
                      <div className={s.locatorItemTitle}>{o.name}</div>
                      <div className={s.locatorItemAddress}>{o.address}</div>
                    </div>
                  </div>
                ))}
                {outlets.length > 5 && (
                  <a href="#outlet-list" className={s.locatorMore}>
                    +{outlets.length - 5} more outlets <ArrowRight size={12} />
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── FRANCHISE CTA ────────────────────────────────────────── */}
        <section className={s.franchiseCircleSection}>
          <div className={s.franchiseCircleInner}>
            <div className={s.franchiseCircleDots} />
            <div className={s.franchiseCircleGlow} />
            <span className={`${s.franchiseGoldDot} ${s.franchiseGoldDotOne}`} />
            <span className={`${s.franchiseGoldDot} ${s.franchiseGoldDotTwo}`} />
            <span className={`${s.franchiseGoldDot} ${s.franchiseGoldDotThree}`} />
            <span className={`${s.franchiseGoldDot} ${s.franchiseGoldDotFour}`} />

            <div className={s.franchiseCircleContent}>
              <div className={s.franchiseCircleBadge}>
                <Sparkles size={14} />
                <span>Franchise Opportunity</span>
              </div>

              <h2 className={`font-heading ${s.franchiseCircleTitle}`}>
                Open Your Own <span>Big Bean Café</span>
              </h2>

              <p className={s.franchiseCircleSubtitle}>
                Partner with a growing café brand with proven products, training support, and scalable outlet operations.
              </p>
            </div>

            <div className={s.franchiseOrbit}>
              <div className={s.franchiseCenterCircle}>
                <Coffee size={40} />
              </div>
              <div className={s.franchiseArcLine} />

              <div className={`${s.franchiseOrbitCard} ${s.franchiseOrbitCardOne}`}>
                <div className={s.orbitCardIcon}>
                  <Store size={20} />
                </div>
                <h3 className={`font-heading ${s.orbitCardTitle}`}>Enquiry</h3>
                <p className={s.orbitCardText}>Share your interest and preferred city.</p>
              </div>

              <div className={`${s.franchiseOrbitCard} ${s.franchiseOrbitCardTwo}`}>
                <div className={s.orbitCardIcon}>
                  <MapPin size={20} />
                </div>
                <h3 className={`font-heading ${s.orbitCardTitle}`}>Setup</h3>
                <p className={s.orbitCardText}>Location, training, SOP and launch support.</p>
              </div>

              <div className={`${s.franchiseOrbitCard} ${s.franchiseOrbitCardThree}`}>
                <div className={s.orbitCardIcon}>
                  <BadgeCheck size={20} />
                </div>
                <h3 className={`font-heading ${s.orbitCardTitle}`}>Launch</h3>
                <p className={s.orbitCardText}>Start your café with Big Bean brand support.</p>
              </div>
            </div>

            <div className={s.franchiseCircleActions}>
              <Link href="/franchise" className={s.franchiseCirclePrimary}>
                Explore Franchise <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className={s.franchiseCircleSecondary}>
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
