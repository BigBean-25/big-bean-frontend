'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import CustomerStatusBadge from '@/components/customer/CustomerStatusBadge'
import CustomerToast, { ToastData } from '@/components/customer/CustomerToast'
import { isCustomerLoggedIn, customerFetch, getCustomerToken } from '@/lib/customerAuth'
import { Package, Search, RefreshCw, Truck, ShoppingBag, X, FileDown, CreditCard } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type Order = {
  id: number; order_number: string; customer_name: string
  total_amount: number; payment_method: string
  payment_status: string | null; order_status: string
  created_at: string; items_count: number
}

const FILTERS = [
  { key: 'all',             label: 'All' },
  { key: 'active',          label: 'Active' },
  { key: 'delivered',       label: 'Delivered' },
  { key: 'cancelled',       label: 'Cancelled' },
  { key: 'payment_pending', label: 'Payment Pending' },
]
const ACTIVE_STATUSES = ['received', 'confirmed', 'packing', 'ready']

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function CustomerOrders() {
  const router = useRouter()
  const [orders, setOrders]         = useState<Order[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter]         = useState('all')
  const [search, setSearch]         = useState('')
  const [pdfLoading, setPdfLoading] = useState<number | null>(null)
  const [toast, setToast]           = useState<ToastData | null>(null)

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const r = await customerFetch(`${API_URL}/customer-dashboard/orders`)
      const d = await r.json()
      if (d.success) setOrders(d.data || [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!isCustomerLoggedIn()) { router.push('/login'); return }
    fetchOrders()
  }, [router, fetchOrders])

  const downloadInvoice = async (orderId: number, orderNumber: string) => {
    setPdfLoading(orderId)
    try {
      const token = getCustomerToken()
      const res = await fetch(`${API_URL}/customer-dashboard/orders/${orderId}/invoice-pdf`, { headers: { Authorization: `Bearer ${token || ''}` } })
      if (!res.ok) { setToast({ msg: 'Failed to generate PDF', type: 'error' }); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `BigBean-Invoice-${orderNumber}.pdf`; a.click()
      URL.revokeObjectURL(url)
      setToast({ msg: 'Invoice downloaded!', type: 'success' })
    } finally { setPdfLoading(null) }
  }

  const filtered = orders.filter(o => {
    if (filter === 'active' && !ACTIVE_STATUSES.includes(o.order_status)) return false
    if (filter === 'delivered' && o.order_status !== 'delivered') return false
    if (filter === 'cancelled' && o.order_status !== 'cancelled') return false
    if (filter === 'payment_pending' && !['pending','cod_pending'].includes(o.payment_status || '')) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      if (!o.order_number.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <Header />
      <CustomerToast toast={toast} onClose={() => setToast(null)} />
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <CustomerSidebar />
          <div className="flex-1 min-w-0 space-y-4">

            {/* Header row */}
            <div className="flex items-center justify-between gap-4 flex-wrap rounded-2xl border border-[#E6C7A8] bg-white px-6 py-4 shadow-sm">
              <div>
                <h1 className="text-xl font-black text-[#3D1F0D]">My Orders</h1>
                <p className="text-xs text-[#7A5A48] mt-0.5">Track orders and download invoices</p>
              </div>
              <button onClick={() => fetchOrders(true)} disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E6C7A8] bg-white text-sm font-semibold text-[#3D1F0D] hover:border-[#C9943A] transition disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 text-[#C9943A] ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {/* Search + filters */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B6B50]" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by order number…"
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-[#E6C7A8] bg-white text-sm text-[#3D1F0D] placeholder:text-[#C0A080] focus:outline-none focus:ring-2 focus:ring-[#C9943A]/30" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-[#9B6B50]" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {FILTERS.map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition border ${
                      filter === f.key ? 'bg-[#3D1F0D] text-[#FFF7ED] border-[#3D1F0D]' : 'bg-white text-[#3D1F0D] border-[#E6C7A8] hover:border-[#C9943A]'
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders list */}
            {loading ? (
              <div className="py-16 text-center rounded-2xl border border-[#E6C7A8] bg-white shadow-sm">
                <RefreshCw className="w-8 h-8 mx-auto text-[#C9943A] animate-spin mb-3" />
                <p className="text-sm text-[#7A5A48]">Loading orders…</p>
              </div>
            ) : !filtered.length ? (
              <div className="py-16 text-center rounded-2xl border border-[#E6C7A8] bg-white shadow-sm">
                <Package className="h-12 w-12 mx-auto text-[#E6C7A8] mb-3" />
                {orders.length === 0 ? (
                  <>
                    <p className="font-semibold text-[#7A5A48]">No orders found yet.</p>
                    <p className="text-xs text-[#9B6B50] mt-1">Place an order and it will appear here.</p>
                    <Link href="/merchandise" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3D1F0D] text-sm font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition">
                      <ShoppingBag className="w-4 h-4" /> Shop Merchandise
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-[#7A5A48]">No orders match this filter.</p>
                    <button onClick={() => { setFilter('all'); setSearch('') }} className="mt-3 text-sm font-black text-[#C9943A] hover:underline">Clear filters</button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(o => (
                  <div key={o.id} className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm hover:shadow-md hover:border-[#C9943A] transition-all">
                    {/* Card top */}
                    <div className="px-5 pt-4 pb-3 flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-black text-[#3D1F0D]">#{o.order_number}</p>
                          <CustomerStatusBadge value={o.order_status} type="order" showDot />
                          {o.payment_status && <CustomerStatusBadge value={o.payment_status} type="payment" />}
                        </div>
                        <p className="text-xs text-[#7A5A48]">
                          {fmtDate(o.created_at)} &nbsp;·&nbsp;
                          <CreditCard className="w-3 h-3 inline text-[#C9943A]" /> {o.payment_method?.toUpperCase() || 'COD'} &nbsp;·&nbsp;
                          {o.items_count || 0} item{Number(o.items_count) !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className="text-xl font-black text-[#3D1F0D]">₹{Number(o.total_amount).toLocaleString('en-IN')}</p>
                    </div>
                    {/* Card actions */}
                    <div className="px-5 pb-4 flex flex-wrap gap-2 border-t border-[#F5E6D3] pt-3">
                      {!['delivered','cancelled'].includes(o.order_status) && (
                        <Link href={`/customer/orders/${o.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3D1F0D] text-xs font-black text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition">
                          <Truck className="w-3.5 h-3.5" /> Track Order
                        </Link>
                      )}
                      <Link href={`/customer/orders/${o.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6C7A8] text-xs font-bold text-[#3D1F0D] hover:border-[#C9943A] hover:bg-[#FFF7ED] transition">
                        View Details
                      </Link>
                      <button onClick={() => downloadInvoice(o.id, o.order_number)} disabled={pdfLoading === o.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6C7A8] text-xs font-bold text-[#7A5A48] hover:border-[#C9943A] hover:text-[#C9943A] transition disabled:opacity-60">
                        <FileDown className="w-3.5 h-3.5" />
                        {pdfLoading === o.id ? 'Generating…' : 'Invoice'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center pt-2">
              <Link href="/merchandise" className="inline-flex items-center gap-2 text-sm font-bold text-[#C9943A] hover:underline">
                <ShoppingBag className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
