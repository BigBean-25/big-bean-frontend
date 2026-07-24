'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar, Search, RefreshCw, Filter, X, Download, FileSpreadsheet,
  FileText, Eye, Check, Ticket, Trash2, AlertCircle, ChevronLeft,
  ChevronRight, Phone, Mail, User, CreditCard, MapPin, Clock, CalendarDays,
  UserCheck, MessageCircle, Copy
} from 'lucide-react'
import apiRequest, { getApiUrl } from '@/lib/api'
import { isSuperAdmin, hasPermission } from '@/lib/adminPermissions'
import toast from 'react-hot-toast'

const API_URL = getApiUrl()

interface BookingRow {
  id: number
  booking_number: string
  event_id: number
  event_title: string
  event_slug: string
  event_date: string
  start_time: string
  end_time: string
  door_open_time: string
  outlet_name: string
  customer_name: string
  customer_phone: string
  customer_email: string
  ticket_name: string
  quantity: number
  total_amount: number
  payment_status: 'paid' | 'pending' | 'payment_initiated' | 'failed' | 'refunded'
  booking_status: 'confirmed' | 'pending' | 'checked_in' | 'cancelled' | 'no_show'
  razorpay_payment_id: string
  created_at: string
  checked_in: boolean
  checked_in_at: string | null
}

interface BookingDetail {
  booking: {
    id: number
    booking_number: string
    customer_name: string
    customer_phone: string
    customer_email: string
    quantity: number
    ticket_price: number
    subtotal: number
    tax_amount: number
    total_amount: number
    payment_status: string
    booking_status: string
    razorpay_payment_id: string
    qr_code: string | null
    notes: string
    created_at: string
    updated_at: string
  }
  event: {
    id: number
    title: string
    slug: string
    short_description: string
    banner: string
    thumbnail: string
  }
  event_date: string
  start_time: string
  end_time: string
  door_open_time: string
  ticket_name: string
  outlet: {
    name: string
    address: string
    city: string
  }
  checkin: {
    id: number
    checked_in_at: string
    checked_in_by: number
    checked_in_by_name: string
    remarks: string
  } | null
}

interface EventOption {
  id: number
  title: string
  outlet?: { outlet_name: string } | null
  dates?: { event_date: string }[]
}

const statusClass = (type: 'payment' | 'booking', status: string) => {
  const map: Record<string, Record<string, string>> = {
    payment: {
      paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      payment_initiated: 'bg-orange-100 text-orange-700 border-orange-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      refunded: 'bg-gray-100 text-gray-700 border-gray-200',
    },
    booking: {
      confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      checked_in: 'bg-blue-100 text-blue-700 border-blue-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      no_show: 'bg-gray-100 text-gray-700 border-gray-200',
    },
  }
  return map[type][status] || map[type].pending
}

const fmtDate = (d?: string) => {
  if (!d) return '—'
  return new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const fmtTime = (t?: string) => {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hh = parseInt(h, 10)
  const am = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 || 12
  return `${String(h12).padStart(2, '0')}:${m} ${am}`
}

const fmtDateTime = (d?: string) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN')
}

const card = 'rounded-[28px] border border-[#DCE8E3] bg-white shadow-[0_18px_45px_rgba(31,42,36,0.06)]'

export default function AdminEventBookings() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [summary, setSummary] = useState({
    total_bookings: 0, confirmed: 0, checked_in: 0, pending: 0, cancelled: 0,
    total_revenue: 0, paid_revenue: 0, failed_payments: 0,
  })
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, total_pages: 1 })
  const [events, setEvents] = useState<EventOption[]>([])
  const [outlets, setOutlets] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [detail, setDetail] = useState<BookingDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [eventId, setEventId] = useState(searchParams.get('event_id') || '')
  const [outletName, setOutletName] = useState(searchParams.get('outlet_name') || '')
  const [eventDate, setEventDate] = useState(searchParams.get('event_date') || '')
  const [fromDate, setFromDate] = useState(searchParams.get('from_date') || '')
  const [toDate, setToDate] = useState(searchParams.get('to_date') || '')
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('payment_status') || '')
  const [bookingStatus, setBookingStatus] = useState(searchParams.get('booking_status') || '')
  const [checkinStatus, setCheckinStatus] = useState(searchParams.get('checkin_status') || '')
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get('page') || 1)))

  const [canView, setCanView] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canExport, setCanExport] = useState(false)

  useEffect(() => {
    setCanView(isSuperAdmin() || hasPermission('event_bookings', 'view'))
    setCanEdit(isSuperAdmin() || hasPermission('event_bookings', 'edit'))
    setCanExport(isSuperAdmin() || hasPermission('event_bookings', 'export'))
  }, [])

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await apiRequest('/events/active')
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error()
        const list = data.data || []
        setEvents(list)
        const outletSet = new Set<string>()
        list.forEach((e: EventOption) => {
          if (e.outlet?.outlet_name) outletSet.add(e.outlet.outlet_name)
        })
        setOutlets(Array.from(outletSet).sort())
      } catch (err) {
        console.error('Failed to load events', err)
      }
    }
    loadEvents()
  }, [])

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (eventId) params.set('event_id', eventId)
    if (outletName) params.set('outlet_name', outletName)
    if (eventDate) params.set('event_date', eventDate)
    if (fromDate) params.set('from_date', fromDate)
    if (toDate) params.set('to_date', toDate)
    if (paymentStatus) params.set('payment_status', paymentStatus)
    if (bookingStatus) params.set('booking_status', bookingStatus)
    if (checkinStatus) params.set('checkin_status', checkinStatus)
    params.set('page', String(page))
    params.set('limit', '20')
    return params.toString()
  }, [search, eventId, outletName, eventDate, fromDate, toDate, paymentStatus, bookingStatus, checkinStatus, page])

  useEffect(() => {
    const q = buildQuery()
    router.replace(`${pathname}?${q}`, { scroll: false })
  }, [buildQuery, router, pathname])

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await apiRequest(`/admin/event-bookings?${buildQuery()}`)
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load')
      setBookings(data.data || [])
      setSummary(data.summary || {
        total_bookings: 0, confirmed: 0, checked_in: 0, pending: 0, cancelled: 0,
        total_revenue: 0, paid_revenue: 0, failed_payments: 0,
      })
      setPagination(data.pagination || { total: 0, page: 1, limit: 20, total_pages: 1 })
    } catch (err: any) {
      console.error('Load bookings error', err)
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [buildQuery])

  const handleRefresh = () => {
    setRefreshing(true)
    load()
  }

  const handleApply = () => {
    setPage(1)
    load()
  }

  const handleReset = () => {
    setSearch('')
    setEventId('')
    setOutletName('')
    setEventDate('')
    setFromDate('')
    setToDate('')
    setPaymentStatus('')
    setBookingStatus('')
    setCheckinStatus('')
    setPage(1)
    load()
  }

  const hasFilters = search || eventId || outletName || eventDate || fromDate || toDate || paymentStatus || bookingStatus || checkinStatus

  const openDetail = async (id: number) => {
    setModalOpen(true)
    setDetailLoading(true)
    try {
      const res = await apiRequest(`/admin/event-bookings/${id}`)
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load')
      setDetail(data.data)
    } catch (err) {
      console.error('Detail error', err)
      setModalOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setModalOpen(false)
    setDetail(null)
  }

  const handleCheckIn = async (id: number) => {
    if (!canEdit) return
    setActionLoading(id)
    try {
      const res = await apiRequest(`/admin/event-bookings/${id}/check-in`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Check-in failed')
        return
      }
      toast.success(data.message || 'Checked in')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, checked_in: true, checked_in_at: new Date().toISOString() } : b))
      if (detail && detail.booking.id === id) {
        openDetail(id)
      }
    } catch (err: any) {
      toast.error(err.message || 'Check-in failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id: number) => {
    if (!canEdit) return
    if (!confirm('Cancel this booking?')) return
    setActionLoading(id)
    try {
      const res = await apiRequest(`/admin/event-bookings/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ booking_status: 'cancelled' }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed')
      load()
      if (detail && detail.booking.id === id) openDetail(id)
    } catch (err: any) {
      alert(err.message || 'Cancel failed')
    } finally {
      setActionLoading(null)
    }
  }

  const downloadTicket = (bookingNumber: string) => {
    const url = `${API_URL}/event-bookings/${bookingNumber}/ticket-pdf`
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.download = `BigBean_Event_Ticket_${bookingNumber}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const formatPhone = (phone: string) => {
    const d = (phone || '').replace(/\D/g, '')
    if (d.length === 10) return `91${d}`
    if (d.startsWith('91') && d.length >= 12) return d
    return d
  }

  const buildRowMessage = (b: BookingRow) => {
    const time = b.start_time ? `${fmtTime(b.start_time)}${b.end_time ? ` - ${fmtTime(b.end_time)}` : ''}` : '—'
    return `Hi ${b.customer_name},

Your Big Bean Café event booking update:

Event: ${b.event_title}
Booking ID: ${b.booking_number}
Date: ${fmtDate(b.event_date)}
Time: ${time}
Venue: ${b.outlet_name || '—'}
Tickets: ${b.quantity}
Status: ${b.booking_status}
Payment: ${b.payment_status}

Please show this booking reference at the venue for check-in.

Thank you,
Big Bean Café`
  }

  const handleSendEmail = async (b: BookingRow) => {
    if (!b.customer_email) {
      toast.error('No email on file for this customer')
      return
    }
    setActionLoading(b.id)
    try {
      const res = await apiRequest(`/admin/event-bookings/${b.id}/send-email`, {
        method: 'POST',
        body: JSON.stringify({ template_key: 'booking_confirmation' }),
      })
      const data = await res.json()
      if (res.ok && data.success) toast.success(data.message || 'Email sent successfully')
      else toast.error(data.message || 'Email update will be sent soon')
    } catch {
      toast.error('Email update will be sent soon')
    } finally {
      setActionLoading(null)
    }
  }

  const handleWhatsApp = (b: BookingRow) => {
    const url = `https://wa.me/${formatPhone(b.customer_phone)}?text=${encodeURIComponent(buildRowMessage(b))}`
    window.open(url, '_blank')
  }

  const handleCopyMessage = async (b: BookingRow) => {
    try {
      await navigator.clipboard.writeText(buildRowMessage(b))
      toast.success('Booking update message copied')
    } catch {
      toast.error('Could not copy message')
    }
  }

  const downloadExport = async (type: 'excel' | 'pdf') => {
    if (!canExport) return
    const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken')
    const url = `${API_URL}/admin/event-bookings/export/${type}?${buildQuery()}`
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const date = new Date().toISOString().split('T')[0]
      const filename = `BigBean_Event_Bookings_Report_${date}.${type === 'excel' ? 'xlsx' : 'pdf'}`
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(a.href)
    } catch (err: any) {
      alert(err.message || 'Download failed')
    }
  }

  const inputClass = 'w-full rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] py-2.5 px-3 text-sm text-[#0F1F1A] placeholder:text-[#9CB3AC] focus:border-[#2FBF9B] focus:outline-none'
  const selectClass = `${inputClass} appearance-none`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0F1F1A] sm:text-3xl">Event Bookings</h1>
          <p className="text-sm text-[#5F6F68]">Manage event ticket bookings, check-ins, and exports</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-4 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {canExport && (
            <>
              <button
                onClick={() => downloadExport('excel')}
                className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-4 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Excel
              </button>
              <button
                onClick={() => downloadExport('pdf')}
                className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-4 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
              >
                <FileText className="h-4 w-4 text-red-600" />
                PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Bookings', value: summary.total_bookings, color: 'text-[#0F1F1A]' },
          { label: 'Confirmed', value: summary.confirmed, color: 'text-emerald-600' },
          { label: 'Checked In', value: summary.checked_in, color: 'text-blue-600' },
          { label: 'Pending', value: summary.pending, color: 'text-yellow-600' },
          { label: 'Cancelled', value: summary.cancelled, color: 'text-red-600' },
          { label: 'Total Revenue', value: `₹${summary.total_revenue.toLocaleString('en-IN')}`, color: 'text-[#C9943A]' },
        ].map((s) => (
          <div key={s.label} className={`${card} p-4`}>
            <p className="text-xs font-black uppercase tracking-wider text-[#8A9A91]">{s.label}</p>
            <p className={`mt-2 text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${card} p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-black text-[#0F1F1A]">
            <Filter className="h-4 w-4 text-[#9CB3AC]" />
            Filters
          </div>
          {hasFilters && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CB3AC]" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <select value={eventId} onChange={e => setEventId(e.target.value)} className={selectClass}>
            <option value="">All Events</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
          <select value={outletName} onChange={e => setOutletName(e.target.value)} className={selectClass}>
            <option value="">All Outlets</option>
            {outlets.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className={inputClass} placeholder="Event Date" />
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className={inputClass} placeholder="From Date" />
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className={inputClass} placeholder="To Date" />
          <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} className={selectClass}>
            <option value="">Payment Status</option>
            <option value="paid">Paid</option>
            <option value="payment_initiated">Initiated</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select value={bookingStatus} onChange={e => setBookingStatus(e.target.value)} className={selectClass}>
            <option value="">Booking Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="checked_in">Checked In</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          <select value={checkinStatus} onChange={e => setCheckinStatus(e.target.value)} className={selectClass}>
            <option value="">Check-in Status</option>
            <option value="checked_in">Checked In</option>
            <option value="not_checked_in">Not Checked In</option>
          </select>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-1 xl:col-span-1">
            <button
              onClick={handleApply}
              className="flex-1 rounded-xl bg-[#167E68] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0F1F1A]"
            >
              Apply
            </button>
            <button
              onClick={handleReset}
              className="flex-1 rounded-xl border border-[#DCE8E3] bg-white px-4 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`${card} overflow-hidden`}>
        {loading ? (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FDFB]">
                  <tr>
                    {['Booking #', 'Event', 'Date & Time', 'Customer', 'Phone', 'Ticket', 'Qty', 'Amount', 'Payment', 'Booking', 'Check-in', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase text-[#5F6F68]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F8F6]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 12 }).map((__, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-[#DCE8E3]" /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-[#E85D4C]" />
            <p className="text-lg font-black text-[#0F1F1A]">Unable to load bookings</p>
            <p className="mb-4 text-sm text-[#5F6F68]">Please try again.</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl bg-[#167E68] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0F1F1A]"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="mx-auto mb-3 h-12 w-12 text-[#DCE8E3]" />
            <p className="text-lg font-black text-[#0F1F1A]">No bookings found</p>
            <p className="text-sm text-[#5F6F68]">Try adjusting filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full">
              <thead className="bg-[#F9FDFB]">
                <tr>
                  {['Booking #', 'Event', 'Date & Time', 'Customer', 'Phone', 'Ticket', 'Qty', 'Amount', 'Payment', 'Booking', 'Check-in', 'Actions'].map(h => (
                    <th
                      key={h}
                      className={`whitespace-nowrap px-4 py-3 text-xs font-black uppercase text-[#5F6F68] ${h === 'Actions' ? 'text-right min-w-[280px]' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F8F6]">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-[#F9FDFB]">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-[#0F1F1A]">{b.booking_number}</td>
                    <td className="px-4 py-3 text-sm text-[#0F1F1A]">
                      <div className="max-w-[160px] truncate" title={b.event_title}>{b.event_title}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#5F6F68]">
                      <div className="flex flex-col">
                        <span>{fmtDate(b.event_date)}</span>
                        <span className="text-xs text-[#9CB3AC]">{fmtTime(b.start_time)} - {fmtTime(b.end_time)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#0F1F1A]">
                      <div className="max-w-[140px] truncate" title={b.customer_name}>{b.customer_name}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#5F6F68]">{b.customer_phone}</td>
                    <td className="px-4 py-3 text-sm text-[#5F6F68]">
                      <div className="max-w-[120px] truncate" title={b.ticket_name}>{b.ticket_name}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#0F1F1A]">{b.quantity}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-[#0F1F1A]">₹{b.total_amount.toLocaleString('en-IN')}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${statusClass('payment', b.payment_status)}`}>
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${statusClass('booking', b.booking_status)}`}>
                        {b.booking_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[#0F1F1A]">
                      {b.checked_in ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <Check className="h-3.5 w-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="text-[#9CB3AC]">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 min-w-[280px]">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <Link
                          href={`/admin/event-bookings/${b.id}`}
                          title="View Details"
                          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {canEdit && !b.checked_in && b.booking_status !== 'cancelled' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCheckIn(b.id) }}
                            disabled={actionLoading === b.id}
                            title="Check In"
                            className="inline-flex h-9 flex-shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-[#0B8F6A] px-3 text-xs font-black text-white hover:bg-[#067554] disabled:opacity-50"
                          >
                            <UserCheck className="h-4 w-4" />
                            {actionLoading === b.id ? 'Checking...' : 'Check In'}
                          </button>
                        )}
                        {b.checked_in && (
                          <span className="inline-flex h-9 flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-emerald-50 px-3 text-xs font-black text-emerald-700">
                            <Check className="h-4 w-4" /> Checked In
                          </span>
                        )}

                        <button
                          onClick={(e) => { e.stopPropagation(); handleSendEmail(b) }}
                          disabled={actionLoading === b.id}
                          title="Send Email Update"
                          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                        >
                          <Mail className="h-4 w-4" />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleWhatsApp(b) }}
                          title="Send WhatsApp"
                          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-green-100 bg-green-50 text-green-600 hover:bg-green-100"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopyMessage(b) }}
                          title="Copy Message"
                          className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && bookings.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#F3F8F6] px-4 py-3">
            <p className="text-sm text-[#5F6F68]">
              Showing <span className="font-bold text-[#0F1F1A]">{(pagination.page - 1) * pagination.limit + 1}</span> -{' '}
              <span className="font-bold text-[#0F1F1A]">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="font-bold text-[#0F1F1A]">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="rounded-lg p-2 text-[#5F6F68] hover:bg-[#F3F8F6] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-bold text-[#0F1F1A]">
                {pagination.page} / {pagination.total_pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                disabled={pagination.page >= pagination.total_pages}
                className="rounded-lg p-2 text-[#5F6F68] hover:bg-[#F3F8F6] disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[#DCE8E3] bg-white p-6 shadow-2xl">
            {detailLoading || !detail ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2FBF9B] border-t-transparent" />
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black text-[#0F1F1A]">Booking Details</h2>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/event-bookings/${detail.booking.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#167E68] px-3 py-1.5 text-xs font-bold text-[#167E68] hover:bg-[#EAF8F3]"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Full Detail
                    </Link>
                    <button onClick={closeDetail} className="rounded-lg p-2 text-[#5F6F68] hover:bg-[#F3F8F6]">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className={`${card} p-4`}>
                      <p className="text-xs font-black uppercase text-[#8A9A91]">Booking Number</p>
                      <p className="mt-1 text-lg font-black text-[#0F1F1A]">{detail.booking.booking_number}</p>
                      {detail.booking.qr_code && (
                        <img src={detail.booking.qr_code} alt="QR Code" className="mt-3 h-40 w-40 rounded-xl border border-[#DCE8E3]" />
                      )}
                    </div>

                    <div className={`${card} p-4`}>
                      <p className="text-xs font-black uppercase text-[#8A9A91]">Event</p>
                      <p className="mt-1 text-lg font-black text-[#0F1F1A]">{detail.event.title}</p>
                      <p className="text-sm text-[#5F6F68]">{detail.event.short_description}</p>
                    </div>

                    <div className={`${card} p-4`}>
                      <p className="text-xs font-black uppercase text-[#8A9A91]">Date & Time</p>
                      <div className="mt-2 space-y-1 text-sm text-[#5F6F68]">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#9CB3AC]" />
                          {fmtDate(detail.event_date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#9CB3AC]" />
                          {fmtTime(detail.start_time)} - {fmtTime(detail.end_time)}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#9CB3AC]" />
                          {detail.outlet.name} {detail.outlet.address && `- ${detail.outlet.address}`} {detail.outlet.city && `, ${detail.outlet.city}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`${card} p-4`}>
                      <p className="text-xs font-black uppercase text-[#8A9A91]">Customer</p>
                      <div className="mt-2 space-y-2 text-sm text-[#5F6F68]">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#9CB3AC]" />
                          {detail.booking.customer_name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#9CB3AC]" />
                          {detail.booking.customer_phone}
                        </div>
                        {detail.booking.customer_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#9CB3AC]" />
                            {detail.booking.customer_email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`${card} p-4`}>
                      <p className="text-xs font-black uppercase text-[#8A9A91]">Ticket</p>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[#9CB3AC]">Type</p>
                          <p className="font-bold text-[#0F1F1A]">{detail.ticket_name}</p>
                        </div>
                        <div>
                          <p className="text-[#9CB3AC]">Quantity</p>
                          <p className="font-bold text-[#0F1F1A]">{detail.booking.quantity}</p>
                        </div>
                        <div>
                          <p className="text-[#9CB3AC]">Total Paid</p>
                          <p className="font-bold text-[#0F1F1A]">₹{detail.booking.total_amount.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-[#9CB3AC]">Ticket Price</p>
                          <p className="font-bold text-[#0F1F1A]">₹{detail.booking.ticket_price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>

                    <div className={`${card} p-4`}>
                      <p className="text-xs font-black uppercase text-[#8A9A91]">Payment & Status</p>
                      <div className="mt-2 space-y-2 text-sm text-[#5F6F68]">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[#9CB3AC]" />
                          Payment: <span className={`rounded-full border px-2 py-0.5 text-xs font-black ${statusClass('payment', detail.booking.payment_status)}`}>{detail.booking.payment_status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#9CB3AC]" />
                          Booking: <span className={`rounded-full border px-2 py-0.5 text-xs font-black ${statusClass('booking', detail.booking.booking_status)}`}>{detail.booking.booking_status.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[#9CB3AC]" />
                          Razorpay: {detail.booking.razorpay_payment_id || '—'}
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#9CB3AC]" />
                          Created: {fmtDateTime(detail.booking.created_at)}
                        </div>
                        {detail.checkin && (
                          <div className="rounded-xl bg-[#EAF8F3] p-3 text-sm">
                            <p className="font-bold text-emerald-700">Checked In</p>
                            <p className="text-[#5F6F68]">At {fmtDateTime(detail.checkin.checked_in_at)} by {detail.checkin.checked_in_by_name || 'Admin'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {canEdit && !detail.checkin && detail.booking.booking_status !== 'cancelled' && (
                    <button
                      onClick={() => handleCheckIn(detail.booking.id)}
                      disabled={actionLoading === detail.booking.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#167E68] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0F1F1A] disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {actionLoading === detail.booking.id ? 'Checking In...' : 'Check In'}
                    </button>
                  )}
                  {detail.checkin && (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
                      <Check className="h-4 w-4" /> Checked In
                    </span>
                  )}
                  <button
                    onClick={() => downloadTicket(detail.booking.booking_number)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-5 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
                  >
                    <Download className="h-4 w-4" />
                    Download Ticket PDF
                  </button>
                  {canEdit && detail.booking.booking_status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(detail.booking.id)}
                      disabled={actionLoading === detail.booking.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#F5C6C0] bg-[#FDE8E8] px-5 py-2.5 text-sm font-bold text-[#E85D4C] hover:bg-[#FBD5D0] disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel Booking
                    </button>
                  )}
                  <button
                    onClick={closeDetail}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-5 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
