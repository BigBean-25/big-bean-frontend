'use client'

import { useEffect, useState, useRef } from 'react'
import { Calendar, MapPin, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

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

const CARD_W = 300
const CARD_GAP = 24
const VISIBLE = 3

export default function EventsPreview() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [active, setActive] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
  const maxIdx = Math.max(0, display.length - VISIBLE)

  const go = (dir: number) => setActive(p => Math.max(0, Math.min(maxIdx, p + dir)))

  useEffect(() => {
    if (display.length <= VISIBLE) return
    intervalRef.current = setInterval(() => setActive(p => (p >= maxIdx ? 0 : p + 1)), 4500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [display.length, maxIdx])

  const pause = () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  const resume = () => {
    if (display.length <= VISIBLE) return
    intervalRef.current = setInterval(() => setActive(p => (p >= maxIdx ? 0 : p + 1)), 4500)
  }

  if (!loading && (error || events.length === 0)) return null

  return (
    <section style={{ background: 'linear-gradient(180deg,#100704 0%,#1A0D07 55%,#0E0704 100%)', padding: '5.5rem 0 6rem', position: 'relative', overflow: 'hidden' }}>

      {/* Subtle dot-grid overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(201,148,58,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9943A', marginBottom: '0.75rem' }}>
              What&apos;s On
            </p>
            <h2 className="font-heading" style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', fontWeight: 800, color: '#FFF7ED', lineHeight: 1.15, marginBottom: '0.75rem' }}>
              Upcoming Events
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,247,237,0.58)', maxWidth: '500px', lineHeight: 1.72 }}>
              Join our café experiences, workshops and community events.
            </p>
          </div>
          <a href="/events"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'transparent', color: '#C9943A', border: '1.5px solid #C9943A', borderRadius: '100px', padding: '0.7rem 1.8rem', fontSize: '0.8rem', fontWeight: 800, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.22s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#C9943A'; (e.currentTarget as HTMLElement).style.color = '#0E0704' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#C9943A' }}>
            View All <ArrowRight style={{ width: 14, height: 14 }} />
          </a>
        </div>

        {/* ── Carousel ── */}
        {loading ? (
          <div style={{ display: 'flex', gap: `${CARD_GAP}px` }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: '0 0 300px', height: '400px', borderRadius: '22px', background: 'rgba(255,247,237,0.05)', border: '1px solid rgba(201,148,58,0.12)' }} />
            ))}
          </div>
        ) : (
          <div onMouseEnter={pause} onMouseLeave={resume}>
            {/* Track */}
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                display: 'flex',
                gap: `${CARD_GAP}px`,
                transform: `translateX(-${active * (CARD_W + CARD_GAP)}px)`,
                transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
              }}>
                {display.map((ev, i) => {
                  const imgUrl = getImageUrl(ev.image)
                  const dateObj = fmtDate(ev.event_date)
                  const timeStr = fmtTime(ev.start_time, ev.end_time, ev.display_time_label)
                  const loc = ev.outlet_name || ev.location || 'Big Bean Café'
                  return (
                    <div key={ev.id}
                      style={{ flex: `0 0 ${CARD_W}px`, height: '420px', borderRadius: '22px', overflow: 'hidden', position: 'relative', background: '#1A0D07', boxShadow: '0 24px 64px rgba(0,0,0,0.55)', border: '1px solid rgba(201,148,58,0.15)', cursor: 'pointer', transition: 'transform 0.28s ease, box-shadow 0.28s ease', animationDelay: `${i * 0.08}s` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-10px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 40px 90px rgba(0,0,0,0.7)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 24px 64px rgba(0,0,0,0.55)' }}>

                      {/* Full poster bg */}
                      {imgUrl ? (
                        <img src={imgUrl} alt={ev.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, #2A120B ${i * 12}%, #6B3520, #C9943A)` }}>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.12 }}>
                            <Calendar style={{ width: 80, height: 80, color: '#FFF7ED' }} />
                          </div>
                        </div>
                      )}

                      {/* Gradient overlay bottom */}
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,4,2,0.97) 0%, rgba(10,4,2,0.6) 45%, rgba(10,4,2,0.1) 75%, transparent 100%)' }} />

                      {/* Date badge top-right */}
                      {dateObj && (
                        <div style={{ position: 'absolute', top: 16, right: 16, background: '#C9943A', borderRadius: '12px', padding: '6px 10px', textAlign: 'center', minWidth: '44px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
                          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0E0704', lineHeight: 1 }}>{dateObj.day}</div>
                          <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#0E0704', letterSpacing: '0.04em' }}>{dateObj.month}</div>
                        </div>
                      )}

                      {/* Price badge top-left */}
                      {ev.price && (
                        <div style={{ position: 'absolute', top: 16, left: 16, background: '#A92517', color: '#FFF7ED', borderRadius: '20px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 800, boxShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
                          {ev.price}
                        </div>
                      )}

                      {/* Content bottom */}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.4rem' }}>
                        <h3 className="font-heading" style={{ fontSize: '1.12rem', fontWeight: 800, color: '#FFF7ED', lineHeight: 1.28, marginBottom: '0.55rem' }}>
                          {ev.title}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
                          {timeStr && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: 'rgba(255,247,237,0.65)' }}>
                              <Clock style={{ width: 11, height: 11, flexShrink: 0, color: '#C9943A' }} />{timeStr}
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: 'rgba(255,247,237,0.65)' }}>
                            <MapPin style={{ width: 11, height: 11, flexShrink: 0, color: '#C9943A' }} />{loc}
                          </div>
                        </div>
                        <a href={ev.booking_url || '/events'}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: ev.status === 'booking_open' ? '#C9943A' : '#5F4A3A', color: ev.status === 'booking_open' ? '#0E0704' : '#FFF7ED', borderRadius: '100px', padding: '0.52rem 1.2rem', fontSize: '0.72rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'background 0.2s, transform 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ev.status === 'booking_open' ? '#FFF7ED' : '#7A5A48'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ev.status === 'booking_open' ? '#C9943A' : '#5F4A3A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                          {ev.status === 'booking_open' ? 'Book Tickets' : 'View Details'}
                          <ArrowRight style={{ width: 11, height: 11 }} />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Controls */}
            {display.length > VISIBLE && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2rem', marginTop: '2.5rem' }}>
                <button onClick={() => go(-1)} disabled={active === 0}
                  style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px solid rgba(201,148,58,0.4)', background: active === 0 ? 'rgba(201,148,58,0.05)' : 'rgba(201,148,58,0.12)', color: active === 0 ? 'rgba(201,148,58,0.3)' : '#C9943A', cursor: active === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (active > 0) (e.currentTarget as HTMLElement).style.background = '#C9943A'; if (active > 0) (e.currentTarget as HTMLElement).style.color = '#0E0704' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = active === 0 ? 'rgba(201,148,58,0.05)' : 'rgba(201,148,58,0.12)'; (e.currentTarget as HTMLElement).style.color = active === 0 ? 'rgba(201,148,58,0.3)' : '#C9943A' }}>
                  <ChevronLeft style={{ width: 18, height: 18 }} />
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                    <button key={i} onClick={() => setActive(i)}
                      style={{ width: i === active ? 24 : 8, height: 8, borderRadius: '100px', background: i === active ? '#C9943A' : 'rgba(201,148,58,0.28)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease' }} />
                  ))}
                </div>

                <button onClick={() => go(1)} disabled={active === maxIdx}
                  style={{ width: 42, height: 42, borderRadius: '50%', border: '1.5px solid rgba(201,148,58,0.4)', background: active === maxIdx ? 'rgba(201,148,58,0.05)' : 'rgba(201,148,58,0.12)', color: active === maxIdx ? 'rgba(201,148,58,0.3)' : '#C9943A', cursor: active === maxIdx ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => { if (active < maxIdx) (e.currentTarget as HTMLElement).style.background = '#C9943A'; if (active < maxIdx) (e.currentTarget as HTMLElement).style.color = '#0E0704' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = active === maxIdx ? 'rgba(201,148,58,0.05)' : 'rgba(201,148,58,0.12)'; (e.currentTarget as HTMLElement).style.color = active === maxIdx ? 'rgba(201,148,58,0.3)' : '#C9943A' }}>
                  <ChevronRight style={{ width: 18, height: 18 }} />
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
