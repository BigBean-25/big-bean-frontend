'use client'

import { useEffect, useState, useRef } from 'react'
import { Calendar, MapPin, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace(/\/api$/, '')

interface EventItem {
  id: number
  title: string
  description: string | null
  outlet_id: number | null
  outlet_name: string | null
  outlet_address: string | null
  event_date: string | null
  start_time: string | null
  end_time: string | null
  display_time_label: string | null
  location: string | null
  price: string | null
  booking_url: string | null
  image: string | null
  status: string
}

const getImageUrl = (img: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

const fmtDate = (d: string | null) => {
  if (!d) return null
  const date = new Date(`${d}T00:00:00`)
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    full: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  }
}

const fmtTime = (start: string | null, end: string | null, displayTimeLabel?: string | null) => {
  if (displayTimeLabel) return displayTimeLabel
  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
  }
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return fmt(start)
  return null
}

const mapApiEvents = (apiEvents: any[]): EventItem[] => {
  return (apiEvents || []).slice(0, VISIBLE).map(e => {
    const activeDates = (e.dates || [])
      .filter((d: any) => d.status === 'active')
      .sort((a: any, b: any) => a.event_date.localeCompare(b.event_date))
    const firstDate = activeDates[0] || null

    const activePrices = (e.ticket_types || [])
      .filter((t: any) => t.status === 'active')
      .map((t: any) => Number(t.price))
      .filter((p: number) => !isNaN(p))
    const minPrice = activePrices.length ? Math.min(...activePrices) : null
    const priceStr = minPrice === null ? 'Price on request' : minPrice === 0 ? 'Free' : `₹${minPrice}`

    const isOpen = e.display_status === 'booking_open'

    return {
      id: e.id,
      title: e.title,
      description: e.short_description,
      outlet_id: e.outlet?.outlet_id || null,
      outlet_name: e.outlet?.outlet_name || null,
      outlet_address: e.outlet?.outlet_address || null,
      event_date: firstDate?.event_date || null,
      start_time: firstDate?.start_time || null,
      end_time: firstDate?.end_time || null,
      display_time_label: firstDate?.display_time_label || null,
      location: e.outlet?.outlet_name || 'Big Bean Café',
      price: priceStr,
      booking_url: isOpen ? `/events/${e.slug}/book` : `/events/${e.slug}`,
      image: e.event_thumbnail || e.event_banner,
      status: e.display_status || 'booking_open',
    }
  })
}

const CARD_GAP = 24
const VISIBLE = 3   // keep for mapApiEvents slice

export default function EventsPreview() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [active, setActive] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Responsive card width: fills container exactly — no right gap, no left clip
  const [cardW, setCardW] = useState(300)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth
      // containerW = inner width of the 1200px-capped, 1.5rem-padded container
      const containerW = Math.min(vw, 1200) - 48
      if (vw < 640) {
        setCardW(Math.min(280, vw - 40))
        setVisibleCount(1)
      } else if (vw < 1024) {
        setCardW(Math.floor((containerW - CARD_GAP) / 2))
        setVisibleCount(2)
      } else {
        setCardW(Math.floor((containerW - 2 * CARD_GAP) / 3))
        setVisibleCount(3)
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Reset carousel position when breakpoint changes
  useEffect(() => { setActive(0) }, [visibleCount])

  useEffect(() => {
    fetch(`${API_URL}/events/active`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) {
          setEvents(mapApiEvents(d.data))
        } else {
          setEvents([])
        }
      })
      .catch(() => {
        setError(true)
        setEvents([])
      })
      .finally(() => setLoading(false))
  }, [])

  const display = events
  const maxIdx = Math.max(0, display.length - visibleCount)

  const go = (dir: number) => setActive(p => Math.max(0, Math.min(maxIdx, p + dir)))

  useEffect(() => {
    if (display.length <= visibleCount) return
    intervalRef.current = setInterval(() => setActive(p => (p >= maxIdx ? 0 : p + 1)), 4500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [display.length, maxIdx, visibleCount])

  const pause = () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  const resume = () => {
    if (display.length <= visibleCount) return
    intervalRef.current = setInterval(() => setActive(p => (p >= maxIdx ? 0 : p + 1)), 4500)
  }

  if (!loading && (error || events.length === 0)) return null

  return (
    <section className="ep-section" style={{ background: 'linear-gradient(180deg, #FFF7ED 0%, #F6E6D1 100%)', position: 'relative', overflow: 'hidden' }}>

      {/* Warm dot-grid overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(201,148,58,0.13) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9943A', marginBottom: '0.75rem' }}>
              What&apos;s On
            </p>
            <h2 className="font-heading" style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', fontWeight: 800, color: '#3D1F0D', lineHeight: 1.15, marginBottom: '0.75rem' }}>
              Upcoming Events
            </h2>
            <p style={{ fontSize: '1rem', color: '#6B3520', maxWidth: '500px', lineHeight: 1.72 }}>
              Join our café experiences, workshops and community events.
            </p>
          </div>
          <a href="/events"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#3D1F0D', color: '#FFF7ED', border: '1.5px solid #3D1F0D', borderRadius: '100px', padding: '0.7rem 1.8rem', fontSize: '0.8rem', fontWeight: 800, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.22s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#3D1F0D' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#3D1F0D'; (e.currentTarget as HTMLElement).style.color = '#FFF7ED' }}>
            View All <ArrowRight style={{ width: 14, height: 14 }} />
          </a>
        </div>

        {/* ── Carousel ── */}
        {loading ? (
          <div style={{ display: 'flex', gap: `${CARD_GAP}px` }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: `0 0 ${cardW}px`, borderRadius: '22px', overflow: 'hidden', border: '1px solid rgba(201,148,58,0.18)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '240px', background: 'rgba(61,31,13,0.10)' }} />
                <div style={{ flex: 1, padding: '1.1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#1A0D07', opacity: 0.5 }}>
                  <div style={{ height: '14px', width: '80%', borderRadius: '6px', background: '#3D1F0D' }} />
                  <div style={{ height: '10px', width: '60%', borderRadius: '6px', background: '#3D1F0D' }} />
                  <div style={{ height: '10px', width: '50%', borderRadius: '6px', background: '#3D1F0D' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div onMouseEnter={pause} onMouseLeave={resume}>
            {/* Track */}
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                display: 'flex',
                gap: `${CARD_GAP}px`,
                transform: `translateX(-${active * (cardW + CARD_GAP)}px)`,
                transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
              }}>
                {display.map((ev, i) => {
                  const imgUrl = getImageUrl(ev.image)
                  const dateObj = fmtDate(ev.event_date)
                  const timeStr = fmtTime(ev.start_time, ev.end_time, ev.display_time_label)
                  const loc = ev.outlet_name || ev.location || 'Big Bean Café'
                  return (
                    <div key={ev.id}
                      style={{ flex: `0 0 ${cardW}px`, borderRadius: '22px', overflow: 'hidden', position: 'relative', background: '#1A0D07', boxShadow: '0 24px 64px rgba(0,0,0,0.28)', border: '1px solid rgba(201,148,58,0.15)', cursor: 'pointer', transition: 'transform 0.35s ease, box-shadow 0.35s ease', display: 'flex', flexDirection: 'column' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 36px 80px rgba(0,0,0,0.38)';
                        const img = (e.currentTarget as HTMLElement).querySelector('img') as HTMLImageElement | null;
                        if (img) img.style.transform = 'scale(1.035)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 24px 64px rgba(0,0,0,0.28)';
                        const img = (e.currentTarget as HTMLElement).querySelector('img') as HTMLImageElement | null;
                        if (img) img.style.transform = 'scale(1)';
                      }}>

                      {/* ── Image area ── */}
                      <div style={{ position: 'relative', width: '100%', height: '240px', flexShrink: 0, overflow: 'hidden' }}>
                        {imgUrl ? (
                          <img src={imgUrl} alt={ev.title}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', transition: 'transform 0.5s ease' }} />
                        ) : (
                          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #2A120B ${i * 12}%, #6B3520, #C9943A)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar style={{ width: 72, height: 72, color: '#FFF7ED', opacity: 0.18 }} />
                          </div>
                        )}
                        {/* Subtle bottom-edge fade only — does not darken the image */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,4,2,0.18), transparent 35%)', pointerEvents: 'none' }} />

                        {/* Price badge top-left */}
                        {ev.price && (
                          <div style={{ position: 'absolute', top: 14, left: 14, background: '#A92517', color: '#FFF7ED', borderRadius: '20px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 800, boxShadow: '0 2px 10px rgba(0,0,0,0.35)', zIndex: 2 }}>
                            {ev.price}
                          </div>
                        )}

                        {/* Date badge top-right */}
                        {dateObj && (
                          <div style={{ position: 'absolute', top: 14, right: 14, background: '#C9943A', borderRadius: '12px', padding: '6px 10px', textAlign: 'center', minWidth: '44px', boxShadow: '0 4px 16px rgba(0,0,0,0.35)', zIndex: 2 }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0E0704', lineHeight: 1 }}>{dateObj.day}</div>
                            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#0E0704', letterSpacing: '0.04em' }}>{dateObj.month}</div>
                          </div>
                        )}
                      </div>

                      {/* ── Content area ── */}
                      <div style={{ flex: 1, background: '#1A0D07', padding: '1.1rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column' }}>
                        <h3 className="font-heading" style={{ fontSize: '1.08rem', fontWeight: 800, color: '#FFF7ED', lineHeight: 1.28, marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {ev.title}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem', marginBottom: '0.7rem' }}>
                          {timeStr && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'rgba(255,247,237,0.72)' }}>
                              <Clock style={{ width: 11, height: 11, flexShrink: 0, color: '#C9943A' }} />{timeStr}
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.74rem', color: 'rgba(255,247,237,0.72)' }}>
                            <MapPin style={{ width: 11, height: 11, flexShrink: 0, color: '#C9943A', marginTop: '2px' }} />
                            <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{loc}</span>
                          </div>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                          <a href={ev.booking_url || '/events'}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: ev.status === 'booking_open' ? '#C9943A' : '#5F4A3A', color: ev.status === 'booking_open' ? '#0E0704' : '#FFF7ED', borderRadius: '100px', padding: '0 1.15rem', height: '42px', fontSize: '0.72rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'background 0.2s, transform 0.2s', whiteSpace: 'nowrap' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ev.status === 'booking_open' ? '#E8A83A' : '#7A5A48'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ev.status === 'booking_open' ? '#C9943A' : '#5F4A3A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                            {ev.status === 'booking_open' ? 'Book Tickets' : 'View Details'}
                            <ArrowRight style={{ width: 12, height: 12 }} />
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Controls — visible on cream background */}
            {maxIdx > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2rem', marginTop: '2.5rem' }}>
                <button onClick={() => go(-1)} disabled={active === 0}
                  style={{ width: 42, height: 42, borderRadius: '50%', border: `1.5px solid ${active === 0 ? 'rgba(61,31,13,0.18)' : 'rgba(61,31,13,0.45)'}`, background: active === 0 ? 'rgba(61,31,13,0.04)' : 'rgba(61,31,13,0.09)', color: active === 0 ? 'rgba(61,31,13,0.25)' : '#3D1F0D', cursor: active === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (active > 0) { (e.currentTarget as HTMLElement).style.background = '#3D1F0D'; (e.currentTarget as HTMLElement).style.color = '#FFF7ED' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = active === 0 ? 'rgba(61,31,13,0.04)' : 'rgba(61,31,13,0.09)'; (e.currentTarget as HTMLElement).style.color = active === 0 ? 'rgba(61,31,13,0.25)' : '#3D1F0D' }}>
                  <ChevronLeft style={{ width: 18, height: 18 }} />
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                    <button key={i} onClick={() => setActive(i)}
                      style={{ width: i === active ? 24 : 8, height: 8, borderRadius: '100px', background: i === active ? '#C9943A' : 'rgba(61,31,13,0.22)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />
                  ))}
                </div>

                <button onClick={() => go(1)} disabled={active === maxIdx}
                  style={{ width: 42, height: 42, borderRadius: '50%', border: `1.5px solid ${active === maxIdx ? 'rgba(61,31,13,0.18)' : 'rgba(61,31,13,0.45)'}`, background: active === maxIdx ? 'rgba(61,31,13,0.04)' : 'rgba(61,31,13,0.09)', color: active === maxIdx ? 'rgba(61,31,13,0.25)' : '#3D1F0D', cursor: active === maxIdx ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (active < maxIdx) { (e.currentTarget as HTMLElement).style.background = '#3D1F0D'; (e.currentTarget as HTMLElement).style.color = '#FFF7ED' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = active === maxIdx ? 'rgba(61,31,13,0.04)' : 'rgba(61,31,13,0.09)'; (e.currentTarget as HTMLElement).style.color = active === maxIdx ? 'rgba(61,31,13,0.25)' : '#3D1F0D' }}>
                  <ChevronRight style={{ width: 18, height: 18 }} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Responsive section padding */}
      <style>{`
        .ep-section { padding: 5.5rem 0 6rem; }
        @media (max-width: 1023px) { .ep-section { padding: 4rem 0 4.5rem; } }
        @media (max-width: 767px)  { .ep-section { padding: 3rem 0 3.5rem; } }
      `}</style>
    </section>
  )
}
