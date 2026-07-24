'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Eye, X, MessageCircle, ExternalLink } from 'lucide-react'
import apiRequest from '@/utils/api'
import Can from '@/components/admin/Can'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-700',
  quoted: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-green-100 text-green-700',
  closed: 'bg-gray-200 text-gray-600',
  rejected: 'bg-red-100 text-red-600'
}

interface Enquiry {
  id: number; company_name: string; contact_person: string; email: string; phone: string
  order_type: string | null; quantity: string | null; delivery_date: string | null
  delivery_address: string | null; budget_range: string | null; requirements: string | null
  status: string; admin_notes: string | null; created_at: string
}

export default function AdminCorporateEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => { fetchEnquiries() }, [search, filterStatus])

  const fetchEnquiries = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const res = await apiRequest(`/corporate-enquiries?${params}`, {})
      const data = await res.json()
      if (data.success) setEnquiries(data.data || [])
    } catch { } finally { setLoading(false) }
  }

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id)
    try {
      await apiRequest(`/corporate-enquiries/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
      fetchEnquiries()
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
    } catch { } finally { setUpdatingId(null) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this enquiry?')) return
    await apiRequest(`/corporate-enquiries/${id}`, {
      method: 'DELETE',})
    fetchEnquiries()
    if (selected?.id === id) setSelected(null)
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const STATUSES = ['all','new','contacted','proposal_sent','follow_up','converted','closed','rejected']

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Corporate Enquiries</h1>
          <p className="text-gray-500 text-sm mt-1">{enquiries.length} enquir{enquiries.length !== 1 ? 'ies' : 'y'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search company, contact, email, phone, order type..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${filterStatus === s ? 'text-white shadow-sm' : 'border border-gray-200 hover:border-[#C9943A] text-gray-600'}`}
              style={{ background: filterStatus === s ? 'linear-gradient(to right,#C9943A,#8B4A2F)' : 'white' }}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : enquiries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="font-semibold text-gray-500">No enquiries found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-4 font-semibold text-gray-600">Company</th>
                  <th className="text-left px-5 py-4 font-semibold text-gray-600">Contact</th>
                  <th className="text-left px-5 py-4 font-semibold text-gray-600">Order Type</th>
                  <th className="text-left px-5 py-4 font-semibold text-gray-600">Quantity</th>
                  <th className="text-left px-5 py-4 font-semibold text-gray-600">Delivery Date</th>
                  <th className="text-left px-5 py-4 font-semibold text-gray-600">Budget</th>
                  <th className="text-left px-5 py-4 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-5 py-4 font-semibold text-gray-600">Date</th>
                  <th className="text-right px-5 py-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enquiries.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">{e.company_name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-700">{e.contact_person}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{e.phone}</p>
                      <p className="text-xs text-gray-400">{e.email}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700 text-xs">{e.order_type || '—'}</td>
                    <td className="px-5 py-4 text-gray-500 text-xs max-w-[120px]"><p className="truncate">{e.quantity || '—'}</p></td>
                    <td className="px-5 py-4 text-xs text-gray-500">{fmtDate(e.delivery_date)}</td>
                    <td className="px-5 py-4 text-xs text-gray-500">{e.budget_range || '—'}</td>
                    <td className="px-5 py-4">
                      <Can module="corporate_enquiries" action="edit">
                        <div className="relative group">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize cursor-pointer ${STATUS_STYLES[e.status] || 'bg-gray-100 text-gray-500'}`}>{e.status}</span>
                          <div className="absolute left-0 top-7 z-10 hidden group-hover:flex flex-col bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden min-w-[130px]">
                            {['new','contacted','quoted','confirmed','closed','rejected'].map(s => (
                              <button key={s} onClick={() => updateStatus(e.id, s)} disabled={updatingId === e.id}
                                className={`px-4 py-2 text-xs text-left capitalize hover:bg-gray-50 font-semibold ${e.status === s ? 'text-[#C9943A]' : 'text-gray-700'}`}>{s}</button>
                            ))}
                          </div>
                        </div>
                      </Can>
                      <Can module="corporate_enquiries" action="edit" fallback={(
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[e.status] || 'bg-gray-100 text-gray-500'}`}>{e.status}</span>
                      )}>
                      </Can>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{fmt(e.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1 items-center">
                        {e.phone && (
                          <a href={`https://wa.me/${e.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${e.contact_person}, thank you for your corporate order enquiry to Big Bean Café! Our team will get back to you shortly. ☕`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="p-2 hover:bg-green-50 rounded-lg text-green-500" title="WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => setSelected(e)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Quick view"><Eye className="w-4 h-4" /></button>
                        <Link href={`/admin/corporate-enquiries/${e.id}`}
                          className="px-3 py-1.5 bg-[#3D1F0D] text-white text-xs font-semibold rounded-lg hover:bg-[#C9943A] transition-colors whitespace-nowrap">
                          View / Reply
                        </Link>
                        <Can module="corporate_enquiries" action="delete">
                          <button onClick={() => handleDelete(e.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><X className="w-4 h-4" /></button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={ex => ex.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.company_name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selected.contact_person} · {selected.phone}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p><p className="text-gray-800">{selected.email}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone</p><p className="text-gray-800">{selected.phone}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order Type</p><p className="text-gray-800">{selected.order_type || '—'}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Quantity</p><p className="text-gray-800">{selected.quantity || '—'}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Delivery Date</p><p className="text-gray-800">{fmtDate(selected.delivery_date)}</p></div>
                <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Budget Range</p><p className="text-gray-800">{selected.budget_range || '—'}</p></div>
              </div>
              {selected.delivery_address && <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Delivery Address</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.delivery_address}</p></div>}
              {selected.requirements && <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Requirements</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.requirements}</p></div>}
              {selected.admin_notes && <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Admin Notes</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.admin_notes}</p></div>}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['new','contacted','quoted','confirmed','closed','rejected'].map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={updatingId === selected.id}
                      className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${selected.status === s ? 'text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:border-[#C9943A]'}`}
                      style={{ background: selected.status === s ? 'linear-gradient(to right,#C9943A,#8B4A2F)' : 'white' }}>{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
