'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Package } from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
type Row = Record<string, string | number | null>

export default function AdminCustomerDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [customer, setCustomer] = useState<Row | null>(null)
  const [logs, setLogs] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiRequest(`/admin/customers/${id}`).then(r => r.json()),
      apiRequest(`/admin/customers/${id}/login-logs`).then(r => r.json()),
    ]).then(([cd, ld]) => {
      if (cd.success) setCustomer(cd.data)
      if (ld.success) setLogs(ld.data)
    }).finally(() => setLoading(false))
  }, [id])

  const fmtDate = (d: string | null | undefined) => d ? new Date(d as string).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'
  const fmtDT = (d: string | null | undefined) => d ? new Date(d as string).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'

  if (loading) return <div className="py-16 text-center text-sm text-[#7A5A48]">Loading...</div>
  if (!customer) return <div className="py-16 text-center text-sm text-[#7A5A48]">Customer not found</div>

  const orders = (customer.orders as unknown as Row[]) || []
  const addresses = (customer.addresses as unknown as Row[]) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-bold text-[#7A5A48] hover:text-[#3D1F0D] transition">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-black text-[#3D1F0D]">{String(customer.full_name||'Customer')}</h1>
      </div>

      {/* Profile */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label:'Email', value: customer.email },
          { label:'Phone', value: customer.phone },
          { label:'Status', value: customer.status },
          { label:'Member Since', value: fmtDate(customer.created_at as string) },
          { label:'Last Login', value: fmtDT(customer.last_login_at as string) },
          { label:'Total Logins', value: customer.login_count },
          { label:'Total Orders', value: customer.total_orders },
          { label:'Total Spent', value: `₹${Number(customer.total_spent||0).toLocaleString('en-IN')}` },
          { label:'Wishlist Items', value: customer.wishlist_count },
        ].map(f => (
          <div key={f.label} className="rounded-2xl border border-[#E6C7A8] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#7A5A48]">{f.label}</p>
            <p className="mt-1 font-black text-[#3D1F0D]">{String(f.value??'—')}</p>
          </div>
        ))}
      </div>

      {/* Addresses */}
      {addresses.length > 0 && (
        <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-[#F5E6D3]">
            <MapPin className="h-4 w-4 text-[#C9943A]" />
            <h2 className="font-black text-[#3D1F0D]">Addresses ({addresses.length})</h2>
          </div>
          <div className="divide-y divide-[#F5E6D3]">
            {addresses.map((a, i) => (
              <div key={i} className="px-6 py-3 text-sm text-[#7A5A48]">
                <span className="font-bold text-[#3D1F0D]">{String(a.label||'Home')}: </span>
                {String(a.address_line_1||'')} {String(a.city||'')} {String(a.pincode||'')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#F5E6D3]">
          <Package className="h-4 w-4 text-[#C9943A]" />
          <h2 className="font-black text-[#3D1F0D]">Recent Orders</h2>
        </div>
        {!orders.length ? (
          <div className="px-6 py-8 text-sm text-[#7A5A48]">No orders found</div>
        ) : (
          <div className="divide-y divide-[#F5E6D3]">
            {orders.map((o, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-bold text-[#3D1F0D]">#{String(o.order_number||o.id)}</p>
                  <p className="text-xs text-[#7A5A48]">{fmtDate(o.created_at as string)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#3D1F0D]">₹{Number(o.total_amount||0).toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-[#7A5A48]">{String(o.status||'pending')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Login Logs */}
      <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#F5E6D3]">
          <h2 className="font-black text-[#3D1F0D]">Login History ({logs.length})</h2>
        </div>
        {!logs.length ? (
          <div className="px-6 py-8 text-sm text-[#7A5A48]">No login history</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F5E6D3] bg-[#FFF7ED]">
                  {['Date & Time', 'Status', 'Identifier', 'IP', 'Message'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-[#7A5A48]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5E6D3]">
                {logs.map((l, i) => (
                  <tr key={i} className="hover:bg-[#FFF7ED]">
                    <td className="px-4 py-2.5 text-xs text-[#7A5A48] whitespace-nowrap">{fmtDT(l.created_at as string)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${l.login_status==='success'?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{String(l.login_status)}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[#7A5A48]">{String(l.identifier||'—')}</td>
                    <td className="px-4 py-2.5 text-xs text-[#7A5A48]">{String(l.ip_address||'—')}</td>
                    <td className="px-4 py-2.5 text-xs text-[#7A5A48]">{String(l.message||'—')}</td>
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
