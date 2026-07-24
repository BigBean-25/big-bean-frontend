'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import apiRequest from '@/lib/api'
import {
  Search, Calendar, Clock, MapPin, ChevronDown, X,
  ArrowRight, Ticket, Coffee
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

interface EventOutlet {
  id?: number
  outlet_id?: number | null
  outlet_name: string
  outlet_address: string | null
  city: string | null
  map_url: string | null
  latitude: string | null
  longitude: string | null
}

interface MasterOutlet {
  id: number
  name: string
  slug: string
  address: string | null
  city: string | null
  status: string
}

interface EventDate {
  id: number
  event_date: string
  start_time: string
  end_time: string | null
  door_open_time: string | null
  display_time_label: string | null
  total_seats: number
  available_seats: number
  status: string
}

interface EventTicket {
  id: number
  ticket_name: string
  ticket_description: string | null
  price: number
  mrp: number | null
  total_quantity: number
  available_quantity: number
  max_per_booking: number
  status: string
}

interface EventsHero {
  id: number
  eyebrow: string | null
  title: string | null
  subtitle: string | null
  button_text: string | null
  button_link: string | null
  image: string | null
  overlay_opacity: number | null
  status: string
}

interface Event {
  id: number
  title: string
  slug: string
  category: string | null
  short_description: string | null
  description: string | null
  event_banner: string | null
  event_thumbnail: string | null
  status: string
  display_status: 'booking_open' | 'sold_out' | 'closed' | null
  is_featured: boolean
  sort_order: number
  language: string | null
  duration: string | null
  ticket_age_rule: string | null
  entry_age_rule: string | null
  layout_type: string | null
  seating_type: string | null
  kid_friendly: boolean
  pets_allowed: boolean
  terms_conditions: string | null
  cancellation_policy: string | null
  entry_policy: string | null
  outlet: EventOutlet | null
  dates: EventDate[]
  ticket_types: EventTicket[]
}

const getImageUrl = (img: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

const formatTime = (time: string | null) => {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

const formatTimeRange = (start: string, end: string | null, displayTimeLabel?: string | null) => {
  if (displayTimeLabel) return displayTimeLabel
  if (!end) return formatTime(start)
  return `${formatTime(start)} - ${formatTime(end)}`
}

const formatDate = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getLocalDateStr = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const getMinPrice = (tickets: EventTicket[]) => {
  const active = tickets.filter(t => t.status === 'active')
  if (!active.length) return null
  const min = Math.min(...active.map(t => t.price))
  return min
}

const getSeatsLeft = (dates: EventDate[]) => {
  return dates
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + (Number(d.available_seats) || 0), 0)
}

const getEventStatusLabel = (event: Event) => {
  if (event.display_status === 'closed') return 'Closed'
  if (event.display_status === 'sold_out') return 'Sold Out'
  const seats = getSeatsLeft(event.dates)
  if (seats <= 0) return 'Sold Out'
  return 'Booking Open'
}

const getCardDateText = (event: Event) => {
  const dates = event.dates.filter(d => d.status !== 'inactive' && d.status !== 'cancelled')
  if (!dates.length) return 'Date TBA'
  const sorted = [...dates].sort((a, b) => a.event_date.localeCompare(b.event_date))
  const first = sorted[0]
  if (sorted.length === 1) {
    return `${formatDate(first.event_date)} · ${formatTimeRange(first.start_time, first.end_time, first.display_time_label)}`
  }
  return `${formatDate(first.event_date)} onwards, Multiple Dates`
}

const getCardTimeText = (event: Event) => {
  const dates = event.dates.filter(d => d.status !== 'inactive' && d.status !== 'cancelled')
  if (!dates.length) return ''
  const sorted = [...dates].sort((a, b) => a.event_date.localeCompare(b.event_date))
  const first = sorted[0]
  return formatTimeRange(first.start_time, first.end_time, first.display_time_label)
}

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [outlet, setOutlet] = useState('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [status, setStatus] = useState<'all' | 'open' | 'sold_out' | 'closed'>('all')
  const [allOutlets, setAllOutlets] = useState<MasterOutlet[]>([])
  const [hero, setHero] = useState<EventsHero | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(false)
    Promise.all([
      apiRequest('/events/active').then(r => r.json()),
      apiRequest('/events/outlets').then(r => r.json()),
      apiRequest('/events-hero/active').then(r => r.json())
    ])
      .then(([eventsRes, outletsRes, heroRes]) => {
        if (!eventsRes.success || !outletsRes.success) throw new Error('Failed to load')
        setEvents(eventsRes.data || [])
        setAllOutlets(outletsRes.data || [])
        setHero(heroRes.data || null)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    events.forEach(e => { if (e.category) set.add(e.category) })
    return Array.from(set).sort()
  }, [events])

  const outletOptions = useMemo(() => {
    return allOutlets.map(o => ({ id: o.id, name: o.name }))
  }, [allOutlets])

  const filtered = useMemo(() => {
    return events.filter(event => {
      const term = search.toLowerCase().trim()
      const matchesSearch = !term ||
        event.title.toLowerCase().includes(term) ||
        (event.category || '').toLowerCase().includes(term) ||
        (event.outlet?.outlet_name || '').toLowerCase().includes(term) ||
        (event.outlet?.city || '').toLowerCase().includes(term)

      const matchesCategory = category === 'all' || event.category === category
      const selectedOutlet = allOutlets.find(o => o.id.toString() === outlet)
      const matchesOutlet = outlet === 'all' || (() => {
        if (event.outlet?.outlet_id && event.outlet.outlet_id.toString() === outlet) return true
        if (selectedOutlet && event.outlet?.outlet_name) {
          return event.outlet.outlet_name.trim().toLowerCase() === selectedOutlet.name.toLowerCase()
        }
        return false
      })()

      let matchesDate = true
      if (dateFilter !== 'all') {
        const today = new Date()
        const todayStr = getLocalDateStr(today)
        const activeDates = event.dates.filter(d => d.status !== 'inactive' && d.status !== 'cancelled')
        matchesDate = activeDates.some(d => {
          if (dateFilter === 'today') return d.event_date === todayStr
          if (dateFilter === 'month') {
            const dObj = new Date(`${d.event_date}T00:00:00`)
            return dObj.getMonth() === today.getMonth() && dObj.getFullYear() === today.getFullYear()
          }
          if (dateFilter === 'week') {
            const day = today.getDay()
            const daysUntilMon = (day === 0 ? -6 : 1 - day)
            const daysUntilSun = (7 - day) % 7
            const mon = new Date(today); mon.setDate(today.getDate() + daysUntilMon)
            const sun = new Date(today); sun.setDate(today.getDate() + daysUntilSun)
            const monStr = getLocalDateStr(mon)
            const sunStr = getLocalDateStr(sun)
            return d.event_date >= monStr && d.event_date <= sunStr
          }
          return true
        })
      }

      let matchesStatus = true
      if (status !== 'all') {
        if (status === 'open') matchesStatus = event.display_status === 'booking_open'
        if (status === 'sold_out') matchesStatus = event.display_status === 'sold_out'
        if (status === 'closed') matchesStatus = event.display_status === 'closed'
      }

      return matchesSearch && matchesCategory && matchesOutlet && matchesDate && matchesStatus
    })
  }, [events, search, category, outlet, dateFilter, status])

  const hasFilters = search || category !== 'all' || outlet !== 'all' || dateFilter !== 'all' || status !== 'all'
  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    setOutlet('all')
    setDateFilter('all')
    setStatus('all')
  }

  return (
    <div className="min-h-screen bg-[#F7EFE7]">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[300px] sm:min-h-[420px] lg:min-h-[520px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
            style={{
              backgroundImage: hero?.image
                ? `url(${getImageUrl(hero.image)})`
                : 'linear-gradient(135deg, #3D1F0D 0%, #5A2D1D 40%, #C9943A 100%)',
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#3D1F0D]/90 via-[#3D1F0D]/70 to-[#C9943A]/25"
            style={{ opacity: hero?.overlay_opacity ?? 0.75 }}
          />
          <div className="relative mx-auto flex min-h-[300px] max-w-7xl flex-col items-center justify-center px-6 py-16 text-center sm:min-h-[420px] sm:py-20 lg:min-h-[520px] lg:py-24">
            <p
              className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9943A]/40 bg-[#C9943A]/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#C9943A] backdrop-blur-sm"
            >
              <Coffee className="h-3.5 w-3.5" /> {hero?.eyebrow || 'Big Bean Café'}
            </p>
            <h1
              className="font-heading animate-fade-up-slow text-4xl font-extrabold text-[#FFF7ED] drop-shadow-lg sm:text-5xl lg:text-6xl"
              style={{ animationDelay: '120ms' }}
            >
              {hero?.title || 'Big Bean Cafe Events'}
            </h1>
            <p
              className="animate-fade-up mx-auto mt-5 max-w-2xl text-lg text-[#FFF7ED]/80 sm:text-xl"
              style={{ animationDelay: '220ms' }}
            >
              {hero?.subtitle || 'Workshops, live nights, coffee experiences and community meetups.'}
            </p>
            {hero?.button_text && hero?.button_link && (
              <Link
                href={hero.button_link}
                className="animate-fade-up mt-8 inline-flex items-center gap-2 rounded-full bg-[#C9943A] px-7 py-3.5 text-sm font-black uppercase tracking-wider text-[#3D1F0D] shadow-[0_8px_24px_rgba(201,148,58,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFF7ED] hover:shadow-[0_12px_32px_rgba(201,148,58,0.45)]"
                style={{ animationDelay: '320ms' }}
              >
                {hero.button_text} <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            {/* Floating badges */}
            <div className="pointer-events-none absolute inset-0 hidden lg:block">
              <div
                className="absolute left-[8%] top-[20%] flex h-14 w-14 animate-float items-center justify-center rounded-2xl bg-[#FFF7ED]/10 text-[#C9943A] shadow-[0_8px_30px_rgba(61,31,13,0.2)] backdrop-blur-sm"
                style={{ animationDelay: '0ms' }}
              >
                <Coffee className="h-6 w-6" />
              </div>
              <div
                className="absolute right-[10%] top-[30%] flex h-16 w-16 animate-float-slow items-center justify-center rounded-2xl bg-[#FFF7ED]/10 text-[#C9943A] shadow-[0_8px_30px_rgba(61,31,13,0.2)] backdrop-blur-sm"
                style={{ animationDelay: '500ms' }}
              >
                <Ticket className="h-7 w-7" />
              </div>
              <div
                className="absolute bottom-[20%] left-[12%] flex h-12 w-12 animate-float items-center justify-center rounded-2xl bg-[#FFF7ED]/10 text-[#C9943A] shadow-[0_8px_30px_rgba(61,31,13,0.2)] backdrop-blur-sm"
                style={{ animationDelay: '1000ms' }}
              >
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="relative z-20 -mt-8 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[32px] border border-[#E8D8C8] bg-[#FFF7ED] p-5 shadow-[0_16px_48px_rgba(61,31,13,0.08)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {/* Search */}
                  <div className="relative min-w-[220px] flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CB3AC]" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search events, workshops, outlets…"
                      className="w-full rounded-full border border-[#E8D8C8] bg-white py-2.5 pl-10 pr-4 text-sm text-[#3D1F0D] placeholder:text-[#9CB3AC] focus:border-[#C9943A] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/20"
                    />
                  </div>

                  {/* Category */}
                  <div className="relative min-w-[170px]">
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full appearance-none rounded-full border border-[#E8D8C8] bg-white py-2.5 pl-4 pr-10 text-sm text-[#3D1F0D] focus:border-[#C9943A] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/20"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CB3AC]" />
                  </div>

                  {/* Outlet */}
                  <div className="relative min-w-[170px]">
                    <select
                      value={outlet}
                      onChange={e => setOutlet(e.target.value)}
                      className="w-full appearance-none rounded-full border border-[#E8D8C8] bg-white py-2.5 pl-4 pr-10 text-sm text-[#3D1F0D] focus:border-[#C9943A] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/20"
                    >
                      <option value="all">All Outlets</option>
                      {outletOptions.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CB3AC]" />
                  </div>

                  {/* Status */}
                  <div className="relative min-w-[150px]">
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full appearance-none rounded-full border border-[#E8D8C8] bg-white py-2.5 pl-4 pr-10 text-sm text-[#3D1F0D] focus:border-[#C9943A] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/20"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Booking Open</option>
                      <option value="sold_out">Sold Out</option>
                      <option value="closed">Closed</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CB3AC]" />
                  </div>
                </div>

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider text-[#A92517] transition hover:bg-red-50"
                  >
                    <X className="h-4 w-4" /> Clear
                  </button>
                )}
              </div>

              {/* Date filter buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E8D8C8]/60 pt-4">
                <Calendar className="h-3.5 w-3.5 text-[#9CB3AC]" />
                <span className="mr-1 text-xs font-black uppercase tracking-wider text-[#5F4A3A]">Date:</span>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'today', label: 'Today' },
                  { key: 'week', label: 'This Week' },
                  { key: 'month', label: 'This Month' },
                ].map(d => {
                  const active = dateFilter === d.key
                  return (
                    <button
                      key={d.key}
                      onClick={() => setDateFilter(d.key as any)}
                      className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                        active
                          ? 'bg-[#3D1F0D] text-[#FFF7ED] ring-1 ring-[#C9943A]'
                          : 'border border-[#E8D8C8] bg-white text-[#3D1F0D] hover:border-[#C9943A] hover:text-[#C9943A]'
                      }`}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Events grid */}
        <section className="px-4 pb-24 pt-12">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                    <div className="h-52 bg-[#E8D8C8]" />
                    <div className="p-5">
                      <div className="mb-2 h-4 w-16 rounded bg-[#E8D8C8]" />
                      <div className="mb-3 h-5 w-3/4 rounded bg-[#E8D8C8]" />
                      <div className="mb-2 h-3 w-1/2 rounded bg-[#E8D8C8]" />
                      <div className="mb-2 h-3 w-2/3 rounded bg-[#E8D8C8]" />
                      <div className="mt-4 h-10 rounded-full bg-[#E8D8C8]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-[28px] bg-white py-20 text-center shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-[#C9943A]/40" />
                <p className="font-heading text-lg font-bold text-[#3D1F0D]">Unable to load events.</p>
                <p className="mt-1 text-sm text-[#5F4A3A]">Please check your connection and try again.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[28px] bg-white py-20 text-center shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-[#C9943A]/40" />
                <p className="font-heading text-lg font-bold text-[#3D1F0D]">No events found.</p>
                <p className="mt-1 text-sm text-[#5F4A3A]">Try adjusting your filters or search.</p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#3D1F0D] px-5 py-2.5 text-sm font-black uppercase tracking-wider text-[#FFF7ED] transition hover:bg-[#5A3A24]"
                  >
                    <X className="h-4 w-4" /> Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((event, i) => {
                  const img = getImageUrl(event.event_thumbnail || event.event_banner || hero?.image || null)
                  const minPrice = getMinPrice(event.ticket_types)
                  const seats = getSeatsLeft(event.dates)
                  const statusLabel = getEventStatusLabel(event)
                  const dateText = getCardDateText(event)
                  const timeText = getCardTimeText(event)
                  const isSoldOut = statusLabel === 'Sold Out'
                  const isClosed = statusLabel === 'Closed'

                  return (
                    <div
                      key={event.id}
                      onClick={() => router.push(`/events/${event.slug}`)}
                      className="group opacity-0 animate-fade-up cursor-pointer overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_rgba(61,31,13,0.06)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_48px_rgba(61,31,13,0.14)] hover:ring-1 hover:ring-[#C9943A]/40"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="relative h-52 overflow-hidden">
                        {img ? (
                          <img src={img} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#3D1F0D] via-[#5A2D1D] to-[#C9943A]">
                            <Ticket className="h-10 w-10 text-white/40" />
                            <span className="text-xs font-black uppercase tracking-widest text-white/60">Big Bean Events</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#3D1F0D]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        {event.category && (
                          <span className="absolute left-4 top-4 rounded-full bg-[#FFF7ED] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#3D1F0D] shadow-sm">
                            {event.category}
                          </span>
                        )}
                        {!isSoldOut && !isClosed && minPrice !== null && (
                          <span className="absolute bottom-4 right-4 rounded-full bg-[#C9943A] px-3 py-1 text-xs font-black text-[#3D1F0D] shadow-sm">
                            {minPrice === 0 ? 'Free' : `₹${minPrice}`} <span className="text-[10px] opacity-80">onwards</span>
                          </span>
                        )}
                        {(isSoldOut || isClosed) && (
                          <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-black text-white shadow-sm ${isSoldOut ? 'bg-[#A92517]' : 'bg-[#5F4A3A]'}`}>
                            {statusLabel}
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-heading text-lg font-bold text-[#3D1F0D] line-clamp-2 transition-colors group-hover:text-[#5A2D1D]">
                          {event.title}
                        </h3>
                        {event.short_description && (
                          <p className="mt-2 line-clamp-2 text-sm text-[#5F4A3A]">{event.short_description}</p>
                        )}

                        <div className="mt-4 space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-[#5F4A3A]">
                            <Calendar className="h-4 w-4 flex-shrink-0 text-[#C9943A]" />
                            <span className="line-clamp-1">{dateText}</span>
                          </div>
                          {timeText && (
                            <div className="flex items-center gap-2 text-sm text-[#5F4A3A]">
                              <Clock className="h-4 w-4 flex-shrink-0 text-[#C9943A]" />
                              <span>{timeText}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-[#5F4A3A]">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-[#C9943A]" />
                            <span className="line-clamp-1">{event.outlet?.outlet_name || 'Big Bean Cafe'}</span>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-[#F7EFE7] pt-4">
                          <span className="text-xs font-black uppercase tracking-wider text-[#5F4A3A]">
                            {isSoldOut ? 'Sold Out' : isClosed ? 'Closed' : `${seats} seats left`}
                          </span>
                          <Link
                            href={`/events/${event.slug}/book`}
                            onClick={e => e.stopPropagation()}
                            className="group/btn inline-flex items-center gap-1.5 rounded-full bg-[#3D1F0D] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#FFF7ED] shadow-md transition-all duration-300 hover:bg-[#C9943A] hover:text-[#3D1F0D] hover:shadow-[0_8px_20px_rgba(201,148,58,0.35)]"
                          >
                            Book <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
