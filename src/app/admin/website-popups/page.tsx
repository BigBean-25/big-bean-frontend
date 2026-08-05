'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus, Edit, Trash2, Megaphone, Eye, ToggleLeft, ToggleRight,
  Search, Filter, Calendar, Link2, Link2Off, Clock, RefreshCw
} from 'lucide-react'
import { apiRequest } from '@/lib/api'
import toast from 'react-hot-toast'

const API_URL  = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace(/\/api$/, '')

const getImageUrl = (img?: string | null) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

interface Popup {
  id: number
  title: string
  slug: string
  popup_type: 'merchandise' | 'event' | 'offer' | 'general'
  short_description: string | null
  desktop_image: string
  mobile_image: string | null
  link_enabled: number
  button_text: string | null
  button_url: string | null
  display_delay_ms: number
  display_frequency: string
  target_devices: string
  priority: number
  start_at: string | null
  end_at: string | null
  status: number
  updated_at: string
}

const TYPE_LABELS: Record<string, string> = {
  merchandise: 'Merchandise',
  event: 'Event',
  offer: 'Offer',
  general: 'General',
}
const TYPE_COLORS: Record<string, string> = {
  merchandise: 'bg-amber-100 text-amber-800',
  event:       'bg-purple-100 text-purple-800',
  offer:       'bg-emerald-100 text-emerald-800',
  general:     'bg-blue-100 text-blue-800',
}
const FREQ_LABELS: Record<string, string> = {
  every_visit:      'Every Visit',
  once_per_session: 'Per Session',
  once_per_day:     'Per Day',
  show_once:        'Once Only',
}

function getPopupStatus(p: Popup): { label: string; className: string } {
  const now = new Date()
  if (!p.status) return { label: 'Inactive', className: 'bg-gray-100 text-gray-600' }
  if (p.start_at && new Date(p.start_at) > now) return { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' }
  if (p.end_at && new Date(p.end_at) < now) return { label: 'Expired', className: 'bg-red-100 text-red-700' }
  return { label: 'Active', className: 'bg-green-100 text-green-800' }
}

function formatDate(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminWebsitePopupsPage() {
  const [popups,    setPopups]    = useState<Popup[]>([])
  const [loading,   setLoading]   = useState(true)
  const [deleting,  setDeleting]  = useState<number | null>(null)
  const [toggling,  setToggling]  = useState<number | null>(null)
  const [search,    setSearch]    = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [preview,   setPreview]   = useState<Popup | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Popup | null>(null)

  const fetchPopups = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (typeFilter) params.set('type', typeFilter)
    if (statusFilter !== '') params.set('status', statusFilter)
    apiRequest(`/admin/website-popups?${params}`)
      .then(r => r.json())
      .then(d => setPopups(Array.isArray(d.data) ? d.data : []))
      .catch(() => setPopups([]))
      .finally(() => setLoading(false))
  }, [search, typeFilter, statusFilter])

  useEffect(() => { fetchPopups() }, [fetchPopups])

  const handleToggle = async (p: Popup) => {
    setToggling(p.id)
    try {
      const res = await apiRequest(`/admin/website-popups/${p.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: p.status ? 0 : 1 }),
      })
      const d = await res.json()
      if (d.success) {
        toast.success(d.message)
        fetchPopups()
      } else {
        toast.error(d.message || 'Failed to update status')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setToggling(null)
    }
  }

  const handleDelete = async (p: Popup) => {
    setDeleting(p.id)
    setConfirmDelete(null)
    try {
      const res = await apiRequest(`/admin/website-popups/${p.id}`, { method: 'DELETE' })
      const d = await res.json()
      if (d.success) {
        toast.success('Popup deleted')
        fetchPopups()
      } else {
        toast.error(d.message || 'Delete failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1F2A24] lg:text-3xl">Website Popups</h1>
          <p className="mt-1 text-sm text-[#607064]">Create and manage promotional popups shown across the public website.</p>
        </div>
        <Link
          href="/admin/website-popups/new"
          className="flex items-center gap-2 rounded-full bg-[#3D1F0D] px-5 py-2.5 text-sm font-black text-[#FFF7ED] shadow hover:bg-[#2FBF9B] hover:text-[#120905] transition"
        >
          <Plus className="h-4 w-4" />
          Add Popup
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-[#DDE8DD] bg-white px-3 py-2 flex-1 min-w-[180px] max-w-xs">
          <Search className="h-4 w-4 text-[#9DB0A1] shrink-0" />
          <input
            type="text"
            placeholder="Search popups…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none text-[#1F2A24] placeholder:text-[#9DB0A1]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="rounded-xl border border-[#DDE8DD] bg-white px-3 py-2 text-sm text-[#1F2A24] outline-none"
        >
          <option value="">All Types</option>
          <option value="merchandise">Merchandise</option>
          <option value="event">Event</option>
          <option value="offer">Offer</option>
          <option value="general">General</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[#DDE8DD] bg-white px-3 py-2 text-sm text-[#1F2A24] outline-none"
        >
          <option value="">All Statuses</option>
          <option value="1">Active / Scheduled</option>
          <option value="0">Inactive</option>
        </select>
        <button onClick={fetchPopups} className="rounded-xl border border-[#DDE8DD] bg-white p-2 text-[#607064] hover:bg-[#EEF4EF] transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table — desktop */}
      {loading ? (
        <div className="py-16 text-center text-sm text-[#9DB0A1]">Loading…</div>
      ) : popups.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Megaphone className="h-14 w-14 text-[#DDE8DD]" />
          <p className="text-lg font-black text-[#1F2A24]">No website popups created yet.</p>
          <p className="text-sm text-[#9DB0A1]">Create your first promotional popup to engage visitors.</p>
          <Link
            href="/admin/website-popups/new"
            className="mt-2 flex items-center gap-2 rounded-full bg-[#3D1F0D] px-5 py-2.5 text-sm font-black text-[#FFF7ED] hover:bg-[#2FBF9B] hover:text-[#120905] transition"
          >
            <Plus className="h-4 w-4" />
            Create Your First Popup
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#DDE8DD] bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#DDE8DD] bg-[#F8FBF7]">
                  <tr>
                    {['Preview', 'Title', 'Type', 'Link', 'Schedule', 'Frequency', 'Priority', 'Status', 'Updated', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-[#607064]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F5F1]">
                  {popups.map(p => {
                    const imgUrl = getImageUrl(p.desktop_image)
                    const { label: statusLabel, className: statusClass } = getPopupStatus(p)
                    return (
                      <tr key={p.id} className="hover:bg-[#F8FBF7]">
                        <td className="px-4 py-3">
                          {imgUrl ? (
                            <img src={imgUrl} alt={p.title} className="h-10 w-16 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-[#EEF4EF]">
                              <Megaphone className="h-4 w-4 text-[#9DB0A1]" />
                            </div>
                          )}
                        </td>
                        <td className="max-w-[180px] px-4 py-3">
                          <p className="truncate text-sm font-bold text-[#1F2A24]">{p.title}</p>
                          <p className="truncate text-xs text-[#9DB0A1]">{p.target_devices === 'all' ? 'All devices' : p.target_devices === 'desktop' ? 'Desktop only' : 'Mobile only'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-black ${TYPE_COLORS[p.popup_type] || 'bg-gray-100 text-gray-600'}`}>
                            {TYPE_LABELS[p.popup_type] || p.popup_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {p.link_enabled ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700"><Link2 className="h-3.5 w-3.5" /> Linked</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-[#9DB0A1]"><Link2Off className="h-3.5 w-3.5" /> No Link</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#607064]">
                          {p.start_at || p.end_at ? (
                            <div className="flex flex-col gap-0.5">
                              {p.start_at && <span>From {formatDate(p.start_at)}</span>}
                              {p.end_at   && <span>Until {formatDate(p.end_at)}</span>}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#607064]">{FREQ_LABELS[p.display_frequency] || p.display_frequency}</td>
                        <td className="px-4 py-3 text-sm font-bold text-[#1F2A24]">{p.priority}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-black ${statusClass}`}>{statusLabel}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#9DB0A1]">{formatDate(p.updated_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setPreview(p)} title="Preview" className="rounded-lg p-1.5 text-[#9DB0A1] hover:bg-[#EEF4EF] hover:text-[#1F2A24] transition">
                              <Eye className="h-4 w-4" />
                            </button>
                            <Link href={`/admin/website-popups/${p.id}/edit`} title="Edit" className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition">
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleToggle(p)}
                              disabled={toggling === p.id}
                              title={p.status ? 'Disable' : 'Enable'}
                              className="rounded-lg p-1.5 transition hover:bg-[#EEF4EF] disabled:opacity-40"
                            >
                              {p.status
                                ? <ToggleRight className="h-4 w-4 text-emerald-600" />
                                : <ToggleLeft  className="h-4 w-4 text-[#9DB0A1]" />}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(p)}
                              disabled={deleting === p.id}
                              title="Delete"
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {popups.map(p => {
              const imgUrl = getImageUrl(p.desktop_image)
              const { label: statusLabel, className: statusClass } = getPopupStatus(p)
              return (
                <div key={p.id} className="rounded-2xl border border-[#DDE8DD] bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.title} className="h-12 w-20 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-[#EEF4EF]">
                        <Megaphone className="h-5 w-5 text-[#9DB0A1]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-[#1F2A24]">{p.title}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-black ${TYPE_COLORS[p.popup_type] || 'bg-gray-100 text-gray-600'}`}>{TYPE_LABELS[p.popup_type]}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-black ${statusClass}`}>{statusLabel}</span>
                        {p.link_enabled ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Linked</span> : null}
                      </div>
                      <p className="mt-1 text-xs text-[#9DB0A1]">{FREQ_LABELS[p.display_frequency]} · Priority {p.priority}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-[#F0F5F1] pt-3">
                    <button onClick={() => setPreview(p)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-[#607064] hover:bg-[#EEF4EF] transition">
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </button>
                    <Link href={`/admin/website-popups/${p.id}/edit`} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Link>
                    <button onClick={() => handleToggle(p)} disabled={toggling === p.id}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-40"
                    >
                      {p.status ? <><ToggleRight className="h-3.5 w-3.5 text-emerald-600" /><span className="text-emerald-700">Enabled</span></> : <><ToggleLeft className="h-3.5 w-3.5 text-[#9DB0A1]" /><span className="text-[#607064]">Disabled</span></>}
                    </button>
                    <button onClick={() => setConfirmDelete(p)} disabled={deleting === p.id}
                      className="ml-auto flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-40">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <div className="relative max-h-[90dvh] w-[min(calc(100vw-32px),520px)] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50">
              ✕
            </button>
            {getImageUrl(preview.desktop_image) && (
              <img src={getImageUrl(preview.desktop_image)!} alt={preview.title} className="w-full object-contain" style={{ aspectRatio: '3/2' }} />
            )}
            <div className="p-5">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-black ${TYPE_COLORS[preview.popup_type]}`}>{TYPE_LABELS[preview.popup_type]}</span>
              <h2 className="mt-2 font-heading text-xl font-black text-[#1F2A24]">{preview.title}</h2>
              {preview.short_description && <p className="mt-1.5 text-sm text-[#607064]">{preview.short_description}</p>}
              {!!preview.link_enabled && preview.button_text && (
                <div className="mt-4">
                  <span className="inline-block rounded-full bg-[#3D1F0D] px-5 py-2.5 text-sm font-black text-[#FFF7ED]">{preview.button_text}</span>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[#F0F5F1] pt-3 text-xs text-[#9DB0A1]">
                <span>Freq: {FREQ_LABELS[preview.display_frequency]}</span>
                <span>·</span>
                <span>Devices: {preview.target_devices}</span>
                <span>·</span>
                <span>Delay: {preview.display_delay_ms}ms</span>
                <span>·</span>
                <span>Priority: {preview.priority}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[min(calc(100vw-32px),400px)] rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="font-heading text-lg font-black text-[#1F2A24]">Delete this website popup?</h3>
            <p className="mt-2 text-sm text-[#607064]"><strong>"{confirmDelete.title}"</strong> will be permanently removed. This action cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-full border border-[#DDE8DD] py-2.5 text-sm font-bold text-[#607064] hover:bg-[#F8FBF7] transition">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting !== null}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-black text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting !== null ? 'Deleting…' : 'Delete Popup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
