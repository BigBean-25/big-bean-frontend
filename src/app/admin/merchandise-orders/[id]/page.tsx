'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User, Phone, Mail, MapPin, StickyNote, CreditCard,
  Package, CheckCircle, Clock, Truck, XCircle, RefreshCw,
  Send, MessageCircle, Copy, Check, AlertCircle, ShoppingBag,
  Calendar, Hash, Banknote, Wifi, FileDown
} from 'lucide-react'
import apiRequest from '@/utils/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

interface OrderItem {
  id: number
  merchandise_id: number | null
  product_name: string
  quantity: number
  price: number
  total: number
  product_image: string | null
}

interface HistoryEntry {
  id: number
  order_id: number
  status: string
  message: string | null
  created_at: string
}

interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  address: string | null
  notes: string | null
  subtotal: number
  delivery_charge: number
  total_amount: number
  order_status: string
  payment_method: string
  payment_status: string | null
  payment_provider: string | null
  payment_order_id: string | null
  payment_id: string | null
  payment_signature: string | null
  paid_at: string | null
  created_at: string
  items: OrderItem[]
  history: HistoryEntry[]
}

const ORDER_STATUSES: { value: string; label: string }[] = [
  { value: 'received',  label: 'Received' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packing',   label: 'Packing' },
  { value: 'ready',     label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const ORDER_STATUS_STYLE: Record<string, string> = {
  received:       'bg-blue-50 text-blue-700 border-blue-200',
  confirmed:      'bg-indigo-50 text-indigo-700 border-indigo-200',
  packing:        'bg-purple-50 text-purple-700 border-purple-200',
  ready:          'bg-amber-50 text-amber-700 border-amber-200',
  delivered:      'bg-green-50 text-green-700 border-green-200',
  cancelled:      'bg-red-50 text-red-700 border-red-200',
  payment_failed: 'bg-red-100 text-red-800 border-red-300',
  payment_initiated: 'bg-blue-100 text-blue-700 border-blue-200',
}

const PAY_STATUS_STYLE: Record<string, string> = {
  paid:            'bg-green-100 text-green-700',
  pending:         'bg-orange-100 text-orange-700',
  failed:          'bg-red-100 text-red-700',
  cod_pending:    'bg-yellow-100 text-yellow-800',
  payment_initiated: 'bg-blue-100 text-blue-700',
}
const PAY_STATUS_LABEL: Record<string, string> = {
  paid: 'Paid ✓', pending: 'Pending', failed: 'Failed', cod_pending: 'COD Pending', payment_initiated: 'Initiated',
}

const TIMELINE_STEPS = [
  { key: 'received',          label: 'Order Received',       icon: ShoppingBag },
  { key: 'payment_confirmed', label: 'Payment Confirmed',    icon: CreditCard },
  { key: 'confirmed',         label: 'Team Confirmation',    icon: CheckCircle },
  { key: 'packing',           label: 'Packing',              icon: Package },
  { key: 'ready',             label: 'Ready / Delivery',     icon: Truck },
  { key: 'delivered',         label: 'Delivered',            icon: CheckCircle },
]

const isOnlineMethod = (m: string) => (m || '').toLowerCase().includes('online')

const fmtDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getImageUrl = (img?: string | null): string | null => {
  if (!img) return null
  const clean = String(img).trim()
  if (clean.startsWith('http')) return clean
  return `${API_BASE}/${clean.replace(/^\/+/, '')}`
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-fade-up max-w-sm
      ${type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />}
      <p className="text-sm font-medium">{msg}</p>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide flex-shrink-0 w-36">{label}</span>
      <span className={`text-sm text-gray-800 text-right ${mono ? 'font-mono' : 'font-medium'}`}>{value || '—'}</span>
    </div>
  )
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = params?.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('received')
  const [sendEmailOnUpdate, setSendEmailOnUpdate] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const downloadPdf = async () => {
    if (!order) return
    setPdfLoading(true)
    try {
      const res = await apiRequest(`/merchandise-orders/${order.id}/invoice-pdf`)
      if (!res.ok) { const d = await res.json().catch(() => ({})); showToast(d.message || 'Failed to generate PDF', 'error'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `BigBean-Invoice-${order.order_number}.pdf`; a.click()
      URL.revokeObjectURL(url)
      showToast('Invoice PDF downloaded')
    } finally { setPdfLoading(false) }
  }

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type })

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiRequest(`/merchandise-orders/${id}`)
      const data = await res.json()
      if (data.success) {
        setOrder(data.data)
        // Normalise legacy statuses like 'pending' to a known button value
        const rawStatus = data.data.order_status || 'received'
        const knownValues = ORDER_STATUSES.map(s => s.value)
        setNewStatus(knownValues.includes(rawStatus) ? rawStatus : 'received')
      }
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => { if (id) load() }, [id])

  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return
    setUpdatingStatus(true)
    try {
      const res = await apiRequest(`/merchandise-orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus, send_email: sendEmailOnUpdate }),
      })
      const data = await res.json()
      if (data.success) {
        const label = ORDER_STATUSES.find(s => s.value === newStatus)?.label || newStatus
        showToast(`Status updated to "${label}"${sendEmailOnUpdate && order?.customer_email ? ' — email queued' : ''}`)
        await load()
      } else {
        showToast(data.message || 'Update failed', 'error')
      }
    } catch { showToast('Network error — could not update status', 'error') }
    setUpdatingStatus(false)
  }

  const handleSendEmail = async () => {
    if (!order) return
    setActionLoading('email')
    try {
      const res = await apiRequest(`/merchandise-orders/${id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: order.order_status }),
      })
      const data = await res.json()
      if (data.success) showToast(data.message || 'Email sent successfully')
      else showToast(data.message || 'Failed to send email', 'error')
    } catch { showToast('Network error — could not send email', 'error') }
    setActionLoading(null)
  }

  const handleSendWhatsApp = async () => {
    if (!order) return
    setActionLoading('whatsapp')
    try {
      const res = await apiRequest(`/merchandise-orders/${id}/send-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: order.order_status }),
      })
      const data = await res.json()
      if (data.whatsapp_web_url) {
        window.open(data.whatsapp_web_url, '_blank')
        showToast('WhatsApp Web opened in new tab')
      } else if (data.success) {
        showToast('WhatsApp message sent')
      } else {
        showToast(data.reason || data.message || 'WhatsApp not configured', 'error')
      }
    } catch { showToast('Failed to send WhatsApp', 'error') }
    setActionLoading(null)
  }

  const handleCopyMessage = async () => {
    if (!order) return
    const msg = `Hi ${order.customer_name}, your Big Bean Café order *${order.order_number}* status: ${order.order_status}. Total: ₹${Number(order.total_amount).toFixed(0)}.`
    await navigator.clipboard.writeText(msg).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resolvedPayStatus = () => {
    if (!order) return ''
    if (order.payment_status) return order.payment_status
    return isOnlineMethod(order.payment_method) ? 'pending' : 'cod_pending'
  }

  const doneStatuses = order?.history?.map(h => h.status) || []

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center text-gray-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#C9943A]" />
        <p>Loading order…</p>
      </div>
    </div>
  )

  if (!order) return (
    <div className="text-center py-20 text-gray-400">
      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>Order not found.</p>
      <Link href="/admin/merchandise-orders" className="text-sm text-[#C9943A] mt-2 inline-block hover:underline">← Back to Orders</Link>
    </div>
  )

  const ps = resolvedPayStatus()

  return (
    <div className="max-w-[1100px]">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/merchandise-orders"
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border capitalize ${ORDER_STATUS_STYLE[order.order_status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {order.order_status}
            </span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${PAY_STATUS_STYLE[ps] || 'bg-gray-100 text-gray-600'}`}>
              {PAY_STATUS_LABEL[ps] || ps}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Placed on {fmtDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadPdf} disabled={pdfLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-[#C9943A] text-[#C9943A] hover:bg-[#FFF7ED] transition disabled:opacity-60">
            <FileDown className="w-3.5 h-3.5" />
            {pdfLoading ? 'Generating…' : 'Download Invoice'}
          </button>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Payment Failed Warning */}
      {isOnlineMethod(order.payment_method) && (order.payment_status === 'failed' || order.order_status === 'payment_failed') && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Online payment failed</h3>
              <p className="text-sm text-red-700">Razorpay order was not created or payment was not completed. This order should not be prepared until payment is completed.</p>
              {order.history?.find(h => h.status === 'payment_failed')?.message && (
                <p className="text-xs text-red-600 mt-2">Reason: {order.history.find(h => h.status === 'payment_failed')?.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-5">

          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Ordered Items</h2>
              <span className="ml-auto text-xs text-gray-400">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {(order.items || []).map(item => {
                const img = getImageUrl(item.product_image)
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFF7ED] to-[#F5E6D3] border border-[#E6C7A8] flex-shrink-0">
                      {img ? (
                        <img src={img} alt={item.product_name} className="w-full h-full object-cover"
                          onError={e => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-[#C9943A] opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{item.product_name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
                    </div>
                    <p className="font-bold text-gray-800">₹{Number(item.total).toLocaleString('en-IN')}</p>
                  </div>
                )
              })}
            </div>
            {/* Totals */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span><span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span><span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200 mt-1">
                <span>Total</span><span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Order Timeline</h2>
            </div>
            <div className="px-5 py-4">
              <div className="space-y-0">
                {TIMELINE_STEPS.map((step, i) => {
                  const done = doneStatuses.includes(step.key)
                  const histEntry = order.history?.find(h => h.status === step.key)
                  const Icon = step.icon
                  return (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2
                          ${done ? 'bg-[#C9943A] border-[#C9943A] text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && (
                          <div className={`w-0.5 h-6 ${done ? 'bg-[#C9943A]/40' : 'bg-gray-100'}`} />
                        )}
                      </div>
                      <div className="pb-1 pt-1">
                        <p className={`text-sm font-semibold ${done ? 'text-gray-800' : 'text-gray-300'}`}>{step.label}</p>
                        {histEntry && (
                          <p className="text-xs text-gray-400">{fmtDate(histEntry.created_at)}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Payment Details</h2>
            </div>
            <div className="px-5 py-2">
              <InfoRow label="Method" value={
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${isOnlineMethod(order.payment_method) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-stone-50 text-stone-700 border-stone-200'}`}>
                  {isOnlineMethod(order.payment_method) ? <><Wifi className="w-3 h-3" /> Online</> : <><Banknote className="w-3 h-3" /> COD</>}
                </span>
              } />
              <InfoRow label="Pay Status" value={
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${PAY_STATUS_STYLE[ps] || 'bg-gray-100 text-gray-600'}`}>
                  {PAY_STATUS_LABEL[ps] || ps}
                </span>
              } />
              <InfoRow label="Provider" value={order.payment_provider || '—'} />
              <InfoRow label="Razorpay Order ID" value={order.payment_order_id} mono />
              <InfoRow label="Razorpay Payment ID" value={order.payment_id} mono />
              <InfoRow label="Paid At" value={fmtDate(order.paid_at)} />
              {order.payment_signature && (
                <InfoRow label="Signature" value={
                  <span className="font-mono text-xs text-gray-400">
                    {order.payment_signature.substring(0, 20)}…
                  </span>
                } />
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-5">

          {/* Customer Details */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <User className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Customer Details</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9943A] to-[#3D1F0D] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {order.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{order.customer_name}</p>
                  <p className="text-xs text-gray-400">Customer</p>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-[#C9943A] flex-shrink-0" />
                  <a href={`tel:${order.customer_phone}`} className="hover:text-[#C9943A] transition-colors">{order.customer_phone}</a>
                </div>
                {order.customer_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-[#C9943A] flex-shrink-0" />
                    <a href={`mailto:${order.customer_email}`} className="hover:text-[#C9943A] transition-colors truncate">{order.customer_email}</a>
                  </div>
                )}
                {order.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-[#C9943A] flex-shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed">{order.address}</span>
                  </div>
                )}
                {order.notes && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <StickyNote className="w-3.5 h-3.5 text-[#C9943A] flex-shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed text-gray-500 italic">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Update Order Status</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {ORDER_STATUSES.map(s => (
                  <button key={s.value} onClick={() => setNewStatus(s.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                      ${newStatus === s.value ? 'bg-[#3D1F0D] text-white border-[#3D1F0D]' : `border-gray-200 text-gray-600 hover:border-gray-400 ${ORDER_STATUS_STYLE[s.value] || ''}`}`}>
                    {s.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sendEmailOnUpdate} onChange={e => setSendEmailOnUpdate(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#C9943A]" />
                <span className="text-xs text-gray-500">Send email notification on update</span>
              </label>
              <button onClick={handleStatusUpdate} disabled={updatingStatus || newStatus === order.order_status || (!newStatus)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#3D1F0D] text-white text-sm font-semibold hover:bg-[#C9943A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {updatingStatus ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {updatingStatus ? 'Updating…' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Admin Notification Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Notify Customer</h2>
            </div>
            <div className="px-5 py-4 space-y-2">
              {/* Send Email */}
              <button onClick={handleSendEmail} disabled={actionLoading === 'email'}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                  {actionLoading === 'email' ? <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" /> : <Mail className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-700">Send Email Update</p>
                  <p className="text-xs text-gray-400">{order.customer_email || '⚠ No email on file'}</p>
                </div>
              </button>

              {/* Send WhatsApp */}
              <button onClick={handleSendWhatsApp} disabled={actionLoading === 'whatsapp'}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                  {actionLoading === 'whatsapp' ? <RefreshCw className="w-4 h-4 text-green-600 animate-spin" /> : <MessageCircle className="w-4 h-4 text-green-600" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-700">Send WhatsApp Update</p>
                  <p className="text-xs text-gray-400">{order.customer_phone}</p>
                </div>
              </button>

              {/* Copy Message */}
              <button onClick={handleCopyMessage}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-700">{copied ? 'Copied!' : 'Copy Message'}</p>
                  <p className="text-xs text-gray-400">Copy order update text</p>
                </div>
              </button>

              {/* WhatsApp Quick Link */}
              <a href={`https://wa.me/91${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${order.customer_name}, your Big Bean Café order *${order.order_number}* status: ${order.order_status}.`)}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition-all">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-green-700">Open WhatsApp Web</p>
                  <p className="text-xs text-green-500">Opens wa.me link directly</p>
                </div>
              </a>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C9943A]" />
              <h2 className="font-semibold text-gray-800">Order Info</h2>
            </div>
            <div className="px-5 py-2">
              <InfoRow label="Order ID" value={`#${order.id}`} mono />
              <InfoRow label="Order Number" value={order.order_number} mono />
              <InfoRow label="Created" value={fmtDate(order.created_at)} />
              <InfoRow label="Order Status" value={
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ORDER_STATUS_STYLE[order.order_status] || ''}`}>
                  {order.order_status}
                </span>
              } />
              <InfoRow label="Total" value={`₹${Number(order.total_amount).toLocaleString('en-IN')}`} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
