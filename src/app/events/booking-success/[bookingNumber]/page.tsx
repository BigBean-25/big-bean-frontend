'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import apiRequest from '@/lib/api'
import {
  CheckCircle, Calendar, Clock, MapPin, Ticket,
  User, Phone, Mail, CreditCard, Hash, ArrowRight,
  Download
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

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

interface BookingData {
  booking_number: string
  booking_status: string
  payment_status: string
  razorpay_payment_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  quantity: number
  ticket_price: number
  subtotal: number
  tax_amount: number
  total_amount: number
  notes: string | null
  created_at: string
  qr_code: string | null
  event: {
    id: number
    title: string
    slug: string
    image: string | null
  }
  event_date: string
  start_time: string
  end_time: string | null
  ticket_name: string
  outlet: {
    name: string | null
    address: string | null
    city: string | null
  }
}

export default function BookingSuccessPage() {
  const params = useParams()
  const bookingNumber = params.bookingNumber as string

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (!bookingNumber) return
    setLoading(true)
    setError(false)
    apiRequest(`/event-bookings/${bookingNumber}`)
      .then(async res => {
        if (res.status === 404) {
          setError(true)
          return
        }
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error('Failed to load')
        setBooking(data.data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [bookingNumber])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7EFE7]">
        <Header />
        <main className="px-4 py-12">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="h-12 w-12 animate-pulse rounded-full bg-[#E8D8C8]" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-[#E8D8C8]" />
            <div className="h-64 animate-pulse rounded-[28px] bg-[#E8D8C8]" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F7EFE7]">
        <Header />
        <main className="px-4 py-20 text-center">
          <h1 className="font-heading text-3xl font-extrabold text-[#3D1F0D]">Booking not found</h1>
          <p className="mt-2 text-[#5F4A3A]">We could not load the booking details.</p>
          <Link href="/events" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3D1F0D] px-6 py-3 font-bold text-[#FFF7ED] hover:bg-[#5A3A24]">
            Back to Events
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const img = getImageUrl(booking.event.image)

  const handleDownloadPdf = async () => {
    setIsDownloading(true)
    try {
      const res = await fetch(`${API_URL}/event-bookings/${bookingNumber}/ticket-pdf`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to download ticket PDF')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `BigBean_Event_Ticket_${bookingNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(err?.message || 'Failed to download ticket PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7EFE7]">
      <Header />
      <main className="px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF8F3] text-[#167E68]">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="mt-6 font-heading text-3xl font-extrabold text-[#3D1F0D]">
              Booking Confirmed
            </h1>
            <p className="mt-2 text-[#5F4A3A]">
              Please show this booking number at the event entry.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[28px] bg-white shadow-[0_8px_30px_rgba(61,31,13,0.06)]">
            {img && (
              <div className="h-48 w-full overflow-hidden">
                <img src={img} alt={booking.event.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="border-b border-[#F7EFE7] pb-5">
                <p className="text-sm font-bold text-[#C9943A] uppercase tracking-wide">Booking Number</p>
                <div className="mt-1 flex items-center gap-2">
                  <Hash className="h-5 w-5 text-[#C9943A]" />
                  <span className="font-heading text-2xl font-extrabold text-[#3D1F0D]">
                    {booking.booking_number}
                  </span>
                </div>
              </div>

              <div className="mt-5 border-b border-[#F7EFE7] pb-5">
                <h2 className="font-heading text-xl font-bold text-[#3D1F0D]">{booking.event.title}</h2>
                <div className="mt-3 space-y-2 text-sm text-[#5F4A3A]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#C9943A]" />
                    <span>{formatDate(booking.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#C9943A]" />
                    <span>{formatTimeRange(booking.start_time, booking.end_time)}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C9943A]" />
                    <span>{[booking.outlet.name, booking.outlet.address, booking.outlet.city].filter(Boolean).join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 border-b border-[#F7EFE7] pb-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#C9943A]">Customer</p>
                  <div className="mt-1 space-y-1 text-sm text-[#3D1F0D]">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[#C9943A]" />
                      <span className="font-bold">{booking.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#C9943A]" />
                      <span>{booking.customer_phone}</span>
                    </div>
                    {booking.customer_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#C9943A]" />
                        <span>{booking.customer_email}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#C9943A]">Ticket</p>
                  <div className="mt-1 space-y-1 text-sm text-[#3D1F0D]">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-[#C9943A]" />
                      <span className="font-bold">{booking.ticket_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#C9943A]" />
                      <span>Qty: {booking.quantity} × ₹{booking.ticket_price}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2 border-b border-[#F7EFE7] pb-5">
                <div className="flex items-center justify-between text-sm text-[#5F4A3A]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#3D1F0D]">₹{booking.subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-[#5F4A3A]">
                  <span>Tax</span>
                  <span className="font-bold text-[#3D1F0D]">₹{booking.tax_amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3D1F0D]">Total Paid</span>
                  <span className="font-heading text-xl font-extrabold text-[#C9943A]">₹{booking.total_amount}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#C9943A]">Payment Status</p>
                  <p className="mt-1 font-bold text-[#3D1F0D] capitalize">{booking.payment_status}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#C9943A]">Booking Status</p>
                  <p className="mt-1 font-bold text-[#3D1F0D] capitalize">{booking.booking_status}</p>
                </div>
                {booking.razorpay_payment_id && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#C9943A]">Razorpay Payment ID</p>
                    <p className="mt-1 font-mono text-[#3D1F0D]">{booking.razorpay_payment_id}</p>
                  </div>
                )}
              </div>

              {booking.qr_code && (
                <div className="mt-5 border-t border-[#F7EFE7] pt-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#C9943A]">Entry QR Code</p>
                  <img src={booking.qr_code} alt="Booking QR Code" className="mx-auto mt-2 h-40 w-40 rounded-2xl border border-[#E8D8C8] p-2" />
                  <p className="mt-2 text-xs text-[#5F4A3A]">Scan this QR code at the event entry.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3D1F0D] px-6 py-3 text-sm font-bold text-[#FFF7ED] transition hover:bg-[#5A3A24] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> {isDownloading ? 'Downloading...' : 'Download Ticket PDF'}
            </button>
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3D1F0D] px-6 py-3 text-sm font-bold text-[#3D1F0D] hover:bg-[#E8D8C8]"
            >
              Back to Events
            </Link>
            <Link
              href={`/events/${booking.event.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#3D1F0D] px-6 py-3 text-sm font-bold text-[#3D1F0D] hover:bg-[#E8D8C8]"
            >
              View Event <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
