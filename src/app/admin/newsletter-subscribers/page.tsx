'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, Trash2, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react'
import apiRequest from '@/utils/api'

interface Subscriber {
  id: number
  email: string
  source: string
  status: 'active' | 'inactive'
  created_at: string
}

const FILTERS = ['All', 'Active', 'Inactive', 'footer', 'blog']

export default function NewsletterSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [actionId, setActionId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiRequest('/newsletter/subscribers')
      const d = await res.json()
      setSubscribers(d.success ? d.data : [])
    } catch { setSubscribers([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: number, status: 'active' | 'inactive') => {
    setActionId(id)
    try {
      await apiRequest(`/newsletter/subscribers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      setSubscribers((prev) => prev.map((s) => s.id === id ? { ...s, status } : s))
    } finally { setActionId(null) }
  }

  const deleteSubscriber = async (id: number) => {
    if (!confirm('Delete this subscriber?')) return
    setActionId(id)
    try {
      await apiRequest(`/newsletter/subscribers/${id}`, { method: 'DELETE' })
      setSubscribers((prev) => prev.filter((s) => s.id !== id))
    } finally { setActionId(null) }
  }

  const filtered = subscribers.filter((s) => {
    const q = search.toLowerCase()
    const matchSearch = !q || s.email.toLowerCase().includes(q) || s.source.toLowerCase().includes(q)
    const matchFilter =
      filter === 'All' ? true :
      filter === 'Active' ? s.status === 'active' :
      filter === 'Inactive' ? s.status === 'inactive' :
      s.source === filter
    return matchSearch && matchFilter
  })

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#FBF4EC] p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3D1F0D]">
              <Mail className="h-5 w-5 text-[#FFF7ED]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#3D1F0D]">Newsletter Subscribers</h1>
              <p className="text-sm text-[#9B6B50]">{subscribers.length} total subscriber{subscribers.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={load} className="flex items-center gap-2 rounded-full border border-[#E6C7A8] bg-white px-4 py-2 text-sm font-bold text-[#3D1F0D] transition hover:bg-[#F5E6D3]">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Search + Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B6B50]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email or source..."
              className="h-10 w-full rounded-full border border-[#E6C7A8] bg-white pl-9 pr-4 text-sm text-[#3D1F0D] outline-none focus:border-[#C9943A]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition ${filter === f ? 'bg-[#3D1F0D] text-white' : 'border border-[#E6C7A8] bg-white text-[#3D1F0D] hover:bg-[#F5E6D3]'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-[24px] border border-[#E6C7A8] bg-white shadow-sm">
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-[#F5E6D3]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Mail className="mx-auto mb-3 h-10 w-10 text-[#E6C7A8]" />
              <p className="font-bold text-[#9B6B50]">No subscribers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F5E6D3] bg-[#FBF4EC]">
                    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[#9B6B50]">Email</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[#9B6B50]">Source</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[#9B6B50]">Status</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-[#9B6B50]">Date</th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-[#9B6B50]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={s.id} className={`border-b border-[#F5E6D3] transition hover:bg-[#FFF7ED] ${i % 2 === 0 ? '' : 'bg-[#FEFAF6]'}`}>
                      <td className="px-5 py-3.5 font-semibold text-[#3D1F0D]">{s.email}</td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-[#F5E6D3] px-2.5 py-1 text-[10px] font-black uppercase text-[#6B3520]">{s.source}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${s.status === 'active' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#E65100]'}`}>
                          {s.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#9B6B50]">{formatDate(s.created_at)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {s.status === 'active' ? (
                            <button onClick={() => updateStatus(s.id, 'inactive')} disabled={actionId === s.id}
                              className="rounded-full border border-[#E6C7A8] px-3 py-1.5 text-[10px] font-black uppercase text-[#E65100] transition hover:bg-[#FFF3E0] disabled:opacity-50">
                              Deactivate
                            </button>
                          ) : (
                            <button onClick={() => updateStatus(s.id, 'active')} disabled={actionId === s.id}
                              className="rounded-full border border-[#E6C7A8] px-3 py-1.5 text-[10px] font-black uppercase text-[#2E7D32] transition hover:bg-[#E8F5E9] disabled:opacity-50">
                              Activate
                            </button>
                          )}
                          <button onClick={() => deleteSubscriber(s.id)} disabled={actionId === s.id}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#A92517] transition hover:bg-[#FFE8E8] disabled:opacity-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-3 text-right text-xs text-[#9B6B50]">Showing {filtered.length} of {subscribers.length}</p>
      </div>
    </div>
  )
}
