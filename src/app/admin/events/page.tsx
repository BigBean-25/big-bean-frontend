'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Plus, RefreshCw, Search, Calendar, MapPin, Clock,
  Eye, Edit, BookOpen, Trash2, AlertCircle, X, Filter
} from 'lucide-react'
import apiRequest from '@/lib/api'
import { isSuperAdmin, hasPermission } from '@/lib/adminPermissions'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

interface MasterOutlet {
  id: number
  name: string
  outlet_name: string
}

interface EventOutlet {
  outlet_id?: number
  outlet_name: string
}

interface EventDate {
  event_date: string
  start_time?: string | null
  end_time?: string | null
  display_time_label?: string | null
}

interface EventTicket {
  price: number
}

interface EventItem {
  id: number
  title: string
  slug?: string
  category?: string | null
  event_banner?: string | null
  event_thumbnail?: string | null
  status: 'draft' | 'active' | 'closed' | 'sold_out' | 'cancelled'
  total_bookings?: number
  outlets?: EventOutlet[]
  dates?: EventDate[]
  ticket_types?: EventTicket[]
}

const getImageUrl = (img?: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

const fmtDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtDateShort = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

const fmtTime = (t: string) => {
  const [h, m] = t.split(':')
  const hh = parseInt(h, 10)
  const am = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 || 12
  return `${String(h12).padStart(2, '0')}:${m} ${am}`
}

const dateRange = (dates?: EventDate[]) => {
  if (!dates || dates.length === 0) return '—'
  const sorted = [...dates].sort((a, b) => a.event_date.localeCompare(b.event_date))
  const first = sorted[0].event_date
  const last = sorted[sorted.length - 1].event_date
  if (first === last) return fmtDate(first)
  const sameYear = first.slice(0, 4) === last.slice(0, 4)
  return sameYear ? `${fmtDateShort(first)} – ${fmtDate(last)}` : `${fmtDate(first)} – ${fmtDate(last)}`
}

const timeText = (dates?: EventDate[]) => {
  if (!dates || dates.length === 0) return '—'
  const d = dates[0]
  if (d.display_time_label) return d.display_time_label
  if (d.start_time && d.end_time) return `${fmtTime(d.start_time)} – ${fmtTime(d.end_time)}`
  return d.start_time ? fmtTime(d.start_time) : '—'
}

const outletText = (outlets?: EventOutlet[]) => {
  if (!outlets || outlets.length === 0) return '—'
  const first = outlets[0].outlet_name
  const more = outlets.length - 1
  return more > 0 ? `${first} +${more}` : first
}

const priceFrom = (ticketTypes?: EventTicket[]) => {
  if (!ticketTypes || ticketTypes.length === 0) return '—'
  const min = Math.min(...ticketTypes.map(t => t.price))
  return `₹${min.toLocaleString('en-IN')}`
}

const STATUS_OPTIONS = ['all', 'draft', 'active', 'closed', 'sold_out', 'cancelled']

const statusClass = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-[#EAF8F3] text-[#167E68] border-[#2FBF9B]',
    draft: 'bg-[#F3F8F6] text-[#5F6F68] border-[#DCE8E3]',
    sold_out: 'bg-[#FFF3DE] text-[#8B4513] border-[#F5D3A3]',
    closed: 'bg-[#E5E7EB] text-[#374151] border-[#D1D5DB]',
    cancelled: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
  }
  return map[status] || map.draft
}

const card = 'rounded-[28px] border border-[#DCE8E3] bg-white shadow-[0_18px_45px_rgba(31,42,36,0.06)]'

export default function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [outlet, setOutlet] = useState('all')
  const [date, setDate] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [allOutlets, setAllOutlets] = useState<MasterOutlet[]>([])
  const [deleteModal, setDeleteModal] = useState<EventItem | null>(null)
  const [forceConfirm, setForceConfirm] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [canView, setCanView] = useState(false)
  const [canCreate, setCanCreate] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canDelete, setCanDelete] = useState(false)

  useEffect(() => {
    setCanView(isSuperAdmin() || hasPermission('events', 'view'))
    setCanCreate(isSuperAdmin() || hasPermission('events', 'create'))
    setCanEdit(isSuperAdmin() || hasPermission('events', 'edit'))
    setCanDelete(isSuperAdmin() || hasPermission('events', 'delete'))
  }, [])

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const [eventsRes, outletsRes] = await Promise.all([
        apiRequest('/admin/events'),
        apiRequest('/events/outlets'),
      ])
      const eventsData = await eventsRes.json()
      const outletsData = await outletsRes.json()
      if (!eventsRes.ok || !eventsData.success) throw new Error('Failed to load events')
      setEvents(eventsData.data || [])
      setAllOutlets(outletsData.data || [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!canView) return
    load()
  }, [canView])

  const handleRefresh = () => {
    setRefreshing(true)
    load()
  }

  const handleDelete = async (id: number, force = false) => {
    setDeleting(id)
    try {
      const res = await apiRequest(`/admin/events/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 403) {
          toast.error('You do not have permission to delete events.')
        } else if (res.status === 404) {
          toast.error('Event not found.')
        } else {
          toast.error(data.message || 'Unable to delete event. Please try again.')
        }
        return
      }
      const data = await res.json()
      toast.success(data.message || 'Event deleted successfully')
      await load()
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('access denied')) {
        toast.error('You do not have permission to delete events.')
      } else {
        toast.error(err?.message || 'Unable to delete event. Please try again.')
      }
    } finally {
      setDeleting(null)
    }
  }

  const categories = useMemo(() => {
    const set = new Set<string>()
    events.forEach(e => { if (e.category) set.add(e.category) })
    return Array.from(set).sort()
  }, [events])

  const outlets = useMemo(() => {
    return allOutlets
      .map(o => o.name || o.outlet_name)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort()
  }, [allOutlets])

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return events.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(s) ||
        (e.category || '').toLowerCase().includes(s) ||
        (e.outlets?.some(o => (o.outlet_name || '').toLowerCase().includes(s)) ?? false)
      const matchesStatus = status === 'all' || e.status === status
      const matchesCategory = category === 'all' || e.category === category
      const matchesOutlet = outlet === 'all' || e.outlets?.some(o => {
        if (o.outlet_id && o.outlet_id.toString() === outlet) return true
        if (o.outlet_name) return o.outlet_name.trim().toLowerCase() === allOutlets.find(m => m.id.toString() === outlet)?.name.toLowerCase()
        return false
      })
      const matchesDate = !date || (e.dates?.some(d => d.event_date === date) ?? false)
      return matchesSearch && matchesStatus && matchesCategory && matchesOutlet && matchesDate
    })
  }, [events, search, status, category, outlet, date])

  const hasFilters = search || status !== 'all' || category !== 'all' || outlet !== 'all' || date
  const clearFilters = () => {
    setSearch('')
    setStatus('all')
    setCategory('all')
    setOutlet('all')
    setDate('')
  }

  const inputClass = 'w-full rounded-xl border border-[#DCE8E3] bg-[#F9FDFB] py-2.5 px-3 text-sm text-[#0F1F1A] placeholder:text-[#9CB3AC] focus:border-[#2FBF9B] focus:outline-none'

  if (!canView) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="max-w-md text-gray-600">You do not have permission to view events.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0F1F1A] sm:text-3xl">Events</h1>
          <p className="text-sm text-[#5F6F68]">Manage workshops, tastings, and café events</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-4 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {canCreate && (
            <Link
              href="/admin/events/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#167E68] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0F1F1A]"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </Link>
          )}
        </div>
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
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CB3AC]" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
            <option value="all">All Status</option>
            {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={outlet} onChange={e => setOutlet(e.target.value)} className={inputClass}>
            <option value="all">All Outlets</option>
            {allOutlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Event table */}
      <div className={`${card} overflow-hidden`}>
        {loading ? (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FDFB]">
                  <tr>
                    {['Image', 'Title', 'Category', 'Date', 'Time', 'Outlet', 'Price', 'Bookings', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase text-[#5F6F68]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F8F6]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><div className="h-10 w-14 animate-pulse rounded-lg bg-[#DCE8E3]" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-[#DCE8E3]" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-[#DCE8E3]" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-[#DCE8E3]" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-[#DCE8E3]" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-28 animate-pulse rounded bg-[#DCE8E3]" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-[#DCE8E3]" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-14 animate-pulse rounded bg-[#DCE8E3]" /></td>
                      <td className="px-4 py-3"><div className="h-6 w-20 animate-pulse rounded-full bg-[#DCE8E3]" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-[#DCE8E3]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-[#E85D4C]" />
            <p className="text-lg font-black text-[#0F1F1A]">Unable to load events</p>
            <p className="mb-4 text-sm text-[#5F6F68]">Please try again.</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl bg-[#167E68] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0F1F1A]"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto mb-3 h-12 w-12 text-[#DCE8E3]" />
            <p className="text-lg font-black text-[#0F1F1A]">No events found</p>
            <p className="mb-4 text-sm text-[#5F6F68]">Create your first Big Bean Cafe event.</p>
            {canCreate && (
              <Link
                href="/admin/events/create"
                className="inline-flex items-center gap-2 rounded-xl bg-[#167E68] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0F1F1A]"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </Link>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto mb-3 h-12 w-12 text-[#DCE8E3]" />
            <p className="text-lg font-black text-[#0F1F1A]">No events match your filters</p>
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#DCE8E3] bg-white px-4 py-2 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FDFB]">
                <tr>
                  {['Image', 'Title', 'Category', 'Date', 'Time', 'Outlet', 'Price', 'Bookings', 'Status', 'Actions'].map(h => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-black uppercase text-[#5F6F68]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F8F6]">
                {filtered.map(event => {
                  const imgUrl = getImageUrl(event.event_thumbnail || event.event_banner)
                  return (
                    <tr key={event.id} className="hover:bg-[#F9FDFB]">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {imgUrl ? (
                          <img src={imgUrl} alt={event.title} className="h-10 w-14 rounded-lg border border-[#DCE8E3] object-cover" />
                        ) : (
                          <div className="flex h-10 w-14 items-center justify-center rounded-lg border border-[#DCE8E3] bg-[#F3F8F6]">
                            <Calendar className="h-4 w-4 text-[#9CB3AC]" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-[200px] truncate text-sm font-bold text-[#0F1F1A]">{event.title}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5F6F68]">{event.category || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5F6F68]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#9CB3AC]" />
                          {dateRange(event.dates)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5F6F68]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#9CB3AC]" />
                          {timeText(event.dates)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5F6F68]">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-[#9CB3AC]" />
                          {outletText(event.outlets)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-[#0F1F1A]">{priceFrom(event.ticket_types)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#0F1F1A]">{event.total_bookings ?? 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${statusClass(event.status)}`}>
                          {event.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/events/${event.slug}`}
                            target="_blank"
                            scroll={false}
                            title="View"
                            className="rounded-lg p-2 text-[#5F6F68] hover:bg-[#F3F8F6]"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {canEdit && (
                            <Link
                              href={`/admin/events/${event.id}/edit`}
                              scroll={false}
                              title="Edit"
                              className="rounded-lg p-2 text-[#C9943A] hover:bg-[#FFF3DE]"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/event-bookings?event_id=${event.id}`}
                            scroll={false}
                            title="Bookings"
                            className="rounded-lg p-2 text-[#167E68] hover:bg-[#EAF8F3]"
                          >
                            <BookOpen className="h-4 w-4" />
                          </Link>
                          {canDelete && (
                            <button
                              onClick={() => {
                                setDeleteModal(event)
                                setForceConfirm('')
                              }}
                              disabled={deleting === event.id}
                              title="Delete"
                              className="rounded-lg p-2 text-[#E85D4C] hover:bg-[#FDE8E8] disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_18px_45px_rgba(31,42,36,0.16)]">
            <h3 className="mb-2 font-heading text-2xl font-bold text-[#0F1F1A]">Delete Event</h3>
            <p className="mb-6 text-sm text-[#5F6F68]">This event may have bookings. Choose an action.</p>

            <div className="mb-4 space-y-3">
              <button
                onClick={() => { handleDelete(deleteModal.id, false); setDeleteModal(null) }}
                disabled={deleting === deleteModal.id}
                className="w-full rounded-xl bg-[#FFF3DE] px-4 py-3 text-sm font-bold text-[#8B4513] hover:bg-[#F5D3A3] disabled:opacity-50"
              >
                Cancel Event
              </button>

              {isSuperAdmin() && (
                <div className="rounded-xl border border-[#FECACA] bg-[#FEE2E2] p-4">
                  <p className="mb-2 text-xs font-bold text-[#991B1B]">Force Delete Permanently</p>
                  <input
                    type="text"
                    value={forceConfirm}
                    onChange={e => setForceConfirm(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="mb-3 w-full rounded-xl border border-[#FECACA] bg-white px-3 py-2 text-sm text-[#0F1F1A] placeholder:text-[#9CB3AC] focus:outline-none"
                  />
                  <button
                    onClick={() => { handleDelete(deleteModal.id, true); setDeleteModal(null) }}
                    disabled={deleting === deleteModal.id || forceConfirm !== 'DELETE'}
                    className="w-full rounded-xl bg-[#E85D4C] px-4 py-3 text-sm font-bold text-white hover:bg-[#C2412C] disabled:opacity-50"
                  >
                    Force Delete Permanently
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setDeleteModal(null)}
              className="w-full rounded-xl border border-[#DCE8E3] bg-white px-4 py-2.5 text-sm font-bold text-[#5F6F68] hover:bg-[#F3F8F6]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
