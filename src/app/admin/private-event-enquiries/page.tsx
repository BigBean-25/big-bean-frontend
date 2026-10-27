'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import apiRequest from '@/lib/api'
import toast from 'react-hot-toast'
import { Search, PartyPopper, ChevronRight } from 'lucide-react'
import { STATUS_META, OCCASION_LABELS } from '@/lib/privateEventMeta'

interface Enquiry {
  id: number
  enquiry_reference: string
  full_name: string
  phone: string
  outlet_name: string | null
  outlet_slug: string | null
  occasion: string
  event_date: string | null
  date_not_decided: number
  guest_count: number | null
  status: string
  created_at: string
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export default function PrivateEventEnquiries() {
  const [items, setItems] = useState<Enquiry[]>([])
  const [outlets, setOutlets] = useState<{ slug: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: 'all', outlet: 'all', occasion: 'all', date_from: '', date_to: '', search: '' })

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

  useEffect(() => { load() }, [load])

  useEffect(() => {
    apiRequest('/outlets/active')
      .then((r) => r.json())
      .then((d) => setOutlets((d.data || []).filter((o: any) => o.slug)))
      .catch(() => {})
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3D1F0D]">Private Event Enquiries</h1>
        <p className="mt-1 text-sm text-[#8A7059]">Leads from the /private-events enquiry form</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-3 rounded-2xl border border-[#EAE2D6] bg-white p-4 shadow-[0_8px_30px_rgba(61,31,13,0.05)] sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B09880]" />
          <input
            type="search" placeholder="Search name, phone, reference…"
            value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full rounded-xl border border-[#E4D5BF] bg-white py-2.5 pl-10 pr-3.5 text-sm focus:border-[#C9943A] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/25"
          />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-xl border border-[#E4D5BF] bg-white px-3.5 py-2.5 text-sm focus:border-[#C9943A] focus:outline-none">
          <option value="all">All statuses</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filters.outlet} onChange={(e) => setFilters({ ...filters, outlet: e.target.value })} className="rounded-xl border border-[#E4D5BF] bg-white px-3.5 py-2.5 text-sm focus:border-[#C9943A] focus:outline-none">
          <option value="all">All outlets</option>
          {outlets.map((o) => <option key={o.slug} value={o.slug}>{o.name.replace(/^Big Bean Cafe - /, '')}</option>)}
        </select>
        <select value={filters.occasion} onChange={(e) => setFilters({ ...filters, occasion: e.target.value })} className="rounded-xl border border-[#E4D5BF] bg-white px-3.5 py-2.5 text-sm focus:border-[#C9943A] focus:outline-none">
          <option value="all">All occasions</option>
          {Object.entries(OCCASION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <div className="flex gap-2">
          <input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} className="w-full rounded-xl border border-[#E4D5BF] bg-white px-2.5 py-2.5 text-xs focus:border-[#C9943A] focus:outline-none" aria-label="From date" />
          <input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} className="w-full rounded-xl border border-[#E4D5BF] bg-white px-2.5 py-2.5 text-xs focus:border-[#C9943A] focus:outline-none" aria-label="To date" />
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
        <div className="overflow-x-auto rounded-2xl border border-[#EAE2D6] bg-white shadow-[0_8px_30px_rgba(61,31,13,0.05)]">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-[#F1E6D6] bg-[#FAF5EE]">
                {['Reference', 'Customer', 'Phone', 'Outlet', 'Occasion', 'Preferred date', 'Guests', 'Status', 'Received', ''].map((h) => (
                  <th key={h} className={`px-5 py-3.5 font-semibold text-[#6B4F3A] ${h === '' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-b border-[#F7EFE7] transition-colors hover:bg-[#FAF5EE]">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-[#8B4A2F]">{e.enquiry_reference}</td>
                  <td className="px-5 py-3 font-semibold text-[#3D1F0D]">{e.full_name}</td>
                  <td className="px-5 py-3 text-[#6B4F3A]">{e.phone}</td>
                  <td className="px-5 py-3 text-[#6B4F3A]">{(e.outlet_name || '').replace(/^Big Bean Cafe - /, '') || '—'}</td>
                  <td className="px-5 py-3 text-[#6B4F3A]">{OCCASION_LABELS[e.occasion] || e.occasion}</td>
                  <td className="px-5 py-3 text-[#6B4F3A]">{e.date_not_decided ? 'Not decided' : formatDate(e.event_date)}</td>
                  <td className="px-5 py-3 text-[#6B4F3A]">{e.guest_count ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_META[e.status]?.cls || 'bg-[#F1EAE2] text-[#8A7059]'}`}>
                      {STATUS_META[e.status]?.label || e.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#8A7059]">{formatDate(e.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/private-event-enquiries/${e.id}`} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#C9943A] transition hover:bg-[#F5EBDD]">
                      View <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
