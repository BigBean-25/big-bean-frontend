'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import CustomerStatusBadge from '@/components/customer/CustomerStatusBadge'
import { isCustomerLoggedIn, customerFetch, getCustomerToken } from '@/lib/customerAuth'
import {
  Package, MapPin, Heart, ShoppingBag, Headphones, ChevronRight,
  Truck, IndianRupee, Tag, FileDown, UserCircle, ArrowRight, Sparkles
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

type RecentOrder = { id: number; order_number: string; total_amount: number; order_status: string; payment_status: string | null; created_at: string; items_count?: number }
type Ticket = { id: number; ticket_number: string; subject: string; status: string; updated_at: string }
interface Summary {
  profile: Record<string, string | number | null>
  stats: { total_orders: number; total_spent: number; addresses_count: number; wishlist_count: number; support_tickets_count: number }
  recent_orders: RecentOrder[]
  login_info: { last_login_at: string | null; login_count: number }
}

const ACTIVE_STATUSES = ['received', 'confirmed', 'packing', 'ready']

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function SkeletonCard() {
  return <div className="rounded-2xl border border-[#E6C7A8] bg-white p-5 animate-pulse h-24" />
}

export default function CustomerDashboard() {
  const router = useRouter()
  const [summary, setSummary]   = useState<Summary | null>(null)
  const [tickets, setTickets]   = useState<Ticket[]>([])
  const [loading, setLoading]   = useState(true)
  const [pdfLoading, setPdfLoading] = useState<number | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [sumRes, tickRes] = await Promise.all([
        customerFetch(`${API_URL}/customer-dashboard/summary`),
        customerFetch(`${API_URL}/customer-support/tickets`),
      ])
      const [sumData, tickData] = await Promise.all([sumRes.json(), tickRes.json()])
      if (sumData.success) setSummary(sumData.data)
      if (tickData.success) setTickets(tickData.data || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!isCustomerLoggedIn()) { router.push('/login'); return }
    fetchAll()
  }, [router, fetchAll])

  const downloadInvoice = async (orderId: number, orderNumber: string) => {
    setPdfLoading(orderId)
    try {
      const token = getCustomerToken()
      const res = await fetch(`${API_URL}/customer-dashboard/orders/${orderId}/invoice-pdf`, { headers: { Authorization: `Bearer ${token || ''}` } })
      if (!res.ok) { alert('Failed to generate PDF'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `BigBean-Invoice-${orderNumber}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } finally { setPdfLoading(null) }
  }

  const orders       = summary?.recent_orders || []
  const allOrders    = orders
  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.order_status))
  const delivered    = orders.filter(o => o.order_status === 'delivered')
  const latestOrder  = orders[0] ?? null
  const openTickets  = tickets.filter(t => ['open','in_progress','waiting_customer'].includes(t.status))

  const STATS = [
    { label: 'Total Orders',  value: summary?.stats.total_orders ?? 0,                              icon: Package,       accent: '#C9943A',  href: '/customer/orders' },
    { label: 'Active Orders', value: activeOrders.length,                                            icon: Truck,         accent: '#3B82F6',  href: '/customer/orders' },
    { label: 'Delivered',     value: delivered.length,                                               icon: ShoppingBag,   accent: '#22C55E',  href: '/customer/orders' },
    { label: 'Total Spent',   value: `₹${Number(summary?.stats.total_spent ?? 0).toLocaleString('en-IN')}`, icon: IndianRupee, accent: '#A855F7', href: '/customer/orders' },
    { label: 'Open Tickets',  value: openTickets.length,                                             icon: Tag,           accent: '#EF4444',  href: '/customer/support' },
    { label: 'Addresses',     value: summary?.stats.addresses_count ?? 0,                            icon: MapPin,        accent: '#6B7280',  href: '/customer/addresses' },
  ]

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <Header />
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <CustomerSidebar />
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── Welcome Hero ───────────────────────── */}
            <div className="relative overflow-hidden rounded-2xl shadow-md"
              style={{ background: 'linear-gradient(135deg,#0D0604 0%,#3D1F0D 55%,#5C2E10 100%)' }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #C9943A 0%, transparent 60%)' }} />
              <div className="relative px-6 py-7">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#C9943A]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#C9943A]">Big Bean Member</span>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black text-[#FFF7ED]">
                      Welcome back, {String(summary?.profile?.full_name?.toString().split(' ')[0] || 'Customer')}!
                    </h1>
                    <p className="mt-1.5 text-sm text-[#C0A080] max-w-md">
                      Track your orders, manage support tickets and download invoices — all in one place.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Link href="/merchandise" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C9943A] text-xs font-black text-[#120905] hover:bg-[#E6B84A] transition">
                        <ShoppingBag className="w-3.5 h-3.5" /> Shop Merchandise
                      </Link>
                      <Link href="/customer/orders" className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#5C3A20] text-xs font-bold text-[#E6C7A8] hover:bg-[#3D1F0D] transition">
                        <Package className="w-3.5 h-3.5" /> My Orders
                      </Link>
                      <Link href="/customer/support" className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#5C3A20] text-xs font-bold text-[#E6C7A8] hover:bg-[#3D1F0D] transition">
                        <Headphones className="w-3.5 h-3.5" /> Support
                      </Link>
                    </div>
                  </div>
                  <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-full bg-[#C9943A]/20 border border-[#C9943A]/30">
                    <UserCircle className="w-9 h-9 text-[#C9943A]" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Stats Grid ─────────────────────────── */}
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {STATS.map(s => (
                  <Link key={s.label} href={s.href}
                    className="rounded-2xl border border-[#E6C7A8] bg-white p-4 shadow-sm hover:shadow-md hover:border-[#C9943A] transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.accent + '18' }}>
                        <s.icon className="w-4 h-4" style={{ color: s.accent }} />
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#C0C0B0] group-hover:text-[#C9943A] transition-colors" />
                    </div>
                    <div className="text-xl font-black text-[#3D1F0D]">{s.value}</div>
                    <div className="text-[11px] text-[#7A5A48] mt-0.5 leading-tight">{s.label}</div>
                  </Link>
                ))}
              </div>
            )}

            {/* ── Latest Order Tracking ──────────────── */}
            {!loading && (
              latestOrder ? (
                <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E6D3]">
                    <h2 className="font-black text-[#3D1F0D] flex items-center gap-2 text-sm">
                      <Truck className="w-4 h-4 text-[#C9943A]" /> Latest Order
                    </h2>
                    <Link href="/customer/orders" className="text-xs font-bold text-[#C9943A] hover:underline flex items-center gap-1">
                      All Orders <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-black text-[#3D1F0D] text-lg">#{latestOrder.order_number}</p>
                        <p className="text-xs text-[#7A5A48] mt-0.5">{fmtDate(latestOrder.created_at)}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <CustomerStatusBadge value={latestOrder.order_status} type="order" showDot />
                          {latestOrder.payment_status && <CustomerStatusBadge value={latestOrder.payment_status} type="payment" />}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#3D1F0D]">₹{Number(latestOrder.total_amount).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Mini timeline */}
                    {latestOrder.order_status !== 'cancelled' && (
                      <div className="mt-4 flex items-center gap-0">
                        {['received','confirmed','packing','ready','delivered'].map((step, i, arr) => {
                          const steps = ['received','confirmed','packing','ready','delivered']
                          const cur = steps.indexOf(latestOrder.order_status)
                          const done = i < cur; const active = i === cur
                          return (
                            <div key={step} className="flex items-center flex-1 last:flex-none">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border-2 transition-all ${
                                done ? 'bg-[#3D1F0D] border-[#3D1F0D] text-[#C9943A]' : active ? 'bg-[#C9943A] border-[#C9943A] text-[#120905]' : 'bg-white border-[#E6C7A8] text-[#C0B0A0]'
                              }`}>{i + 1}</div>
                              {i < arr.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${done || active ? 'bg-[#C9943A]' : 'bg-[#E6C7A8]'}`} />}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="mt-4 flex gap-2 flex-wrap">
                      <Link href={`/customer/orders/${latestOrder.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3D1F0D] text-xs font-bold text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition">
                        <Truck className="w-3.5 h-3.5" /> Track Order
                      </Link>
                      <button onClick={() => downloadInvoice(latestOrder.id, latestOrder.order_number)} disabled={pdfLoading === latestOrder.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E6C7A8] text-xs font-bold text-[#3D1F0D] hover:border-[#C9943A] hover:bg-[#FFF7ED] transition disabled:opacity-60">
                        <FileDown className="w-3.5 h-3.5 text-[#C9943A]" />
                        {pdfLoading === latestOrder.id ? 'Generating…' : 'Download Invoice'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm p-10 text-center">
                  <Package className="h-12 w-12 mx-auto text-[#E6C7A8] mb-3" />
                  <p className="font-semibold text-[#7A5A48]">Your recent orders will appear here.</p>
                  <Link href="/merchandise" className="mt-3 inline-block text-xs font-black text-[#C9943A] hover:underline">Browse Merchandise →</Link>
                </div>
              )
            )}

            {/* ── Recent Orders + Support Snapshot ─────── */}
            {!loading && (allOrders.length > 0 || tickets.length > 0) && (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                {/* Recent Orders */}
                <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E6D3]">
                    <h2 className="font-black text-[#3D1F0D] text-sm flex items-center gap-2"><Package className="w-4 h-4 text-[#C9943A]" /> Recent Orders</h2>
                    <Link href="/customer/orders" className="text-xs font-bold text-[#C9943A] hover:underline">View All</Link>
                  </div>
                  {allOrders.length === 0 ? (
                    <div className="py-10 text-center text-sm text-[#7A5A48]">No orders yet.</div>
                  ) : (
                    <div className="divide-y divide-[#F5E6D3]">
                      {allOrders.slice(0, 4).map(o => (
                        <Link key={o.id} href={`/customer/orders/${o.id}`}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FFFDF9] transition-colors group">
                          <div>
                            <p className="text-sm font-black text-[#3D1F0D]">#{o.order_number}</p>
                            <p className="text-xs text-[#7A5A48] mt-0.5">{fmtDate(o.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm font-bold text-[#3D1F0D]">₹{Number(o.total_amount).toLocaleString('en-IN')}</p>
                              <CustomerStatusBadge value={o.order_status} type="order" showDot />
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#C0A080] group-hover:text-[#C9943A] transition-colors shrink-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Support Snapshot */}
                <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5E6D3]">
                    <h2 className="font-black text-[#3D1F0D] text-sm flex items-center gap-2"><Headphones className="w-4 h-4 text-[#C9943A]" /> Support Tickets</h2>
                    <Link href="/customer/support" className="text-xs font-bold text-[#C9943A] hover:underline">View All</Link>
                  </div>
                  {tickets.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-sm text-[#7A5A48]">No support tickets yet.</p>
                      <Link href="/customer/support" className="mt-2 inline-block text-xs font-black text-[#C9943A] hover:underline">Raise a Ticket →</Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F5E6D3]">
                      {tickets.slice(0, 4).map(t => (
                        <Link key={t.id} href={`/customer/support/${t.id}`}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FFFDF9] transition-colors group">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-[#9B6B50]">#{t.ticket_number}</p>
                            <p className="text-sm font-bold text-[#3D1F0D] truncate mt-0.5">{t.subject}</p>
                            <p className="text-xs text-[#7A5A48]">{fmtDate(t.updated_at)}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <CustomerStatusBadge value={t.status} type="ticket" />
                            <ChevronRight className="w-4 h-4 text-[#C0A080] group-hover:text-[#C9943A] transition-colors" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Quick Actions ──────────────────────── */}
            <div>
              <h2 className="text-sm font-black text-[#3D1F0D] mb-3 px-1">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { label: 'My Orders',       href: '/customer/orders',    Icon: Package,       sub: 'Track & invoice' },
                  { label: 'Support',         href: '/customer/support',   Icon: Headphones,    sub: 'Raise a ticket' },
                  { label: 'Addresses',       href: '/customer/addresses', Icon: MapPin,        sub: 'Saved locations' },
                  { label: 'Edit Profile',    href: '/customer/profile',   Icon: UserCircle,    sub: 'Update details' },
                  { label: 'Shop Now',        href: '/merchandise',        Icon: ShoppingBag,   sub: 'Browse products' },
                ].map(a => (
                  <Link key={a.label} href={a.href}
                    className="flex flex-col gap-2 rounded-2xl border border-[#E6C7A8] bg-white px-4 py-4 shadow-sm transition hover:border-[#C9943A] hover:shadow-md group">
                    <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-[#E6C7A8] flex items-center justify-center group-hover:bg-[#3D1F0D] transition-colors">
                      <a.Icon className="h-4 w-4 text-[#C9943A]" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#3D1F0D]">{a.label}</p>
                      <p className="text-[11px] text-[#7A5A48]">{a.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
