'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import apiRequest from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Search, PartyPopper, ChevronRight, MoreVertical, Mail, Phone, Eye,
  Copy, Check, RefreshCw, X, Inbox, MessageSquare, CheckCircle2, Archive,
} from 'lucide-react'
import { STATUS_META, OCCASION_LABELS } from '@/lib/privateEventMeta'
import PrivateEventReplyModal, { ReplyEnquiry } from '@/components/admin/PrivateEventReplyModal'

interface Enquiry {
  id: number
  enquiry_reference: string
  full_name: string
  phone: string
  email: string | null
  outlet_name: string | null
  outlet_slug: string | null
  occasion: string
  event_date: string | null
  date_not_decided: number
  guest_count: number | null
  status: string
  created_at: string
}

const EMPTY_FILTERS = { status: 'all', outlet: 'all', occasion: 'all', date_from: '', date_to: '', search: '' }
const STATUS_ORDER = ['new', 'contacted', 'qualified', 'quote_sent', 'confirmed', 'closed']

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const outletLabel = (e: Enquiry) =>
  (e.outlet_name || '').replace(/^Big Bean Cafe - /, '') || (e.outlet_slug === null ? 'Help me choose' : '—')

// ── Row actions dropdown ───────────────────────────────────────────────────────
function ActionsMenu({
  enquiry, onReply, onStatusChange,
}: {
  enquiry: Enquiry
  onReply: (e: Enquiry) => void
  onStatusChange: (id: number, status: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [copied, setCopied] = useState<'phone' | 'email' | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      const menuH = enquiry.email ? 330 : 285
      const top = r.bottom + menuH + 8 > window.innerHeight ? Math.max(8, r.top - menuH - 8) : r.bottom + 6
      setPos({ top, left: Math.max(8, r.right - 224) })
    }
    setOpen((v) => !v)
  }

  const copy = async (key: 'phone' | 'email', value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      setTimeout(() => setCopied(null), 1600)
    } catch { toast.error('Copy failed') }
  }

  const itemCls = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold text-[#5A4635] transition hover:bg-[#FAF5EE]'

  return (
    <>
      <button
        ref={btnRef} onClick={toggle} aria-label="Enquiry actions"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#EAE2D6] bg-white text-[#8A7059] transition hover:border-[#C9943A] hover:text-[#C9943A]"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div
          ref={menuRef}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[60] w-56 overflow-hidden rounded-2xl border border-[#EAE2D6] bg-white py-1.5 shadow-xl"
        >
          <Link href={`/admin/private-event-enquiries/${enquiry.id}`} className={itemCls} onClick={() => setOpen(false)}>
            <Eye className="h-4 w-4 text-[#C9943A]" /> View Details
          </Link>
          {enquiry.email ? (
            <button onClick={() => { setOpen(false); onReply(enquiry) }} className={itemCls}>
              <Mail className="h-4 w-4 text-[#C9943A]" /> Reply by Email
            </button>
          ) : (
            <p className="px-4 py-2.5 text-[12px] italic text-[#B09880]">No email provided</p>
          )}
          <button onClick={() => copy('phone', enquiry.phone)} className={itemCls}>
            {copied === 'phone' ? <Check className="h-4 w-4 text-[#167E68]" /> : <Phone className="h-4 w-4 text-[#C9943A]" />}
            {copied === 'phone' ? 'Copied!' : 'Copy Phone'}
          </button>
          {enquiry.email && (
            <button onClick={() => copy('email', enquiry.email!)} className={itemCls}>
              {copied === 'email' ? <Check className="h-4 w-4 text-[#167E68]" /> : <Copy className="h-4 w-4 text-[#C9943A]" />}
              {copied === 'email' ? 'Copied!' : 'Copy Email'}
            </button>
          )}
          <div className="my-1.5 border-t border-[#F1E6D6]" />
          <p className="px-4 pb-1 pt-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#B09880]">Update Status</p>
          <div className="flex flex-wrap gap-1.5 px-4 pb-2 pt-1">
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => { setOpen(false); onStatusChange(enquiry.id, s) }}
                disabled={s === enquiry.status}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                  s === enquiry.status
                    ? 'cursor-default bg-[#3D1F0D] text-white'
                    : 'bg-[#F6F3EE] text-[#6B4F3A] hover:bg-[#C9943A] hover:text-white'
                }`}
              >
                {STATUS_META[s]?.label || s}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function PrivateEventEnquiries() {
  const [items, setItems] = useState<Enquiry[]>([])
  const [outlets, setOutlets] = useState<{ slug: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [stats, setStats] = useState<{ total: number; new: number; contacted: number; confirmed: number; closed: number } | null>(null)
  const [replyTo, setReplyTo] = useState<ReplyEnquiry | null>(null)
  const [statusBusy, setStatusBusy] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => v && v !== 'all' && q.set(k, v))
      const res = await apiRequest(`/admin/private-event-enquiries?${q.toString()}`)
      const data = await res.json()
      setItems(data.data || [])
    } catch {
      toast.error('Failed to load enquiries')
    }
    setLoading(false)
  }, [filters])

  const loadStats = useCallback(async () => {
    try {
      const res = await apiRequest('/admin/private-event-enquiries')
      const data = await res.json()
      const rows: Enquiry[] = data.data || []
      setStats({
        total: rows.length,
        new: rows.filter((r) => r.status === 'new').length,
        contacted: rows.filter((r) => r.status === 'contacted').length,
        confirmed: rows.filter((r) => r.status === 'confirmed').length,
        closed: rows.filter((r) => r.status === 'closed').length,
      })
    } catch { /* stats are best-effort */ }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadStats() }, [loadStats])

  useEffect(() => {
    apiRequest('/outlets/active')
      .then((r) => r.json())
      .then((d) => setOutlets((d.data || []).filter((o: any) => o.slug)))
      .catch(() => {})
  }, [])

  const updateStatus = async (id: number, status: string) => {
    setStatusBusy(id)
    try {
      const res = await apiRequest(`/admin/private-event-enquiries/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Status updated to "${STATUS_META[status]?.label || status}"`)
        setItems((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)))
        loadStats()
      } else {
        toast.error(data.message || 'Failed to update status')
      }
    } catch {
      toast.error('Failed to update status')
    }
    setStatusBusy(null)
  }

  const filtersActive = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS)

  const statCards = [
    { label: 'Total Enquiries', value: stats?.total, icon: Inbox, cls: 'text-[#3D1F0D] bg-[#F5EBDD]' },
    { label: 'New', value: stats?.new, icon: MessageSquare, cls: 'text-[#167E68] bg-[#EAF8F3]' },
    { label: 'Contacted', value: stats?.contacted, icon: Mail, cls: 'text-[#8B4A2F] bg-[#FFF3D9]' },
    { label: 'Confirmed', value: stats?.confirmed, icon: CheckCircle2, cls: 'text-[#3E6B34] bg-[#DFF1DC]' },
    { label: 'Closed', value: stats?.closed, icon: Archive, cls: 'text-[#8A7059] bg-[#F1EAE2]' },
  ]

  const fieldCls =
    'w-full min-w-0 rounded-xl border border-[#E4D5BF] bg-white px-3.5 py-2.5 text-sm text-[#3D1F0D] focus:border-[#C9943A] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/25'

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#3D1F0D]">Private Event Enquiries</h1>
        <p className="mt-1 text-sm text-[#8A7059]">Enquiries received from the /private-events enquiry form</p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#EAE2D6] bg-white px-4 py-3.5 shadow-[0_8px_30px_rgba(61,31,13,0.05)]">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cls}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-black leading-none text-[#3D1F0D]">{value ?? '—'}</p>
              <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.06em] text-[#B09880]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-[#EAE2D6] bg-white p-4 shadow-[0_8px_30px_rgba(61,31,13,0.05)]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B09880]" />
            <input
              type="search" placeholder="Search name, phone, reference…"
              value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className={`${fieldCls} pl-10`}
            />
          </div>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={fieldCls}>
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((k) => <option key={k} value={k}>{STATUS_META[k]?.label || k}</option>)}
          </select>
          <select value={filters.outlet} onChange={(e) => setFilters({ ...filters, outlet: e.target.value })} className={fieldCls}>
            <option value="all">All outlets</option>
            {outlets.map((o) => <option key={o.slug} value={o.slug}>{o.name.replace(/^Big Bean Cafe - /, '')}</option>)}
          </select>
          <select value={filters.occasion} onChange={(e) => setFilters({ ...filters, occasion: e.target.value })} className={fieldCls}>
            <option value="all">All occasions</option>
            {Object.entries(OCCASION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} className={fieldCls} aria-label="From date" />
          <input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} className={fieldCls} aria-label="To date" />
          {filtersActive && (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#E4D5BF] px-3.5 py-2.5 text-sm font-bold text-[#8B4A2F] transition hover:bg-[#FFF3D9]"
            >
              <X className="h-3.5 w-3.5" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#EAE2D6] bg-white py-20 text-center text-[#8A7059]">Loading…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-[#EAE2D6] bg-white py-20 text-center">
          <PartyPopper className="mx-auto mb-3 h-12 w-12 text-[#E4D5BF]" />
          <p className="font-semibold text-[#6B4F3A]">No enquiries found</p>
          <p className="mt-1 text-xs text-[#8A7059]">Try adjusting the filters.</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#EAE2D6] bg-white shadow-[0_8px_30px_rgba(61,31,13,0.05)] lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-[13px]">
                <thead>
                  <tr className="border-b border-[#F1E6D6] bg-[#FAF5EE]">
                    {['Reference', 'Customer', 'Phone', 'Outlet', 'Occasion', 'Preferred Date', 'Guests', 'Status', 'Received', ''].map((h) => (
                      <th key={h} className={`whitespace-nowrap px-4 py-3.5 text-[11px] font-black uppercase tracking-[0.08em] text-[#8A7059] ${h === '' ? 'text-right' : 'text-left'}`}>
                        {h || 'Actions'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((e) => (
                    <tr key={e.id} className="border-b border-[#F7EFE7] align-middle transition-colors last:border-0 hover:bg-[#FAF5EE]">
                      <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-bold text-[#8B4A2F]">{e.enquiry_reference}</td>
                      <td className="max-w-[170px] truncate px-4 py-4 font-semibold text-[#3D1F0D]" title={e.full_name}>{e.full_name}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-[#6B4F3A]">{e.phone}</td>
                      <td className="max-w-[150px] truncate px-4 py-4 text-[#6B4F3A]" title={outletLabel(e)}>{outletLabel(e)}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-[#6B4F3A]">{OCCASION_LABELS[e.occasion] || e.occasion}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-[#6B4F3A]">{e.date_not_decided ? 'Not decided' : formatDate(e.event_date)}</td>
                      <td className="px-4 py-4 text-center text-[#6B4F3A]">{e.guest_count ?? '—'}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_META[e.status]?.cls || 'bg-[#F1EAE2] text-[#8A7059]'}`}>
                          {statusBusy === e.id && <RefreshCw className="h-3 w-3 animate-spin" />}
                          {STATUS_META[e.status]?.label || e.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-[#8A7059]">{formatDate(e.created_at)}</td>
                      <td className="px-4 py-4 text-right">
                        <ActionsMenu enquiry={e} onReply={(x) => setReplyTo(x)} onStatusChange={updateStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile / tablet cards ── */}
          <div className="grid gap-3 lg:hidden">
            {items.map((e) => (
              <div key={e.id} className="rounded-2xl border border-[#EAE2D6] bg-white p-4 shadow-[0_8px_30px_rgba(61,31,13,0.05)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-bold text-[#8B4A2F]">{e.enquiry_reference}</p>
                    <p className="mt-0.5 truncate font-semibold text-[#3D1F0D]">{e.full_name}</p>
                  </div>
                  <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_META[e.status]?.cls || 'bg-[#F1EAE2] text-[#8A7059]'}`}>
                    {STATUS_META[e.status]?.label || e.status}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                  <div><dt className="text-[10px] font-bold uppercase tracking-wider text-[#B09880]">Phone</dt><dd className="text-[#6B4F3A]">{e.phone}</dd></div>
                  <div><dt className="text-[10px] font-bold uppercase tracking-wider text-[#B09880]">Outlet</dt><dd className="truncate text-[#6B4F3A]">{outletLabel(e)}</dd></div>
                  <div><dt className="text-[10px] font-bold uppercase tracking-wider text-[#B09880]">Occasion</dt><dd className="text-[#6B4F3A]">{OCCASION_LABELS[e.occasion] || e.occasion}</dd></div>
                  <div><dt className="text-[10px] font-bold uppercase tracking-wider text-[#B09880]">Date / Guests</dt><dd className="text-[#6B4F3A]">{e.date_not_decided ? 'Not decided' : formatDate(e.event_date)} · {e.guest_count ?? '—'}</dd></div>
                </dl>
                <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[#F7EFE7] pt-3">
                  <span className="text-[11px] text-[#B09880]">{formatDate(e.created_at)}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/private-event-enquiries/${e.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#3D1F0D] px-3 py-1.5 text-xs font-bold text-[#FFF7ED] transition hover:bg-[#5A2D1D]"
                    >
                      View <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <ActionsMenu enquiry={e} onReply={(x) => setReplyTo(x)} onStatusChange={updateStatus} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <PrivateEventReplyModal
        enquiry={replyTo}
        onClose={() => setReplyTo(null)}
        onSent={(newStatus) => {
          if (newStatus && replyTo) {
            setItems((prev) => prev.map((e) => (e.id === replyTo.id ? { ...e, status: newStatus } : e)))
            loadStats()
          }
        }}
      />
    </div>
  )
}
