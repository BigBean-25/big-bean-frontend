'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import apiRequest from '@/lib/api'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Calendar, Clock, MapPin, Languages, Ticket, Info,
  Building, Users, Smile, PawPrint, ExternalLink, Share,
  ChevronDown, X
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

interface EventsHero {
  id: number
  image: string | null
  overlay_opacity: number | null
  status: string
}

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

const formatDateShort = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`)
  return {
    weekday: date.toLocaleDateString('en-IN', { weekday: 'short' }),
    day: date.getDate(),
    month: date.toLocaleDateString('en-IN', { month: 'short' }),
  }
}

const getMinPrice = (tickets: EventTicket[]) => {
  const active = tickets.filter(t => t.status === 'active')
  if (!active.length) return null
  return Math.min(...active.map(t => t.price))
}

const getSeatsLeft = (dates: EventDate[]) => {
  return dates
    .filter(d => d.status === 'active')
    .reduce((sum, d) => sum + (Number(d.available_seats) || 0), 0)
}

const getStatusLabel = (event: Event) => {
  if (event.display_status === 'closed') return 'Closed'
  if (event.display_status === 'sold_out') return 'Sold Out'
  const seats = getSeatsLeft(event.dates)
  if (seats <= 0) return 'Sold Out'
  return 'Booking Open'
}

const getHeaderDateText = (event: Event) => {
  const dates = event.dates.filter(d => d.status !== 'inactive' && d.status !== 'cancelled')
  if (!dates.length) return 'Date TBA'
  const sorted = [...dates].sort((a, b) => a.event_date.localeCompare(b.event_date))
  const first = sorted[0]
  if (sorted.length === 1) {
    return `${formatDate(first.event_date)} · ${formatTimeRange(first.start_time, first.end_time, first.display_time_label)}`
  }
  return `${formatDate(first.event_date)} onwards, Multiple Dates`
}

const thingsToKnow = (event: Event) => [
  { icon: Languages, label: 'Language', value: `Activity will be in ${event.language || 'English, Hindi'}` },
  { icon: Clock, label: 'Duration', value: `Duration ${event.duration || '1 Hour'}` },
  { icon: Ticket, label: 'Ticket', value: event.ticket_age_rule || 'Ticket needed for all ages' },
  { icon: Info, label: 'Entry', value: event.entry_age_rule || 'Entry allowed for all ages' },
  { icon: Building, label: 'Layout', value: `Layout ${event.layout_type || 'Indoor'}` },
  { icon: Users, label: 'Seating', value: `Seating Arrangement ${event.seating_type || 'Seated & Standing'}` },
  { icon: Smile, label: 'Kids', value: event.kid_friendly ? 'Kid friendly' : 'Not kid friendly' },
  { icon: PawPrint, label: 'Pets', value: event.pets_allowed ? 'Pets allowed' : 'Pets not allowed' },
]

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [event, setEvent] = useState<Event | null>(null)
  const [hero, setHero] = useState<EventsHero | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(false)
    setNotFound(false)
    Promise.all([
      apiRequest(`/events/${slug}`),
      apiRequest('/events-hero/active').then(r => r.json())
    ])
      .then(async ([res, heroRes]) => {
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error('Failed to load')
        setEvent(data.data)
        setHero(heroRes.data || null)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (aboutOpen) {
      document.body.style.overflow = 'hidden'
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setAboutOpen(false)
      }
      window.addEventListener('keydown', handleKey)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKey)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [aboutOpen])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7EFE7]">
        <Header />
        <main className="px-4 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="h-6 w-40 animate-pulse rounded bg-[#E8D8C8]" />
            <div className="mt-6 h-10 w-3/4 animate-pulse rounded bg-[#E8D8C8]" />
            <div className="mt-3 h-5 w-1/2 animate-pulse rounded bg-[#E8D8C8]" />
            <div className="mt-8 h-80 animate-pulse rounded-[34px] bg-[#E8D8C8]" />
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-40 animate-pulse rounded-[28px] bg-[#E8D8C8]" />
                <div className="h-64 animate-pulse rounded-[28px] bg-[#E8D8C8]" />
              </div>
              <div className="h-80 animate-pulse rounded-[28px] bg-[#E8D8C8]" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F7EFE7]">
        <Header />
        <main className="px-4 py-20 text-center">
          <h1 className="font-heading text-3xl font-extrabold text-[#3D1F0D]">Event not found</h1>
          <p className="mt-2 text-[#5F4A3A]">The event you are looking for does not exist or has been removed.</p>
          <Link href="/events" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3D1F0D] px-6 py-3 font-bold text-[#FFF7ED] hover:bg-[#5A3A24]">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#F7EFE7]">
        <Header />
        <main className="px-4 py-20 text-center">
          <h1 className="font-heading text-3xl font-extrabold text-[#3D1F0D]">Unable to load event</h1>
          <p className="mt-2 text-[#5F4A3A]">Something went wrong. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3D1F0D] px-6 py-3 font-bold text-[#FFF7ED] hover:bg-[#5A3A24]"
          >
            Try Again
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  const banner = getImageUrl(event.event_banner || hero?.image || null)
  const minPrice = getMinPrice(event.ticket_types)
  const seats = getSeatsLeft(event.dates)
  const statusLabel = getStatusLabel(event)
  const isSoldOut = statusLabel === 'Sold Out'
  const isClosed = statusLabel === 'Closed'
  const canBook = event.display_status === 'booking_open'

  const previewSource = event.short_description || event.description || ''
  const fullAbout = event.description || event.short_description || ''
  const showReadMore = fullAbout.length > 120

  const activeDates = [...event.dates]
    .filter(d => d.status !== 'inactive' && d.status !== 'cancelled')
    .sort((a, b) => a.event_date.localeCompare(b.event_date))

  return (
    <div className="min-h-screen bg-[#F7EFE7] pb-24 lg:pb-0">
      <Header />
      <main className="px-4 py-6 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <Link href="/events" className="inline-flex items-center gap-2 text-sm font-bold text-[#5F4A3A] hover:text-[#3D1F0D]">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>

          {/* Header */}
          <div className="mt-6">
            {event.category && (
              <span className="inline-block rounded-full bg-[#F7EFE7] px-3 py-1 text-xs font-bold text-[#3D1F0D]">
                {event.category}
              </span>
            )}
            <h1 className="mt-3 font-heading text-3xl font-extrabold text-[#3D1F0D] sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-3 text-lg text-[#C9943A]">
              <Calendar className="h-5 w-5" />
              {getHeaderDateText(event)}
            </p>
          </div>

          {/* Banner */}
          <div className="relative mt-6 overflow-hidden rounded-[34px] shadow-[0_18px_50px_rgba(61,31,13,0.12)]">
            {banner ? (
              <img src={banner} alt={event.title} className="h-64 w-full object-cover sm:h-80 lg:h-[420px]" />
            ) : (
              <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-[#3D1F0D] to-[#C9943A] sm:h-80 lg:h-[420px]">
                <Calendar className="h-20 w-20 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3D1F0D]/90 via-[#3D1F0D]/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
              {event.category && (
                <span className="inline-block rounded-full bg-[#C9943A] px-3 py-1 text-xs font-bold text-[#3D1F0D]">
                  {event.category}
                </span>
              )}
              <h2 className="mt-2 font-heading text-2xl font-extrabold text-[#FFF7ED] sm:text-3xl lg:text-4xl">
                {event.title}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-lg text-[#FFF7ED]/90">
                <Calendar className="h-5 w-5 text-[#C9943A]" />
                {getHeaderDateText(event)}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:items-start">
            {/* Left content */}
            <div className="space-y-8 lg:col-span-2">
              {/* About */}
              <section className="rounded-[22px] border border-[#F1E3D4] bg-white px-5 py-5 shadow-[0_18px_50px_rgba(61,31,13,0.08)] md:rounded-[28px] md:px-8 md:py-7">
                <h2 className="font-heading text-2xl font-black leading-tight text-[#3D1F0D] md:text-[30px] mb-4">About</h2>
                <p className={`max-w-[760px] text-sm leading-7 text-[#7A6A60] md:text-[16px] line-clamp-2 whitespace-pre-line ${showReadMore ? 'mb-5' : 'mb-0'}`}>
                  {previewSource || 'Event details will be updated soon.'}
                </p>
                {showReadMore && (
                  <button
                    onClick={() => setAboutOpen(true)}
                    className="group inline-flex items-center gap-2 rounded-full bg-[#F7EFE7] px-4 py-2.5 text-sm font-black text-[#3D1F0D] transition-all duration-300 hover:bg-[#3D1F0D] hover:text-white md:px-5 md:py-3"
                  >
                    Read more
                    <ChevronDown className="h-4 w-4 text-[#3D1F0D] transition-colors group-hover:text-white" />
                  </button>
                )}
              </section>

              {/* Things to know */}
              <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                <h2 className="font-heading text-2xl font-bold text-[#3D1F0D]">Things to know</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {thingsToKnow(event).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-2xl bg-[#F7EFE7] p-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3D1F0D] text-[#C9943A]">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#C9943A]">{item.label}</p>
                        <p className="mt-0.5 text-sm font-bold text-[#3D1F0D]">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Terms & Conditions */}
              {(event.terms_conditions || event.cancellation_policy || event.entry_policy) && (
                <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                  <h2 className="font-heading text-2xl font-bold text-[#3D1F0D]">Terms & Conditions</h2>
                  {event.terms_conditions && (
                    <div className="mt-4 text-[#5F4A3A] leading-relaxed whitespace-pre-line">{event.terms_conditions}</div>
                  )}
                  {event.cancellation_policy && (
                    <div className="mt-4">
                      <p className="font-bold text-[#3D1F0D]">Cancellation Policy</p>
                      <p className="text-[#5F4A3A]">{event.cancellation_policy}</p>
                    </div>
                  )}
                  {event.entry_policy && (
                    <div className="mt-4">
                      <p className="font-bold text-[#3D1F0D]">Entry Policy</p>
                      <p className="text-[#5F4A3A]">{event.entry_policy}</p>
                    </div>
                  )}
                </section>
              )}

              {/* Available Dates & Time */}
              <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                <h2 className="font-heading text-2xl font-bold text-[#3D1F0D]">Available Dates & Time</h2>
                {activeDates.length === 0 ? (
                  <p className="mt-4 text-[#5F4A3A]">No dates available.</p>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeDates.map(date => {
                      const d = formatDateShort(date.event_date)
                      const sold = date.status === 'sold_out' || date.available_seats <= 0
                      const closed = date.status === 'closed'
                      return (
                        <div key={date.id} className="rounded-2xl bg-[#F7EFE7] p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-[#3D1F0D] text-white">
                              <span className="text-xs font-bold uppercase tracking-wide text-[#C9943A]">{d.weekday}</span>
                              <span className="text-2xl font-extrabold">{d.day}</span>
                              <span className="text-xs font-bold uppercase tracking-wide text-[#C9943A]">{d.month}</span>
                            </div>
                            <div>
                              <p className="font-bold text-[#3D1F0D]">{formatTimeRange(date.start_time, date.end_time, date.display_time_label)}</p>
                              {date.door_open_time && (
                                <p className="mt-0.5 text-xs text-[#5F4A3A]">Door opens {formatTime(date.door_open_time)}</p>
                              )}
                              <p className="mt-1 text-sm font-bold text-[#C9943A]">
                                {closed ? 'Closed' : sold ? 'Sold Out' : `${date.available_seats} seats left`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right sticky card */}
            <div className="hidden lg:block">
              <div className="sticky top-24 rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                <div className="border-b border-[#F7EFE7] pb-5">
                  <p className="text-sm text-[#5F4A3A]">Price from</p>
                  <p className="font-heading text-3xl font-extrabold text-[#C9943A]">
                    {minPrice !== null ? (minPrice === 0 ? 'Free' : `₹${minPrice}`) : 'Price on request'}
                    {minPrice !== null && minPrice > 0 && <span className="ml-1 text-sm font-medium text-[#5F4A3A]">onwards</span>}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#F7EFE7] px-3 py-1 text-xs font-bold text-[#3D1F0D]">
                    <Ticket className="h-3.5 w-3.5 text-[#C9943A]" />
                    {statusLabel}
                  </div>
                </div>

                <Link
                  href={`/events/${event.slug}/book`}
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
                    canBook
                      ? 'bg-[#3D1F0D] text-[#FFF7ED] hover:bg-[#5A3A24]'
                      : 'cursor-not-allowed bg-[#E8D8C8] text-[#5F4A3A]'
                  }`}
                >
                  <Ticket className="h-4 w-4" /> Book Tickets
                </Link>

                {/* Outlet */}
                {event.outlet && (
                  <div className="mt-5 rounded-2xl bg-[#F7EFE7] p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-[#C9943A]" />
                      <div>
                        <p className="font-bold text-[#3D1F0D]">{event.outlet.outlet_name}</p>
                        <p className="mt-1 text-sm text-[#5F4A3A]">
                          {event.outlet.outlet_address}
                          {event.outlet.outlet_address && event.outlet.city ? ', ' : ''}
                          {event.outlet.city}
                        </p>
                        {event.outlet.map_url && (
                          <a
                            href={event.outlet.map_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#C9943A] hover:text-[#3D1F0D]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> View on Map
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* About Modal */}
      <div
        aria-hidden={!aboutOpen}
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm transition-all duration-300 ${
          aboutOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setAboutOpen(false)}
      >
        <div
          className={`flex max-h-[80vh] w-[92vw] max-w-[680px] transform flex-col rounded-[28px] bg-white shadow-[0_24px_60px_rgba(61,31,13,0.25)] transition-all duration-300 ${
            aboutOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-about-title"
        >
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#F7EFE7] px-5 py-4 lg:px-6 lg:py-5">
            <h3 id="event-about-title" className="font-heading text-xl font-bold text-[#3D1F0D]">About the Event</h3>
            <button
              type="button"
              onClick={() => setAboutOpen(false)}
              aria-label="Close about modal"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7EFE7] text-[#5F4A3A] transition hover:bg-[#E8D8C8] hover:text-[#3D1F0D]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div
            className="about-modal-scroll flex-1 overflow-y-auto px-5 py-4 text-[#4B3A32] lg:px-6 lg:py-5"
          >
            {event.short_description && event.description && event.short_description !== event.description && (
              <p className="mb-4 break-words whitespace-pre-line text-base leading-8 text-[#3D1F0D]">{event.short_description}</p>
            )}
            <div className="break-words whitespace-pre-line leading-8">
              {event.description || event.short_description || 'Event details will be updated soon.'}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8D8C8] bg-white p-4 shadow-[0_-8px_30px_rgba(61,31,13,0.08)] lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#5F4A3A]">Price from</p>
            <p className="font-heading text-xl font-extrabold text-[#C9943A]">
              {minPrice !== null ? (minPrice === 0 ? 'Free' : `₹${minPrice}`) : '—'}
              {minPrice !== null && minPrice > 0 && <span className="ml-1 text-xs font-medium text-[#5F4A3A]">onwards</span>}
            </p>
          </div>
          <Link
            href={`/events/${event.slug}/book`}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition ${
              canBook
                ? 'bg-[#3D1F0D] text-[#FFF7ED] hover:bg-[#5A3A24]'
                : 'cursor-not-allowed bg-[#E8D8C8] text-[#5F4A3A]'
            }`}
          >
            <Ticket className="h-4 w-4" /> Book Tickets
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
