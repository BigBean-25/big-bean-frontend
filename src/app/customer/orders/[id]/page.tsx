'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import CustomerSidebar from '@/components/customer/CustomerSidebar'
import CustomerStatusBadge from '@/components/customer/CustomerStatusBadge'
import CustomerToast, { ToastData } from '@/components/customer/CustomerToast'
import { isCustomerLoggedIn, customerFetch, getCustomerToken } from '@/lib/customerAuth'
import {
  ArrowLeft, Package, CheckCircle, Clock, RefreshCw, Phone, Mail,
  MapPin, Banknote, ShoppingBag, AlertCircle, Truck, XCircle,
  PackageCheck, PackageSearch, ClipboardCheck, FileDown
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '')

type HistoryItem = { status: string; note: string | null; created_at: string }
type OrderItem   = { product_name: string; quantity: number; price: number; total: number; product_image?: string | null }
type Order = {
  id: number
  order_number: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  address: string | null
  total_amount: number
  subtotal: number
  delivery_charge: number
  payment_method: string
  payment_status: string | null
  order_status: string
  created_at: string
  items: OrderItem[]
  history: HistoryItem[]
}

// ── Status configuration ──────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'received',  label: 'Order Received',   Icon: ClipboardCheck },
  { key: 'confirmed', label: 'Confirmed',         Icon: CheckCircle },
  { key: 'packing',   label: 'Being Packed',      Icon: PackageSearch },
  { key: 'ready',     label: 'Ready for Pickup',  Icon: PackageCheck },
  { key: 'delivered', label: 'Delivered',         Icon: Truck },
]

const STATUS_ORDER = ['received','confirmed','packing','ready','delivered']

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  received:  { label: 'Order Received',   color: 'text-amber-700',   bg: 'bg-amber-100 border border-amber-200' },
  confirmed: { label: 'Confirmed',        color: 'text-blue-700',    bg: 'bg-blue-100 border border-blue-200' },
  packing:   { label: 'Being Packed',     color: 'text-purple-700',  bg: 'bg-purple-100 border border-purple-200' },
  ready:     { label: 'Ready for Pickup', color: 'text-green-700',   bg: 'bg-green-100 border border-green-200' },
  delivered: { label: 'Delivered',        color: 'text-emerald-700', bg: 'bg-emerald-100 border border-emerald-200' },
  cancelled: { label: 'Cancelled',        color: 'text-red-600',     bg: 'bg-red-100 border border-red-200' },
}

const PAY_META: Record<string, { label: string; color: string }> = {
  paid:        { label: 'Paid',        color: 'bg-green-100 text-green-700' },
  pending:     { label: 'Pending',     color: 'bg-amber-100 text-amber-700' },
  failed:      { label: 'Failed',      color: 'bg-red-100 text-red-600' },
  cod_pending: { label: 'COD Pending', color: 'bg-orange-100 text-orange-700' },
}

function getImageUrl(img?: string | null) {
  if (!img) return null
  const c = String(img).trim()
  if (c.startsWith('http://') || c.startsWith('https://')) return c
  return `${API_BASE}/${c.replace(/^\/+/, '')}`
}

// ── Timeline component ────────────────────────────────────────────────────────
function Timeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-red-50 border border-red-200">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <p className="font-black text-red-700">Order Cancelled</p>
          <p className="text-sm text-red-500 mt-0.5">This order has been cancelled. Contact support if you need help.</p>
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_ORDER.indexOf(status)

  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, i) => {
        const done    = i <= currentIdx
        const active  = i === currentIdx
        const last    = i === STATUS_STEPS.length - 1
        const { Icon } = step

        return (
          <div key={step.key} className="flex gap-4">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                done
                  ? active
                    ? 'border-[#C9943A] bg-[#C9943A]'
                    : 'border-green-500 bg-green-500'
                  : 'border-[#E6C7A8] bg-white'
              }`}>
                {done
                  ? <Icon className="w-5 h-5 text-white" />
                  : <Icon className="w-5 h-5 text-[#C0A080]" />
                }
              </div>
              {!last && (
                <div className={`w-0.5 flex-1 min-h-[28px] transition-all ${done && !active ? 'bg-green-400' : 'bg-[#E6C7A8]'}`} />
              )}
            </div>

            {/* Label */}
            <div className={`pb-6 pt-2 min-w-0 ${last ? '' : ''}`}>
              <p className={`font-bold text-sm ${done ? active ? 'text-[#C9943A]' : 'text-green-700' : 'text-[#9B6B50]'}`}>
                {step.label}
                {active && <span className="ml-2 text-[10px] font-black bg-[#C9943A] text-white px-2 py-0.5 rounded-full uppercase">Current</span>}
                {done && !active && <span className="ml-2 text-[10px] text-green-600">✓</span>}
              </p>
              {active && (
                <p className="text-xs text-[#9B6B50] mt-0.5">Your order is currently at this stage</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const router  = useRouter()
  const params  = useParams()
  const id      = params?.id as string

  const [order, setOrder]       = useState<Order | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [toast, setToast]       = useState<ToastData | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const downloadInvoice = async () => {
    if (!order) return
    setPdfLoading(true)
    try {
      const token = getCustomerToken()
      const res = await fetch(`${API_URL}/customer-dashboard/orders/${order.id}/invoice-pdf`, {
        headers: { Authorization: `Bearer ${token || ''}` }
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); setToast({ msg: d.message || 'Failed to generate PDF', type: 'error' }); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `BigBean-Invoice-${order.order_number}.pdf`; a.click()
      URL.revokeObjectURL(url)
      setToast({ msg: 'Invoice downloaded!', type: 'success' })
    } finally { setPdfLoading(false) }
  }

  const fetchOrder = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const r = await customerFetch(`${API_URL}/customer-dashboard/orders/${id}`)
      const d = await r.json()
      if (d.success) { setOrder(d.data); setError('') }
      else { setError(d.message || 'Order not found') }
    } catch {
      setError('Could not load order details.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [id])

  useEffect(() => {
    if (!isCustomerLoggedIn()) { router.push('/login'); return }
    fetchOrder()
  }, [router, fetchOrder])

  // Auto-refresh every 30s if not terminal status
  useEffect(() => {
    if (!order) return
    const terminal = ['delivered', 'cancelled']
    if (terminal.includes(order.order_status)) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => fetchOrder(true), 30000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [order?.order_status, fetchOrder])

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const isTerminal = order && ['delivered', 'cancelled'].includes(order.order_status)

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <Header />
      <CustomerToast toast={toast} onClose={() => setToast(null)} />
      <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <CustomerSidebar />
          <div className="flex-1 min-w-0 space-y-5">

            {/* Back + title */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Link href="/customer/orders"
                  className="flex items-center gap-1.5 text-sm font-bold text-[#7A5A48] hover:text-[#3D1F0D] transition">
                  <ArrowLeft className="w-4 h-4" /> Back to Orders
                </Link>
              </div>
              <button onClick={() => fetchOrder(true)} disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E6C7A8] bg-white text-sm font-semibold text-[#3D1F0D] hover:border-[#C9943A] transition disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 text-[#C9943A] ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <RefreshCw className="w-10 h-10 mx-auto text-[#C9943A] animate-spin mb-4" />
                <p className="text-sm text-[#7A5A48]">Loading order details…</p>
              </div>
            ) : error ? (
              <div className="py-24 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
                <p className="font-semibold text-red-600">{error}</p>
                <Link href="/customer/orders" className="mt-3 inline-block text-sm font-black text-[#C9943A] hover:underline">← Back to Orders</Link>
              </div>
            ) : order && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

                {/* ── LEFT column ── */}
                <div className="space-y-5">

                  {/* Order header card */}
                  <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#F5E6D3]" style={{ background: 'linear-gradient(135deg,#120905,#3D1F0D)' }}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-xs font-black tracking-widest text-[#C9943A] mb-1">ORDER</p>
                          <p className="text-xl font-black text-[#FFF7ED]">#{order.order_number}</p>
                          <p className="text-xs text-[#C0A080] mt-1">{fmtDate(order.created_at)} at {fmtTime(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-[#C9943A]">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                          <div className="flex items-center gap-2 justify-end mt-1 flex-wrap">
                            {order.order_status && <CustomerStatusBadge value={order.order_status} type="order" showDot />}
                            {order.payment_status && <CustomerStatusBadge value={order.payment_status} type="payment" />}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap text-xs text-[#7A5A48] border-t border-[#2D1008]">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-[#C9943A]" />
                          {order.payment_method?.toUpperCase() || 'COD'}
                        </span>
                        {!isTerminal && (
                          <span className="flex items-center gap-1 text-[#9B6B50]">
                            <Clock className="w-3 h-3" /> Auto-refreshes every 30s
                          </span>
                        )}
                      </div>
                      <button onClick={downloadInvoice} disabled={pdfLoading}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#C9943A] text-xs font-black text-[#120905] hover:bg-[#E6B84A] transition disabled:opacity-60">
                        <FileDown className="w-3.5 h-3.5" />
                        {pdfLoading ? 'Generating PDF…' : 'Download Invoice / Receipt'}
                      </button>
                    </div>
                  </div>

                  {/* Tracking timeline */}
                  <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm p-5">
                    <h2 className="font-black text-[#3D1F0D] mb-5 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C9943A]" /> Order Tracking
                    </h2>
                    <Timeline status={order.order_status} />
                  </div>

                  {/* Status history */}
                  {order.history?.length > 0 && (
                    <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm p-5">
                      <h2 className="font-black text-[#3D1F0D] mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#C9943A]" /> Status History
                      </h2>
                      <div className="space-y-3">
                        {[...order.history].reverse().map((h, i) => {
                          const hm = STATUS_META[h.status]
                          return (
                            <div key={i} className="flex items-start gap-3">
                              <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${hm?.bg?.includes('bg-') ? 'bg-[#C9943A]' : 'bg-gray-300'}`}
                                style={{ background: h.status === 'delivered' ? '#22c55e' : h.status === 'cancelled' ? '#ef4444' : '#C9943A' }} />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-[#3D1F0D]">{hm?.label || h.status}</p>
                                {h.note && <p className="text-xs text-[#7A5A48]">{h.note}</p>}
                                <p className="text-[11px] text-[#9B6B50] mt-0.5">{fmtDate(h.created_at)} {fmtTime(h.created_at)}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order items */}
                  <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#F5E6D3] flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#C9943A]" />
                      <h2 className="font-black text-[#3D1F0D]">Order Items</h2>
                    </div>
                    <div className="divide-y divide-[#F5E6D3]">
                      {order.items?.map((item, i) => {
                        const img = getImageUrl(item.product_image)
                        return (
                          <div key={i} className="flex items-center gap-4 px-5 py-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFF7ED] to-[#F5E6D3] border border-[#E6C7A8] shrink-0">
                              {img
                                ? <img src={img} alt={item.product_name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                                : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-[#C9943A] opacity-40" /></div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#3D1F0D] text-sm truncate">{item.product_name}</p>
                              <p className="text-xs text-[#7A5A48]">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                            </div>
                            <p className="font-black text-[#3D1F0D] shrink-0">₹{Number(item.total || item.price * item.quantity).toLocaleString('en-IN')}</p>
                          </div>
                        )
                      })}
                    </div>
                    <div className="px-5 py-3 border-t border-[#F5E6D3] space-y-1.5 bg-[#FFFDF9]">
                      <div className="flex justify-between text-sm text-[#6B3520]">
                        <span>Subtotal</span>
                        <span className="font-bold">₹{Number(order.subtotal || order.total_amount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm text-[#6B3520]">
                        <span>Delivery</span>
                        <span className="font-bold text-green-700">{Number(order.delivery_charge) > 0 ? `₹${Number(order.delivery_charge).toLocaleString('en-IN')}` : 'Free'}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-[#120905] pt-1 border-t border-[#F5E6D3]">
                        <span>Total</span>
                        <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* ── RIGHT column ── */}
                <div className="space-y-5">

                  {/* Customer details */}
                  <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm p-5">
                    <h2 className="font-black text-[#3D1F0D] mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C9943A]" /> Delivery Details
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-black text-[#9B6B50] uppercase tracking-wider mb-0.5">Name</p>
                        <p className="text-sm font-bold text-[#3D1F0D]">{order.customer_name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#9B6B50] uppercase tracking-wider mb-0.5">Phone</p>
                        <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1.5 text-sm font-bold text-[#3D1F0D] hover:text-[#C9943A] transition">
                          <Phone className="w-3.5 h-3.5 text-[#C9943A]" /> {order.customer_phone}
                        </a>
                      </div>
                      {order.customer_email && (
                        <div>
                          <p className="text-xs font-black text-[#9B6B50] uppercase tracking-wider mb-0.5">Email</p>
                          <a href={`mailto:${order.customer_email}`} className="flex items-center gap-1.5 text-sm font-bold text-[#3D1F0D] hover:text-[#C9943A] transition truncate">
                            <Mail className="w-3.5 h-3.5 text-[#C9943A] shrink-0" /> {order.customer_email}
                          </a>
                        </div>
                      )}
                      {order.address && (
                        <div>
                          <p className="text-xs font-black text-[#9B6B50] uppercase tracking-wider mb-0.5">Address</p>
                          <p className="text-sm text-[#3D1F0D] leading-relaxed">{order.address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Support card */}
                  <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm p-5">
                    <h2 className="font-black text-[#3D1F0D] mb-1">Need Help?</h2>
                    <p className="text-xs text-[#7A5A48] mb-4">Our team is here to assist you with your order.</p>
                    <div className="space-y-2">
                      <Link href="/customer/support"
                        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#3D1F0D] text-sm font-bold text-[#FFF7ED] hover:bg-[#C9943A] hover:text-[#120905] transition text-center justify-center">
                        Contact Support
                      </Link>
                      <Link href="/customer/orders"
                        className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-[#E6C7A8] text-sm font-bold text-[#3D1F0D] hover:border-[#C9943A] hover:bg-[#FFF7ED] transition justify-center">
                        <ArrowLeft className="w-3.5 h-3.5" /> All Orders
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
