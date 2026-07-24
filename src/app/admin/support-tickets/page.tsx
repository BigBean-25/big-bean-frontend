'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { HeadphonesIcon, Search, RefreshCw, X, ExternalLink, Tag } from 'lucide-react'
import { apiRequest } from '@/lib/api'

type Ticket = {
  id: number; ticket_number: string; subject: string; category: string
  priority: string; status: string; customer_name: string | null
  customer_email: string | null; customer_phone: string | null
  created_at: string; updated_at: string; message_count: number
  last_message: string | null; last_message_at: string | null; last_sender_type: string | null
}
type Stats = { total: number; open_count: number; in_progress_count: number; waiting_count: number; resolved_count: number; closed_count: number }

const STATUS_META: Record<string, { label: string; color: string }> = {
  open:             { label: 'Open',           color: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_progress:      { label: 'In Progress',     color: 'bg-blue-50 text-blue-700 border-blue-200' },
  waiting_customer: { label: 'Awaiting Reply',  color: 'bg-purple-50 text-purple-700 border-purple-200' },
  resolved:         { label: 'Resolved',        color: 'bg-green-50 text-green-700 border-green-200' },
  closed:           { label: 'Closed',          color: 'bg-gray-100 text-gray-600 border-gray-200' },
}
const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low:    { label: 'Low',    color: 'bg-gray-100 text-gray-500 border-gray-200' },
  medium: { label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  high:   { label: 'High',   color: 'bg-orange-50 text-orange-700 border-orange-200' },
  urgent: { label: 'Urgent', color: 'bg-red-50 text-red-700 border-red-200' },
}

const STATUS_FILTERS = ['all', 'open', 'in_progress', 'waiting_customer', 'resolved', 'closed']
const PRIORITY_FILTERS = ['all', 'urgent', 'high', 'medium', 'low']


export default function AdminSupportTickets() {
  const [tickets, setTickets]   = useState<Ticket[]>([])
  const [stats, setStats]       = useState<Stats | null>(null)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [statusF, setStatusF]   = useState('all')
  const [priorityF, setPriorityF] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusF !== 'all') params.set('status', statusF)
      if (priorityF !== 'all') params.set('priority', priorityF)
      if (search.trim()) params.set('search', search.trim())
      params.set('limit', '200')
      const r = await apiRequest(`/admin-support/tickets?${params}`)
      const d = await r.json()
      if (d.success) { setTickets(d.data || []); setStats(d.stats || null) }
    } finally { setLoading(false) }
  }, [statusF, priorityF, search])

  useEffect(() => { load() }, [load])

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 text-sm mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total',       value: stats.total,              key: 'all',             color: 'text-gray-800' },
            { label: 'Open',        value: stats.open_count,         key: 'open',            color: 'text-amber-700' },
            { label: 'In Progress', value: stats.in_progress_count,  key: 'in_progress',     color: 'text-blue-700' },
            { label: 'Waiting',     value: stats.waiting_count,      key: 'waiting_customer',color: 'text-purple-700' },
            { label: 'Resolved',    value: stats.resolved_count,     key: 'resolved',        color: 'text-green-700' },
            { label: 'Closed',      value: stats.closed_count,       key: 'closed',          color: 'text-gray-500' },
          ].map(s => (
            <button key={s.key} onClick={() => setStatusF(s.key)}
              className={`rounded-xl border px-4 py-3 text-left transition hover:shadow-sm ${statusF === s.key ? 'border-[#3D1F0D] bg-[#FFF7ED]' : 'border-gray-200 bg-white'}`}>
              <div className={`text-2xl font-bold ${s.color}`}>{Number(s.value) || 0}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search ticket#, name, email, subject…"
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {PRIORITY_FILTERS.map(f => (
            <button key={f} onClick={() => setPriorityF(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition capitalize ${priorityF === f ? 'bg-[#3D1F0D] text-white border-[#3D1F0D]' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}>
              {f === 'all' ? 'All Priority' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-[#C9943A]" />
            Loading tickets…
          </div>
        ) : !tickets.length ? (
          <div className="p-12 text-center">
            <HeadphonesIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{statusF === 'all' && !search ? 'No support tickets yet.' : 'No tickets match your filters.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ticket #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Msgs</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map(t => {
                  const sm = STATUS_META[t.status] || STATUS_META['open']
                  const pm = PRIORITY_META[t.priority] || PRIORITY_META['medium']
                  const hasNewReply = t.last_sender_type === 'customer'
                  return (
                    <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${hasNewReply ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700 whitespace-nowrap">{t.ticket_number}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-semibold text-gray-900 truncate">{t.subject}</p>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1"><Tag className="w-2.5 h-2.5" />{t.category}</span>
                        {t.last_message && <p className={`text-xs mt-0.5 truncate max-w-[180px] ${hasNewReply ? 'text-amber-700 font-medium' : 'text-gray-400'}`}>{t.last_message}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-sm">{t.customer_name || '—'}</p>
                        {t.customer_email && <p className="text-xs text-gray-400">{t.customer_email}</p>}
                        {t.customer_phone && <p className="text-xs text-gray-400">{t.customer_phone}</p>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${sm.color}`}>{sm.label}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${pm.color}`}>{pm.label}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{t.message_count || 0}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(t.created_at)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/support-tickets/${t.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3D1F0D] text-white text-xs font-semibold hover:bg-[#C9943A] transition-colors">
                          <ExternalLink className="w-3 h-3" /> View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
