'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import apiRequest from '@/lib/api'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Calendar, Clock, MapPin, Minus, Plus,
  User, Phone, Mail, FileText, Ticket, Check, Coffee, ArrowRight
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

const isValidEmail = (email: string) => {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function BookEventPage() {
  const params = useParams()
  const slug = params.slug as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [selectedDateId, setSelectedDateId] = useState<number | null>(null)
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', notes: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(false)
    setNotFound(false)
    apiRequest(`/events/${slug}`)
      .then(async res => {
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error('Failed to load')
        setEvent(data.data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!event) return
    const activeDates = event.dates
      .filter(d => d.status === 'active' && d.available_seats > 0)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
    if (activeDates.length && !selectedDateId) {
      setSelectedDateId(activeDates[0].id)
    }

    const activeTickets = event.ticket_types.filter(t => t.status === 'active')
    if (activeTickets.length && Object.keys(quantities).length === 0) {
      const init: Record<number, number> = {}
      activeTickets.forEach((t, i) => {
        init[t.id] = i === 0 ? 1 : 0
      })
      setQuantities(init)
    }
  }, [event])

  const selectedDate = useMemo(() => {
    return event?.dates.find(d => d.id === selectedDateId) || null
  }, [event, selectedDateId])

  const activeTickets = useMemo(() => {
    return (event?.ticket_types || []).filter(t => t.status === 'active')
  }, [event])

  const totalQuantity = useMemo(() => {
    return activeTickets.reduce((sum, t) => sum + (quantities[t.id] || 0), 0)
  }, [activeTickets, quantities])

  const subtotal = useMemo(() => {
    return activeTickets.reduce((sum, t) => sum + t.price * (quantities[t.id] || 0), 0)
  }, [activeTickets, quantities])

  const tax = 0
  const total = subtotal + tax

  const selectedTickets = useMemo(() => {
    return activeTickets
      .filter(t => quantities[t.id] > 0)
      .map(t => ({ ...t, quantity: quantities[t.id] }))
  }, [activeTickets, quantities])

  const handleQuantity = (ticketId: number, delta: number) => {
    if (!selectedDate) return
    setQuantities(prev => {
      const ticket = activeTickets.find(t => t.id === ticketId)
      if (!ticket) return prev
      const current = prev[ticketId] || 0
      const max = Math.min(
        ticket.max_per_booking,
        ticket.available_quantity,
        selectedDate.available_seats
      )
      const next = Math.max(0, Math.min(max, current + delta))
      if (next > 0) {
        const reset: Record<number, number> = {}
        activeTickets.forEach(t => { reset[t.id] = t.id === ticketId ? next : 0 })
        return reset
      }
      return { ...prev, [ticketId]: 0 }
    })
  }

  const isFormValid = () => {
    if (!selectedDate || selectedDate.status !== 'active' || selectedDate.available_seats <= 0) return false
    if (totalQuantity <= 0) return false
    if (!customer.name.trim()) return false
    if (!customer.phone.trim() || customer.phone.replace(/\D/g, '').length < 10) return false
    if (customer.email && !isValidEmail(customer.email)) return false
    if (!selectedDate || totalQuantity > selectedDate.available_seats) return false
    return true
  }

  const router = useRouter()

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise(resolve => {
      if (typeof window === 'undefined') return resolve(false)
      const existing = document.getElementById('razorpay-checkout-script') as HTMLScriptElement | null
      if (existing && existing.src) return resolve(true)
      const script = document.createElement('script')
      script.id = 'razorpay-checkout-script'
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleContinue = async () => {
    if (!event) return
    if (!selectedDate) {
      toast.error('Please select a date and time')
      return
    }
    if (!selectedTickets.length) {
      toast.error('Please select at least one ticket')
      return
    }
    if (selectedTickets.length > 1) {
      toast.error('Please select only one ticket type per booking')
      return
    }
    if (!customer.name.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!customer.phone.trim() || customer.phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit phone number')
      return
    }
    if (customer.email && !isValidEmail(customer.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    const ticket = selectedTickets[0]
    setIsSubmitting(true)
    try {
      const res = await apiRequest('/event-bookings/create-order', {
        method: 'POST',
        body: JSON.stringify({
          event_id: event.id,
          event_date_id: selectedDate.id,
          ticket_type_id: ticket.id,
          quantity: ticket.quantity,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_email: customer.email || null,
          notes: customer.notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        const message = data?.message || 'Payment is currently unavailable. Please try again later.'
        toast.error(message)
        return
      }

      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Failed to load Razorpay checkout. Please try again.')
        return
      }

      const Razorpay = (window as any).Razorpay
      if (!Razorpay) {
        toast.error('Razorpay checkout is not available.')
        return
      }

      const options = {
        key: data.data.razorpay_key_id,
        amount: data.data.amount,
        currency: data.data.currency,
        name: 'Big Bean Cafe',
        description: 'Event ticket booking',
        order_id: data.data.razorpay_order_id,
        prefill: {
          name: customer.name,
          email: customer.email || '',
          contact: customer.phone,
        },
        theme: { color: '#3D1F0D' },
        handler: async (response: any) => {
          try {
            const verifyRes = await apiRequest('/event-bookings/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                booking_id: data.data.booking_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (!verifyRes.ok || !verifyData.success) {
              toast.error(verifyData.message || 'Payment verification failed')
              return
            }
            toast.success('Booking confirmed!')
            router.push(`/events/booking-success/${data.data.booking_number}`)
          } catch (err: any) {
            toast.error(err?.message || 'Payment verification failed')
          }
        },
        modal: {
          ondismiss: () => {
            apiRequest('/event-bookings/mark-payment-failed', {
              method: 'POST',
              body: JSON.stringify({ booking_id: data.data.booking_id, reason: 'Customer closed payment modal' }),
            }).catch(() => {})
            toast.error('Payment failed. Your order was not completed.')
          },
        },
      }

      const rzp = new Razorpay(options)
      rzp.open()
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7EFE7]">
        <Header />
        <main className="px-4 py-8">
          <div className="mx-auto max-w-6xl">
            <div className="h-6 w-40 animate-pulse rounded bg-[#E8D8C8]" />
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="h-40 animate-pulse rounded-[28px] bg-[#E8D8C8]" />
                <div className="h-64 animate-pulse rounded-[28px] bg-[#E8D8C8]" />
                <div className="h-80 animate-pulse rounded-[28px] bg-[#E8D8C8]" />
              </div>
              <div className="h-96 animate-pulse rounded-[28px] bg-[#E8D8C8]" />
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
          <p className="mt-2 text-[#5F4A3A]">The event you are looking for does not exist.</p>
          <Link href="/events" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3D1F0D] px-6 py-3 font-bold text-[#FFF7ED] hover:bg-[#5A3A24]">
            <ArrowLeft className="h-4 w-4" /> Browse Events
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
          <h1 className="font-heading text-3xl font-extrabold text-[#3D1F0D]">Unable to load event booking details</h1>
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

  const img = getImageUrl(event.event_banner || event.event_thumbnail)
  const minPrice = getMinPrice(event.ticket_types)
  const activeDates = event.dates
    .filter(d => d.status !== 'inactive' && d.status !== 'cancelled')
    .sort((a, b) => a.event_date.localeCompare(b.event_date))

  return (
    <div className="min-h-screen bg-[#F7EFE7] pb-24 lg:pb-0">
      <Header />
      <main className="px-4 py-6 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <Link href={`/events/${slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-[#5F4A3A] hover:text-[#3D1F0D]">
            <ArrowLeft className="h-4 w-4" /> Back to Event Details
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-3 lg:items-start">
            {/* Left form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Event Summary */}
              <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                <div className="grid sm:grid-cols-[160px_1fr]">
                  <div className="h-40 bg-gradient-to-br from-[#3D1F0D] to-[#C9943A] sm:h-full">
                    {img ? (
                      <img src={img} alt={event.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Calendar className="h-12 w-12 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {event.category && (
                      <span className="inline-block rounded-full bg-[#F7EFE7] px-3 py-1 text-xs font-bold text-[#3D1F0D]">
                        {event.category}
                      </span>
                    )}
                    <h1 className="mt-2 font-heading text-xl font-bold text-[#3D1F0D] sm:text-2xl">
                      {event.title}
                    </h1>
                    <div className="mt-3 space-y-1.5 text-sm text-[#5F4A3A]">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#C9943A]" />
                        <span>{event.outlet?.outlet_name || 'Big Bean Cafe'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#C9943A]" />
                        <span>{[event.outlet?.outlet_address, event.outlet?.city].filter(Boolean).join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#C9943A]" />
                        <span>{activeDates.length ? formatDate(activeDates[0].event_date) : 'Date TBA'}</span>
                      </div>
                    </div>
                    <div className="mt-4 text-lg font-extrabold text-[#C9943A]">
                      {minPrice !== null ? (minPrice === 0 ? 'Free' : `₹${minPrice}`) : 'Price on request'}
                      {minPrice !== null && minPrice > 0 && <span className="ml-1 text-xs font-medium text-[#5F4A3A]">onwards</span>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Date & Time */}
              <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                <div className="mb-5 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D1F0D] text-[#C9943A]">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-[#3D1F0D]">Step 1 — Select Date & Time</h2>
                </div>
                {activeDates.length === 0 ? (
                  <p className="text-[#5F4A3A]">No active event dates available.</p>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeDates.map(date => {
                      const d = formatDateShort(date.event_date)
                      const sold = date.status !== 'active' || date.available_seats <= 0
                      const selected = selectedDateId === date.id
                      return (
                        <button
                          key={date.id}
                          type="button"
                          disabled={sold}
                          onClick={() => setSelectedDateId(date.id)}
                          className={`group relative overflow-hidden rounded-2xl p-4 text-left transition ${
                            selected
                              ? 'bg-[#3D1F0D] text-[#FFF7ED] ring-2 ring-[#C9943A]'
                              : sold
                              ? 'bg-[#F7EFE7] text-[#9CB3AC] cursor-not-allowed'
                              : 'bg-[#F7EFE7] text-[#3D1F0D] hover:bg-[#E8D8C8]'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-2xl ${selected ? 'bg-[#C9943A] text-[#3D1F0D]' : 'bg-white text-[#3D1F0D] group-hover:bg-[#FFF7ED]'}`}>
                              <span className="text-xs font-bold uppercase tracking-wide">{d.weekday}</span>
                              <span className="text-2xl font-extrabold">{d.day}</span>
                              <span className="text-xs font-bold uppercase tracking-wide">{d.month}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold">{formatTimeRange(date.start_time, date.end_time, date.display_time_label)}</p>
                              {date.door_open_time && (
                                <p className={`mt-0.5 text-xs ${selected ? 'text-[#FFF7ED]/70' : 'text-[#5F4A3A]'}`}>
                                  Door opens {formatTime(date.door_open_time)}
                                </p>
                              )}
                              <p className={`mt-1 text-xs font-bold ${selected ? 'text-[#C9943A]' : 'text-[#C9943A]'}`}>
                                {sold ? 'Sold Out' : `${date.available_seats} seats left`}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Ticket Types */}
              <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                <div className="mb-5 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D1F0D] text-[#C9943A]">
                    <Ticket className="h-4 w-4" />
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-[#3D1F0D]">Step 2 — Select Ticket Type</h2>
                </div>
                {activeTickets.length === 0 ? (
                  <p className="mt-4 text-[#5F4A3A]">Tickets are not available now.</p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {activeTickets.map(ticket => {
                      const qty = quantities[ticket.id] || 0
                      const max = selectedDate
                        ? Math.min(ticket.max_per_booking, ticket.available_quantity, selectedDate.available_seats)
                        : ticket.max_per_booking
                      const disabled = !selectedDate || selectedDate.available_seats <= 0

                      return (
                        <div key={ticket.id} className="rounded-2xl border border-[#F7EFE7] p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-bold text-[#3D1F0D]">{ticket.ticket_name}</p>
                              {ticket.ticket_description && (
                                <p className="text-sm text-[#5F4A3A]">{ticket.ticket_description}</p>
                              )}
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-lg font-extrabold text-[#C9943A]">₹{ticket.price}</span>
                                {ticket.mrp && ticket.mrp > ticket.price && (
                                  <span className="text-sm text-[#9CB3AC] line-through">₹{ticket.mrp}</span>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-[#5F4A3A]">
                                {ticket.available_quantity} available · max {ticket.max_per_booking} per booking
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={qty <= 0 || disabled}
                                onClick={() => handleQuantity(ticket.id, -1)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F7EFE7] text-[#3D1F0D] disabled:opacity-40"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-6 text-center font-bold text-[#3D1F0D]">{qty}</span>
                              <button
                                type="button"
                                disabled={qty >= max || disabled}
                                onClick={() => handleQuantity(ticket.id, 1)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3D1F0D] text-[#FFF7ED] disabled:opacity-40"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Customer Details */}
              <section className="rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                <div className="mb-5 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D1F0D] text-[#C9943A]">
                    <User className="h-4 w-4" />
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-[#3D1F0D]">Step 3 — Customer Details</h2>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-[#3D1F0D]">Full Name <span className="text-[#A92517]">*</span></label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CB3AC]" />
                      <input
                        type="text"
                        value={customer.name}
                        onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] py-2.5 pl-10 pr-4 text-sm text-[#0F1F1A] placeholder:text-[#9CB3AC] focus:border-[#2FBF9B] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#3D1F0D]">Phone Number <span className="text-[#A92517]">*</span></label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CB3AC]" />
                      <input
                        type="tel"
                        value={customer.phone}
                        onChange={e => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="10-digit mobile number"
                        className="w-full rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] py-2.5 pl-10 pr-4 text-sm text-[#0F1F1A] placeholder:text-[#9CB3AC] focus:border-[#2FBF9B] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#3D1F0D]">Email <span className="text-[#9CB3AC] font-normal">(optional)</span></label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CB3AC]" />
                      <input
                        type="email"
                        value={customer.email}
                        onChange={e => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] py-2.5 pl-10 pr-4 text-sm text-[#0F1F1A] placeholder:text-[#9CB3AC] focus:border-[#2FBF9B] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-[#3D1F0D]">Notes <span className="text-[#9CB3AC] font-normal">(optional)</span></label>
                    <div className="relative mt-1.5">
                      <FileText className="absolute left-4 top-3 h-4 w-4 text-[#9CB3AC]" />
                      <textarea
                        value={customer.notes}
                        onChange={e => setCustomer(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Any special requests or notes"
                        rows={3}
                        className="w-full resize-none rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] py-2.5 pl-10 pr-4 text-sm text-[#0F1F1A] placeholder:text-[#9CB3AC] focus:border-[#2FBF9B] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right sticky order summary */}
            <div className="hidden lg:block">
              <div className="sticky top-24 rounded-[28px] bg-white p-6 shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3D1F0D] text-[#C9943A]">
                    <Check className="h-4 w-4" />
                  </span>
                  <h3 className="font-heading text-xl font-bold text-[#3D1F0D]">Step 4 — Payment Summary</h3>
                </div>

                <div className="mt-4 space-y-3 border-b border-[#F7EFE7] pb-4">
                  <p className="font-bold text-[#3D1F0D]">{event.title}</p>
                  {selectedDate && (
                    <div className="flex items-center gap-2 text-sm text-[#5F4A3A]">
                      <Calendar className="h-4 w-4 text-[#C9943A]" />
                      <span>{formatDate(selectedDate.event_date)} · {formatTimeRange(selectedDate.start_time, selectedDate.end_time, selectedDate.display_time_label)}</span>
                    </div>
                  )}
                  {event.outlet && (
                    <div className="flex items-start gap-2 text-sm text-[#5F4A3A]">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C9943A]" />
                      <span>{[event.outlet.outlet_name, event.outlet.outlet_address, event.outlet.city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  {selectedTickets.length === 0 ? (
                    <p className="text-sm text-[#5F4A3A]">No tickets selected</p>
                  ) : (
                    selectedTickets.map(t => (
                      <div key={t.id} className="flex items-center justify-between text-sm">
                        <span className="text-[#5F4A3A]">{t.ticket_name} × {t.quantity}</span>
                        <span className="font-bold text-[#3D1F0D]">₹{t.price * t.quantity}</span>
                      </div>
                    ))
                  )}
                  <div className="flex items-center justify-between text-sm text-[#5F4A3A]">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#3D1F0D]">₹{subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[#5F4A3A]">
                    <span>Tax</span>
                    <span className="font-bold text-[#3D1F0D]">₹{tax}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#F7EFE7] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#3D1F0D]">Total</span>
                    <span className="font-heading text-2xl font-extrabold text-[#C9943A]">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={!isFormValid() || isSubmitting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3D1F0D] py-3 text-sm font-bold text-[#FFF7ED] transition hover:bg-[#5A3A24] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-4 w-4" /> {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8D8C8] bg-white p-4 shadow-[0_-8px_30px_rgba(61,31,13,0.08)] lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#5F4A3A]">Total</p>
            <p className="font-heading text-xl font-extrabold text-[#C9943A]">₹{total}</p>
          </div>
          <button
            onClick={handleContinue}
            disabled={!isFormValid() || isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#3D1F0D] px-6 py-3 text-sm font-bold text-[#FFF7ED] transition hover:bg-[#5A3A24] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> {isSubmitting ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
