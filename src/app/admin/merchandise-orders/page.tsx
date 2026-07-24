'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Search, ExternalLink, RefreshCw, FileDown, Download, Filter } from 'lucide-react'
import apiRequest from '@/utils/api'
import Can from '@/components/admin/Can'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  total_amount: number
  order_status: string
  payment_method: string
  payment_status: string | null
  payment_provider: string | null
  payment_id: string | null
  payment_order_id: string | null
  created_at: string
  updated_at: string
  paid_at: string | null
}

interface Summary {
  total_orders: number
  total_sales: number
  paid_amount: number
  cod_amount: number
  online_amount: number
  pending_amount: number
  failed_amount: number
  delivered_orders: number
  payment_failed_orders: number
}

const ORDER_STATUS_STYLE: Record<string, string> = {
  received:       'bg-blue-50 text-blue-700 border-blue-200',
  confirmed:      'bg-indigo-50 text-indigo-700 border-indigo-200',
  packing:        'bg-purple-50 text-purple-700 border-purple-200',
  ready:          'bg-amber-50 text-amber-700 border-amber-200',
  delivered:      'bg-green-50 text-green-700 border-green-200',
  cancelled:      'bg-red-50 text-red-700 border-red-200',
  payment_failed: 'bg-red-100 text-red-800 border-red-300',
}

const PAY_STATUS_STYLE: Record<string, string> = {
  paid:            'bg-green-100 text-green-700 border-green-300',
  pending:         'bg-orange-100 text-orange-700 border-orange-300',
  failed:          'bg-red-100 text-red-700 border-red-300',
  payment_failed:  'bg-red-100 text-red-800 border-red-300',
  cod_pending:    'bg-yellow-100 text-yellow-700 border-yellow-300',
  payment_initiated: 'bg-blue-100 text-blue-700 border-blue-200',
}

const PAY_STATUS_LABEL: Record<string, string> = {
  paid: 'Paid', pending: 'Pending', failed: 'Failed', payment_failed: 'Payment Failed', cod_pending: 'COD Pending', payment_initiated: 'Initiated',
}

const DATE_FILTER_TYPES = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'custom_range', label: 'Custom Date Range' },
  { value: 'month_to_month', label: 'Month to Month' },
  { value: 'week_wise', label: 'Week Wise' },
  { value: 'date_wise', label: 'Date Wise' },
]

const PAYMENT_METHOD_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'cod', label: 'COD' },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'cod_pending', label: 'COD Pending' },
]

const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'received', label: 'Received' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packing', label: 'Packing' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'payment_failed', label: 'Payment Failed' },
]

const isOnlineMethod = (m: string) => (m || '').toLowerCase().includes('online')

const fmtDate = (d: string) =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })

const fmtCurrency = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`

const fmtLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const resolvePayStatus = (o: Order) => {
  if (o.payment_status) return o.payment_status
  return isOnlineMethod(o.payment_method) ? 'pending' : 'cod_pending'
}

const resolveRazorpayId = (o: Order) => {
  if (o.payment_order_id) return o.payment_order_id
  if (o.payment_id) return o.payment_id
  if (isOnlineMethod(o.payment_method) && (!o.payment_status || o.payment_status === 'pending')) return 'Not Created'
  return '—'
}

async function downloadAdminInvoice(orderId: number, orderNumber: string, setLoading: (id: number | null) => void) {
  setLoading(orderId)
  try {
    const res = await apiRequest(`/merchandise-orders/${orderId}/invoice-pdf`)
    if (!res.ok) { const d = await res.json().catch(() => ({})); alert(d.message || 'Failed to generate PDF'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `BigBean-Invoice-${orderNumber}.pdf`; a.click()
    URL.revokeObjectURL(url)
  } finally { setLoading(null) }
}

function buildFilterQuery(filters: Record<string, string>) {
  const params = new URLSearchParams()
  const add = (k: string, v?: string) => { if (v && v !== 'all') params.set(k, v) }

  add('search', filters.search?.trim())
  add('date_filter_type', filters.date_filter_type)
  if (filters.date_filter_type === 'custom_range') {
    if (filters.from_date) params.set('from_date', filters.from_date)
    if (filters.to_date) params.set('to_date', filters.to_date)
  } else if (filters.date_filter_type === 'month_to_month') {
    if (filters.from_month) params.set('from_month', filters.from_month)
    if (filters.to_month) params.set('to_month', filters.to_month)
  } else if (filters.date_filter_type === 'week_wise') {
    if (filters.week_start) params.set('week_start', filters.week_start)
    if (filters.week_end) params.set('week_end', filters.week_end)
  } else if (filters.date_filter_type === 'date_wise') {
    if (filters.exact_date) params.set('exact_date', filters.exact_date)
  }
  add('payment_method', filters.payment_method)
  add('payment_status', filters.payment_status)
  add('order_status', filters.order_status)
  if (filters.min_amount) params.set('min_amount', filters.min_amount)
  if (filters.max_amount) params.set('max_amount', filters.max_amount)

  return params.toString()
}

const DEFAULT_FILTERS = {
  search: '',
  date_filter_type: '',
  from_date: '',
  to_date: '',
  from_month: '',
  to_month: '',
  week_start: '',
  week_end: '',
  exact_date: '',
  payment_method: 'all',
  payment_status: 'all',
  order_status: 'all',
  min_amount: '',
  max_amount: '',
}

const SummaryCard = ({ label, value, accent = false }: { label: string, value: string | number, accent?: boolean }) => (
  <div className={`rounded-2xl border p-4 ${accent ? 'bg-[#3D1F0D] border-[#3D1F0D]' : 'bg-white border-gray-200'}`}>
    <div className={`text-xs font-semibold uppercase tracking-wide ${accent ? 'text-[#C9943A]' : 'text-gray-500'}`}>{label}</div>
    <div className={`text-xl font-bold mt-1 ${accent ? 'text-white' : 'text-gray-900'}`}>{value}</div>
  </div>
)

export default function MerchandiseOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [pdfLoading, setPdfLoading] = useState<number | null>(null)
  const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | null>(null)

  const fetchReport = async (currentFilters = filters) => {
    setLoading(true)
    setError(null)
    try {
      const query = buildFilterQuery(currentFilters)
      const res = await apiRequest(`/merchandise-orders/report?${query}`)
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.message || 'Failed to fetch orders')
      }
      const json = await res.json()
      setOrders(json.data || [])
      setSummary(json.summary || null)
    } catch (err: any) {
      console.error('Fetch report error:', err)
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReport() }, [])

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    fetchReport(DEFAULT_FILTERS)
  }

  const applyQuickFilter = (type: string) => {
    let next = { ...DEFAULT_FILTERS }
    switch (type) {
      case 'today': next.date_filter_type = 'today'; break
      case 'this_week': next.date_filter_type = 'this_week'; break
      case 'this_month': next.date_filter_type = 'this_month'; break
      case 'payment_failed': next.payment_status = 'payment_failed'; next.order_status = 'payment_failed'; break
      case 'paid': next.payment_status = 'paid'; break
      case 'cod': next.payment_method = 'cod'; break
      default: break
    }
    setFilters(next)
    fetchReport(next)
  }

  const downloadReport = async (type: 'pdf' | 'excel') => {
    const ext = type === 'pdf' ? 'pdf' : 'xlsx'
    const label = type === 'pdf' ? 'PDF' : 'Excel'
    setExportLoading(type)
    try {
      const query = buildFilterQuery(filters)
      const res = await apiRequest(`/merchandise-orders/report/${type}?${query}`)
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        if (res.status === 403) throw new Error('You do not have export permission.')
        throw new Error(d.message || `Unable to generate ${label}. Please try again.`)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Merchandise_Orders_Report_${new Date().toISOString().slice(0, 10)}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      alert(err.message || 'Download failed')
    } finally {
      setExportLoading(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merchandise Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">{summary?.total_orders ?? 0} total order{summary?.total_orders !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => fetchReport()} className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Can module="merchandise_orders" action="export">
            <button onClick={() => downloadReport('pdf')} disabled={exportLoading === 'pdf'}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-[#3D1F0D] text-white hover:bg-[#2a1409] transition-colors disabled:opacity-60">
              <Download className="w-3.5 h-3.5" /> {exportLoading === 'pdf' ? '…' : 'PDF'}
            </button>
            <button onClick={() => downloadReport('excel')} disabled={exportLoading === 'excel'}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-[#167E68] text-white hover:bg-[#0f5a4a] transition-colors disabled:opacity-60">
              <FileDown className="w-3.5 h-3.5" /> {exportLoading === 'excel' ? '…' : 'Excel'}
            </button>
          </Can>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['today', 'this_week', 'this_month', 'payment_failed', 'paid', 'cod'].map(q => (
          <button key={q} onClick={() => applyQuickFilter(q)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:border-[#C9943A] hover:text-[#C9943A] transition-all capitalize">
            {q === 'payment_failed' ? 'Payment Failed' : q.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card rounded-2xl border border-gray-200 bg-white p-5 mb-5">
        <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="md:col-span-2 lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={filters.search} onChange={e => updateFilter('search', e.target.value)}
                placeholder="Order number, customer name, phone, email, Razorpay ID"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Date Filter</label>
            <select value={filters.date_filter_type} onChange={e => updateFilter('date_filter_type', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D] bg-white">
              {DATE_FILTER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {filters.date_filter_type === 'custom_range' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">From Date</label>
                <input type="date" value={filters.from_date} onChange={e => updateFilter('from_date', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">To Date</label>
                <input type="date" value={filters.to_date} onChange={e => updateFilter('to_date', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D]" />
              </div>
            </>
          )}

          {filters.date_filter_type === 'month_to_month' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">From Month</label>
                <input type="month" value={filters.from_month} onChange={e => updateFilter('from_month', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">To Month</label>
                <input type="month" value={filters.to_month} onChange={e => updateFilter('to_month', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D]" />
              </div>
            </>
          )}

          {filters.date_filter_type === 'week_wise' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Week Start</label>
                <input type="date" value={filters.week_start} onChange={e => updateFilter('week_start', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Week End</label>
                <input type="date" value={filters.week_end} onChange={e => updateFilter('week_end', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D]" />
              </div>
            </>
          )}

          {filters.date_filter_type === 'date_wise' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Select Date</label>
              <input type="date" value={filters.exact_date} onChange={e => updateFilter('exact_date', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D]" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Method</label>
            <select value={filters.payment_method} onChange={e => updateFilter('payment_method', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D] bg-white">
              {PAYMENT_METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Status</label>
            <select value={filters.payment_status} onChange={e => updateFilter('payment_status', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D] bg-white">
              {PAYMENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Order Status</label>
            <select value={filters.order_status} onChange={e => updateFilter('order_status', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D] bg-white">
              {ORDER_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Min Amount</label>
            <input type="number" value={filters.min_amount} onChange={e => updateFilter('min_amount', e.target.value)}
              placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Max Amount</label>
            <input type="number" value={filters.max_amount} onChange={e => updateFilter('max_amount', e.target.value)}
              placeholder="50000" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3D1F0D]" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <button onClick={() => fetchReport()} className="px-5 py-2.5 rounded-xl bg-[#3D1F0D] text-white text-sm font-semibold hover:bg-[#2a1409] transition-colors">
            Apply Filter
          </button>
          <button onClick={resetFilters} className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
            Reset
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-5">
        <SummaryCard label="Total Orders" value={summary?.total_orders ?? 0} />
        <SummaryCard label="Total Sales Amount" value={fmtCurrency(summary?.total_sales ?? 0)} accent />
        <SummaryCard label="Paid Amount" value={fmtCurrency(summary?.paid_amount ?? 0)} />
        <SummaryCard label="COD Amount" value={fmtCurrency(summary?.cod_amount ?? 0)} />
        <SummaryCard label="Online Amount" value={fmtCurrency(summary?.online_amount ?? 0)} />
        <SummaryCard label="Pending Amount" value={fmtCurrency(summary?.pending_amount ?? 0)} />
        <SummaryCard label="Failed Amount" value={fmtCurrency(summary?.failed_amount ?? 0)} />
        <SummaryCard label="Delivered Orders" value={summary?.delivered_orders ?? 0} />
        <SummaryCard label="Payment Failed Orders" value={summary?.payment_failed_orders ?? 0} />
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pay Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Razorpay ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => {
                  const ps = resolvePayStatus(o)
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-gray-900 whitespace-nowrap">{o.order_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{o.customer_name}</div>
                        <div className="text-xs text-gray-400">{o.customer_phone}</div>
                        {o.customer_email && <div className="text-xs text-gray-400">{o.customer_email}</div>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{fmtCurrency(o.total_amount)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${isOnlineMethod(o.payment_method) ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-stone-50 text-stone-700 border-stone-200'}`}>
                          {isOnlineMethod(o.payment_method) ? 'Online' : 'COD'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${PAY_STATUS_STYLE[ps] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {PAY_STATUS_LABEL[ps] || fmtLabel(ps)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono text-xs px-2 py-0.5 rounded ${resolveRazorpayId(o) === 'Not Created' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'}`}>
                          {resolveRazorpayId(o)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${ORDER_STATUS_STYLE[o.order_status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {fmtLabel(o.order_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link href={`/admin/merchandise-orders/${o.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3D1F0D] text-white text-xs font-semibold hover:bg-[#C9943A] transition-colors">
                            <ExternalLink className="w-3 h-3" /> View
                          </Link>
                          <Can module="merchandise_orders" action="export">
                            <button onClick={() => downloadAdminInvoice(o.id, o.order_number, setPdfLoading)}
                              disabled={pdfLoading === o.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:border-[#C9943A] hover:text-[#C9943A] transition-colors disabled:opacity-60 whitespace-nowrap">
                              <FileDown className="w-3 h-3" />
                              {pdfLoading === o.id ? '…' : 'PDF'}
                            </button>
                          </Can>
                        </div>
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
