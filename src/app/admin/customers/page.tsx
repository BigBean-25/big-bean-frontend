'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Eye, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
type Customer = Record<string, string | number | null>

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    apiRequest(`/admin/customers?${params}`).then(r => r.json()).then(d => { if (d.success) setCustomers(d.data) }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, 350); return () => clearTimeout(t) }, [search, statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: number, status: string) => {
    await apiRequest(`/admin/customers/${id}/status`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) })
    load()
  }

  const deleteCustomer = async (id: number) => {
    if (!confirm('Delete this customer? This cannot be undone.')) return
    await apiRequest(`/admin/customers/${id}`, { method:'DELETE' })
    load()
  }

  const fmtDate = (d: string | null | undefined) => d ? new Date(d as string).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'
  const fmtDateTime = (d: string | null | undefined) => d ? new Date(d as string).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'

  const statusBadge = (s: string) => {
    if (s === 'active') return 'bg-green-100 text-green-700'
    if (s === 'blocked') return 'bg-red-100 text-red-600'
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#3D1F0D]">Customer Users</h1>
          <p className="text-sm text-[#7A5A48] mt-1">All registered customers · {customers.length} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A9866F]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone…"
            className="w-full rounded-full border border-[#E6C7A8] bg-white pl-9 pr-4 py-2.5 text-sm font-semibold text-[#3D1F0D] outline-none focus:border-[#C9943A]" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-full border border-[#E6C7A8] bg-white px-4 py-2.5 text-sm font-semibold text-[#3D1F0D] outline-none focus:border-[#C9943A]">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-[#7A5A48]">Loading...</div>
        ) : !customers.length ? (
          <div className="py-16 text-center text-sm text-[#7A5A48]">No customers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F5E6D3] bg-[#FFF7ED]">
                  {['Name', 'Email', 'Phone', 'Status', 'Logins', 'Last Login', 'Registered', 'Orders', 'Spent', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-[#7A5A48]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5E6D3]">
                {customers.map((c, i) => (
                  <tr key={i} className="hover:bg-[#FFF7ED] transition-colors">
                    <td className="px-4 py-3 font-bold text-[#3D1F0D] whitespace-nowrap">{String(c.full_name||'—')}</td>
                    <td className="px-4 py-3 text-[#7A5A48]">{String(c.email||'—')}</td>
                    <td className="px-4 py-3 text-[#7A5A48] whitespace-nowrap">{String(c.phone||'—')}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${statusBadge(String(c.status))}`}>{String(c.status||'—')}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-[#3D1F0D]">{String(c.login_count||0)}</td>
                    <td className="px-4 py-3 text-[#7A5A48] whitespace-nowrap text-xs">{fmtDateTime(c.last_login_at as string)}</td>
                    <td className="px-4 py-3 text-[#7A5A48] whitespace-nowrap text-xs">{fmtDate(c.created_at as string)}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#3D1F0D]">{String(c.total_orders||0)}</td>
                    <td className="px-4 py-3 font-bold text-[#3D1F0D] whitespace-nowrap">₹{Number(c.total_spent||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/admin/customers/${c.id}`} className="flex items-center justify-center rounded-full bg-[#FFF7ED] border border-[#E6C7A8] p-1.5 text-[#3D1F0D] hover:border-[#C9943A] transition">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        {c.status !== 'active' ? (
                          <button onClick={() => updateStatus(c.id as number,'active')} title="Activate"
                            className="flex items-center justify-center rounded-full bg-green-50 border border-green-200 p-1.5 text-green-600 hover:bg-green-100 transition">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button onClick={() => updateStatus(c.id as number,'blocked')} title="Block"
                            className="flex items-center justify-center rounded-full bg-red-50 border border-red-200 p-1.5 text-red-500 hover:bg-red-100 transition">
                            <ShieldOff className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button onClick={() => deleteCustomer(c.id as number)} title="Delete"
                          className="flex items-center justify-center rounded-full bg-red-50 border border-red-200 p-1.5 text-red-500 hover:bg-red-100 transition">
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
    </div>
  )
}
