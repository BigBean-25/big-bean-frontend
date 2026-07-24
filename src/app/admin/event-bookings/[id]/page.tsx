'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User, Phone, Mail, MapPin, CreditCard,
  CheckCircle, Clock, RefreshCw, Send, MessageCircle,
  Copy, Check, AlertCircle, Calendar, Hash, FileDown,
  Ticket, QrCode, UserCheck, BadgeCheck, StickyNote,
} from 'lucide-react'
import apiRequest from '@/lib/api'
import { isSuperAdmin, hasPermission } from '@/lib/adminPermissions'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

interface BookingDetail {
  booking: {
    id: number
    booking_number: string
    customer_name: string
    customer_phone: string
    customer_email: string | null
    quantity: number
    ticket_price: number
    subtotal: number
    tax_amount: number
    total_amount: number
    payment_status: string
    booking_status: string
    razorpay_order_id: string | null
    razorpay_payment_id: string | null
    qr_code: string | null
    notes: string | null
    created_at: string
    updated_at: string
  }
  event: {
    id: number
    title: string
    slug: string
    short_description: string | null
    banner: string | null
    thumbnail: string | null
  }
  event_date: string
  start_time: string
  end_time: string
  door_open_time: string
  ticket_name: string
  outlet: { name: string; address: string; city: string }
  checkin: {
    id: number
    checked_in_at: string
    checked_in_by: number
    checked_in_by_name: string
    remarks: string
  } | null
}

const BOOKING_STATUSES = [
  { value: 'pending',    label: 'Pending' },
  { value: 'confirmed',  label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'no_show',    label: 'No Show' },
  { value: 'cancelled',  label: 'Cancelled' },
]

const BOOKING_STATUS_STYLE: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:  'bg-green-50 text-green-700 border-green-200',
  checked_in: 'bg-blue-50 text-blue-700 border-blue-200',
  no_show:    'bg-gray-100 text-gray-600 border-gray-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
  completed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const PAY_STATUS_STYLE: Record<string, string> = {
  paid:               'bg-green-100 text-green-700',
  payment_initiated:  'bg-blue-100 text-blue-700',
  failed:             'bg-red-100 text-red-700',
  payment_failed:     'bg-red-100 text-red-700',
  pending:            'bg-orange-100 text-orange-700',
  refunded:           'bg-gray-100 text-gray-600',
}
const PAY_STATUS_LABEL: Record<string, string> = {
  paid: 'Paid ✓', payment_initiated: 'Initiated', failed: 'Failed',
  payment_failed: 'Failed', pending: 'Pending', refunded: 'Refunded',
}

const TIMELINE_STEPS: { key: string; label: string; icon: React.ElementType }[] = [
  { key: 'received',        label: 'Booking Received',  icon: Calendar },
  { key: 'payment',         label: 'Payment Confirmed', icon: CreditCard },
  { key: 'confirmed',       label: 'Team Confirmation', icon: CheckCircle },
  { key: 'checkin_pending', label: 'Check-In Pending',  icon: QrCode },
  { key: 'checked_in',      label: 'Checked In',        icon: UserCheck },
  { key: 'completed',       label: 'Completed',         icon: BadgeCheck },
]

const fmtDate = (d?: string | null) => {
  if (!d) return '—'
  return new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
const fmtTime = (t?: string | null) => {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hh = parseInt(h, 10)
  const am = hh >= 12 ? 'PM' : 'AM'
  return `${hh % 12 || 12}:${m} ${am}`
}
const fmtDateTime = (d?: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
const getImageUrl = (img?: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}
const formatPhone = (phone: string) => {
  const d = (phone || '').replace(/\D/g, '')
  if (d.length === 10) return `91${d}`
  if (d.startsWith('91') && d.length >= 12) return d
  return d
}
const buildEventMessage = (det: BookingDetail) => {
  const venue = [det.outlet?.name, det.outlet?.address, det.outlet?.city].filter(Boolean).join(', ')
  const time = det.start_time && det.start_time !== '—'
    ? `${fmtTime(det.start_time)}${det.end_time ? ` - ${fmtTime(det.end_time)}` : ''}`
    : '—'
  return `Hi ${det.booking.customer_name},

Your Big Bean Café event booking update:

Event: ${det.event.title}
Booking ID: ${det.booking.booking_number}
Date: ${fmtDate(det.event_date)}
Time: ${time}
Venue: ${venue || '—'}
Tickets: ${det.booking.quantity}
Status: ${det.booking.booking_status}
Payment: ${det.booking.payment_status}

Please show this booking reference at the venue for check-in.

Thank you,
Big Bean Café`
}
const getTimelineActive = (det: BookingDetail) => {
  const a = new Set<string>(['received'])
  if (det.booking.payment_status === 'paid') a.add('payment')
  if (['confirmed', 'checked_in', 'completed'].includes(det.booking.booking_status)) a.add('confirmed')
  if (det.booking.booking_status === 'confirmed' && !det.checkin) a.add('checkin_pending')
  if (det.checkin) a.add('checked_in')
  if (det.booking.booking_status === 'completed') a.add('completed')
  return a
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide flex-shrink-0 w-36">{label}</span>
      <span className={`text-sm text-gray-800 text-right ${mono ? 'font-mono' : 'font-medium'}`}>{value ?? '—'}</span>
    </div>
  )
}

export default function EventBookingDetailPage() {
  const { id } = useParams() as { id: string }
  const [detail, setDetail] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('pending')
  const [sendEmailOnUpdate, setSendEmailOnUpdate] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    setCanEdit(isSuperAdmin() || hasPermission('event_bookings', 'edit'))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiRequest(`/admin/event-bookings/${id}`)
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Failed')
      setDetail(data.data)
      const raw = data.data.booking?.booking_status || 'pending'
      setNewStatus(BOOKING_STATUSES.map(s => s.value).includes(raw) ? raw : 'pending')
    } catch (err: any) {
      toast.error(err.message || 'Failed to load booking')
    }
    setLoading(false)
  }

  useEffect(() => { if (id) load() }, [id])

  const handleStatusUpdate = async () => {
    if (!detail || !canEdit) return
    setUpdatingStatus(true)
    try {
      const res = await apiRequest(`/admin/event-bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ booking_status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        const label = BOOKING_STATUSES.find(s => s.value === newStatus)?.label || newStatus
        toast.success(`Status updated to "${label}"`)
        if (sendEmailOnUpdate) {
          apiRequest(`/admin/event-bookings/${id}/send-email`, {
            method: 'POST',
            body: JSON.stringify({ template_key: 'booking_confirmation' }),
          }).catch(() => {})
        }
        await load()
      } else {
        toast.error(data.message || 'Update failed')
      }
    } catch { toast.error('Network error — could not update status') }
    setUpdatingStatus(false)
  }

  const handleCheckIn = async () => {
    if (!detail || !canEdit) return
    setCheckingIn(true)
    try {
      const res = await apiRequest(`/admin/event-bookings/${detail.booking.id}/check-in`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message || 'Checked in successfully')
        setDetail(prev => prev ? {
          ...prev,
          checkin: prev.checkin ?? { id: 0, checked_in_at: new Date().toISOString(), checked_in_by: 0, checked_in_by_name: 'Admin', remarks: '' },
        } : null)
      } else {
        toast.error(data.message || 'Check-in failed')
      }
    } catch (err: any) { toast.error(err.message || 'Check-in failed') }
    setCheckingIn(false)
  }

  const handleSendEmail = async () => {
    if (!detail) return
    setActionLoading('email')
    try {
      const res = await apiRequest(`/admin/event-bookings/${id}/send-email`, {
        method: 'POST',
        body: JSON.stringify({ template_key: 'booking_confirmation' }),
      })
      const data = await res.json()
      if (data.success) toast.success(data.message || 'Email sent successfully')
      else toast.error(data.message || 'Failed to send email')
    } catch { toast.error('Network error — could not send email') }
    setActionLoading(null)
  }

  const handleSendWhatsApp = async () => {
    if (!detail) return
    setActionLoading('whatsapp')
    try {
      const res = await apiRequest(`/admin/event-bookings/${id}/send-whatsapp`, {
        method: 'POST',
        body: JSON.stringify({ template_key: 'booking_confirmation' }),
      })
      const data = await res.json()
      if (data.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank')
        toast.success('WhatsApp opened in new tab')
      } else if (data.success) {
        toast.success('WhatsApp message sent')
      } else {
        toast.error(data.message || 'WhatsApp not configured')
      }
    } catch { toast.error('Failed to prepare WhatsApp message') }
    setActionLoading(null)
  }

  const handleCopyMessage = async () => {
    if (!detail) return
    await navigator.clipboard.writeText(buildEventMessage(detail)).catch(() => {})
    setCopied(true)
    toast.success('Message copied')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTicket = () => {
    if (!detail) return
    setPdfLoading(true)
    const a = document.createElement('a')
    a.href = `${API_URL}/event-bookings/${detail.booking.booking_number}/ticket-pdf`
    a.target = '_blank'
    a.download = `BigBean_Event_Ticket_${detail.booking.booking_number}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => setPdfLoading(false), 1500)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-gray-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#C9943A]" />
        <p>Loading booking…</p>
      </div>
    </div>
  )

  if (!detail) return (
    <div className="text-center py-20 text-gray-400">
      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Booking not found.</p>
      <Link href="/admin/event-bookings" className="text-sm text-[#C9943A] mt-2 inline-block hover:underline">← Back to Bookings</Link>
    </div>
  )

  const { booking, event, outlet, checkin } = detail
  const timelineActive = getTimelineActive(detail)
  const psStyle = PAY_STATUS_STYLE[booking.payment_status] || 'bg-gray-100 text-gray-600'
  const psLabel = PAY_STATUS_LABEL[booking.payment_status] || booking.payment_status
  const venue = [outlet?.name, outlet?.address, outlet?.city].filter(Boolean).join(', ')
  const eventImg = getImageUrl(event.thumbnail || event.banner)
  const waPhone = formatPhone(booking.customer_phone)
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(buildEventMessage(detail))}`

  return (
    <div className="max-w-[1100px]">
      {/* ── Header ── */}
      <div className="flex items-start gap-4 mb-6 flex-wrap">
        <Link href="/admin/event-bookings"
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{booking.booking_number}</h1>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border capitalize ${BOOKING_STATUS_STYLE[booking.booking_status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {booking.booking_status.replace(/_/g, ' ')}
            </span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${psStyle}`}>{psLabel}</span>
            {checkin && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Check className="w-3 h-3" /> Checked In
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Booked on {fmtDateTime(booking.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={downloadTicket} disabled={pdfLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-[#C9943A] text-[#C9943A] hover:bg-[#FFF7ED] transition disabled:opacity-60">
            <FileDown className="w-3.5 h-3.5" />
            {pdfLoading ? 'Generating…' : 'Download Ticket'}
          </button>
          <button onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Payment failed banner */}
      {(booking.payment_status === 'failed' || booking.payment_status === 'payment_failed') && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Payment failed</h3>
              <p className="text-sm text-red-700">Payment was not completed. Check-in is not allowed until payment is confirmed.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* ══ LEFT COLUMN ══ */}
        <div className="space-y-5">

          {/* Card: Event Details */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Event Details</h2>
            </div>
            <div className="p-5">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFF7ED] to-[#F5E6D3] border border-[#E6C7A8] flex-shrink-0">
                  {eventImg ? (
                    <img src={eventImg} alt={event.title} className="w-full h-full object-cover"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Ticket className="w-8 h-8 text-[#C9943A] opacity-40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg leading-snug">{event.title}</h3>
                  {event.short_description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.short_description}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-[#C9943A] flex-shrink-0" />
                  <span>{fmtDate(detail.event_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-[#C9943A] flex-shrink-0" />
                  <span>{fmtTime(detail.start_time)}{detail.end_time ? ` – ${fmtTime(detail.end_time)}` : ''}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-[#C9943A] flex-shrink-0 mt-0.5" />
                  <span>{venue || '—'}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Ticket Type</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{detail.ticket_name}</p>
                </div>
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Quantity</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{booking.quantity}</p>
                </div>
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Price / Ticket</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">₹{Number(booking.ticket_price).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center bg-[#FFF7ED] rounded-xl p-3">
                  <p className="text-xs text-[#C9943A] uppercase tracking-wide">Total</p>
                  <p className="text-sm font-bold text-[#3D1F0D] mt-0.5">₹{Number(booking.total_amount).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Booking Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Booking Timeline</h2>
            </div>
            <div className="px-5 py-4">
              {TIMELINE_STEPS.map((step, i) => {
                const done = timelineActive.has(step.key)
                const Icon = step.icon
                return (
                  <div key={step.key} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2
                        ${done ? 'bg-[#C9943A] border-[#C9943A] text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`w-0.5 h-6 ${done ? 'bg-[#C9943A]/40' : 'bg-gray-100'}`} />
                      )}
                    </div>
                    <div className="pb-1 pt-1">
                      <p className={`text-sm font-semibold ${done ? 'text-gray-800' : 'text-gray-300'}`}>{step.label}</p>
                      {step.key === 'checked_in' && checkin?.checked_in_at && (
                        <p className="text-xs text-gray-400">{fmtDateTime(checkin.checked_in_at)}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card: Payment Details */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Payment Details</h2>
            </div>
            <div className="px-5 py-2">
              <InfoRow label="Pay Status" value={
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${psStyle}`}>{psLabel}</span>
              } />
              <InfoRow label="Provider" value="Razorpay" />
              <InfoRow label="Razorpay Order ID" value={booking.razorpay_order_id} mono />
              <InfoRow label="Razorpay Payment ID" value={booking.razorpay_payment_id} mono />
              <InfoRow label="Subtotal" value={`₹${Number(booking.subtotal).toLocaleString('en-IN')}`} />
              <InfoRow label="Tax" value={`₹${Number(booking.tax_amount).toLocaleString('en-IN')}`} />
              <InfoRow label="Total" value={`₹${Number(booking.total_amount).toLocaleString('en-IN')}`} />
              <InfoRow label="Last Updated" value={fmtDateTime(booking.updated_at)} />
            </div>
          </div>

          {/* Card: Notes & QR */}
          {(booking.notes || booking.qr_code) && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-[#C9943A]" />
                <h2 className="font-semibold text-gray-800">Notes &amp; QR Code</h2>
              </div>
              <div className="p-5 space-y-4">
                {booking.notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase mb-1">Booking Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 whitespace-pre-wrap">{booking.notes}</p>
                  </div>
                )}
                {booking.qr_code && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase mb-2">QR Code</p>
                    <img src={booking.qr_code} alt="QR Code" className="w-36 h-36 rounded-xl border border-gray-200" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="space-y-5">

          {/* Card: Customer Details */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <User className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Customer Details</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9943A] to-[#3D1F0D] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {booking.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{booking.customer_name}</p>
                  <p className="text-xs text-gray-400">Guest</p>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-[#C9943A] flex-shrink-0" />
                  <a href={`tel:${booking.customer_phone}`} className="hover:text-[#C9943A] transition-colors">{booking.customer_phone}</a>
                </div>
                {booking.customer_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-[#C9943A] flex-shrink-0" />
                    <a href={`mailto:${booking.customer_email}`} className="hover:text-[#C9943A] transition-colors truncate">{booking.customer_email}</a>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-gray-50 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Guests</p>
                  <p className="text-sm font-bold text-gray-800">{booking.quantity}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Reference</p>
                  <p className="text-xs font-mono text-gray-700 break-all">{booking.booking_number}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Update Booking Status */}
          {canEdit && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#C9943A]" />
                <h2 className="font-semibold text-gray-800">Update Booking Status</h2>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {BOOKING_STATUSES.map(s => (
                    <button key={s.value} onClick={() => setNewStatus(s.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                        ${newStatus === s.value
                          ? 'bg-[#3D1F0D] text-white border-[#3D1F0D]'
                          : `border-gray-200 text-gray-600 hover:border-gray-400 ${BOOKING_STATUS_STYLE[s.value] || ''}`}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={sendEmailOnUpdate} onChange={e => setSendEmailOnUpdate(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#C9943A]" />
                  <span className="text-xs text-gray-500">Send email notification on update</span>
                </label>
                <button onClick={handleStatusUpdate}
                  disabled={updatingStatus || newStatus === booking.booking_status}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3D1F0D] text-white text-sm font-semibold hover:bg-[#C9943A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {updatingStatus ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {updatingStatus ? 'Updating…' : 'Update Status'}
                </button>
              </div>
            </div>
          )}

          {/* Card: Check-In */}
          {canEdit && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#C9943A]" />
                <h2 className="font-semibold text-gray-800">Check-In</h2>
              </div>
              <div className="px-5 py-4 text-center">
                {checkin ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-semibold text-green-700">Customer Checked In</p>
                    <p className="text-xs text-gray-400 mt-1">{fmtDateTime(checkin.checked_in_at)}</p>
                    {checkin.checked_in_by_name && (
                      <p className="text-xs text-gray-400">by {checkin.checked_in_by_name}</p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <QrCode className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Customer has not checked in yet.</p>
                    <button onClick={handleCheckIn}
                      disabled={checkingIn || booking.booking_status === 'cancelled'}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#167E68] text-white text-sm font-semibold hover:bg-[#0F1F1A] transition-colors disabled:opacity-50">
                      {checkingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                      {checkingIn ? 'Checking In…' : 'Check In Customer'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Card: Notify Customer */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Notify Customer</h2>
            </div>
            <div className="px-5 py-4 space-y-2">
              <button onClick={handleSendEmail} disabled={actionLoading === 'email'}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all disabled:opacity-50 group">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                  {actionLoading === 'email' ? <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" /> : <Mail className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-700">Send Email Update</p>
                  <p className="text-xs text-gray-400 truncate">{booking.customer_email || '⚠ No email on file'}</p>
                </div>
              </button>

              <button onClick={handleSendWhatsApp} disabled={actionLoading === 'whatsapp'}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-all disabled:opacity-50 group">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                  {actionLoading === 'whatsapp' ? <RefreshCw className="w-4 h-4 text-green-600 animate-spin" /> : <MessageCircle className="w-4 h-4 text-green-600" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-700">Send WhatsApp Update</p>
                  <p className="text-xs text-gray-400">{booking.customer_phone}</p>
                </div>
              </button>

              <button onClick={handleCopyMessage}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-700">{copied ? 'Copied!' : 'Copy Message'}</p>
                  <p className="text-xs text-gray-400">Copy event update text</p>
                </div>
              </button>

              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition-all">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-green-700">Open WhatsApp Web</p>
                  <p className="text-xs text-green-500">Opens wa.me link directly</p>
                </div>
              </a>
            </div>
          </div>

          {/* Card: Booking Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Booking Info</h2>
            </div>
            <div className="px-5 py-2">
              <InfoRow label="Booking ID" value={`#${booking.id}`} mono />
              <InfoRow label="Booking Ref" value={booking.booking_number} mono />
              <InfoRow label="Created" value={fmtDateTime(booking.created_at)} />
              <InfoRow label="Booking Status" value={
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${BOOKING_STATUS_STYLE[booking.booking_status] || ''}`}>
                  {booking.booking_status.replace(/_/g, ' ')}
                </span>
              } />
              <InfoRow label="Payment" value={
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${psStyle}`}>{psLabel}</span>
              } />
              <InfoRow label="Check-In" value={
                checkin
                  ? <span className="text-green-600 font-bold">Checked In</span>
                  : <span className="text-gray-400">Not Yet</span>
              } />
              <InfoRow label="Total" value={`₹${Number(booking.total_amount).toLocaleString('en-IN')}`} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
