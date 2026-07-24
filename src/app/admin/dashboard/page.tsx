'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Coffee, Store, Users, ShoppingBag, CalendarDays, Briefcase,
  UserCheck, TrendingUp, TrendingDown, ArrowRight, BarChart3,
  MessageSquare, Mail, FileText, Package, ChevronLeft, ChevronRight,
  Rocket, Bell, CreditCard, AlertTriangle, Headphones, MessageCircle,
  Building2, Send, AlertCircle
} from 'lucide-react'
import { formatTimeAgo } from '@/lib/timeAgo'
import { apiRequest } from '@/lib/api'
import { isSuperAdmin, hasPermission } from '@/lib/adminPermissions'

const safeFetch = async (endpoint: string) => {
  try {
    const res = await apiRequest(endpoint)
    if (!res.ok) return []
    const j = await res.json()
    if (Array.isArray(j))          return j
    if (Array.isArray(j.data))     return j.data
    if (Array.isArray(j.results))  return j.results
    return []
  } catch { return [] }
}

/* SVG line chart helper */
function SparkLine({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  const w = 120, h = 40, pad = 4
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2)
    const y = h - pad - (v / max) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-[120px] h-[40px]">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Bar chart helper (CSS divs) */
function BarGroup({ bars, colors, labels }: { bars: number[][]; colors: string[]; labels: string[] }) {
  const max = Math.max(...bars.flat(), 1)
  return (
    <div className="flex items-end gap-2.5 h-[100px]">
      {labels.map((l, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full items-end gap-0.5">
            {bars.map((series, si) => (
              <div key={si} className="flex-1 rounded-t-sm transition-all"
                style={{ height: `${(series[i] / max) * 88}px`, background: colors[si] }} />
            ))}
          </div>
          <span className="text-[9px] text-[#9CB3AC]">{l}</span>
        </div>
      ))}
    </div>
  )
}

/* Mini calendar */
function MiniCalendar() {
  const now   = new Date()
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const first = new Date(cur.y, cur.m, 1).getDay()
  const days  = new Date(cur.y, cur.m + 1, 0).getDate()
  const offset = (first + 6) % 7   // Mon start
  const today = now.getDate()
  const isCurrentMonth = cur.y === now.getFullYear() && cur.m === now.getMonth()
  const dots = [4, 9, 15, 22, 28]
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-black text-[#0F1F1A]">{MONTHS[cur.m]} {cur.y}</p>
        <div className="flex gap-1">
          <button onClick={() => setCur(c => { const d = new Date(c.y, c.m - 1); return { y: d.getFullYear(), m: d.getMonth() } })}
            className="rounded-full p-1 hover:bg-[#F3F8F6]"><ChevronLeft className="h-3.5 w-3.5 text-[#5F6F68]" /></button>
          <button onClick={() => setCur(c => { const d = new Date(c.y, c.m + 1); return { y: d.getFullYear(), m: d.getMonth() } })}
            className="rounded-full p-1 hover:bg-[#F3F8F6]"><ChevronRight className="h-3.5 w-3.5 text-[#5F6F68]" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <span key={i} className="text-[10px] font-black text-[#9CB3AC]">{d}</span>
        ))}
        {Array.from({ length: offset }).map((_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1
          const isToday = isCurrentMonth && d === today
          const hasDot  = dots.includes(d)
          return (
            <span key={d} className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold
              ${isToday ? 'bg-[#2FBF9B] text-white' : hasDot ? 'bg-[#EAF8F3] text-[#2FBF9B]' : 'text-[#42564D] hover:bg-[#F3F8F6]'}`}>
              {d}
              {hasDot && !isToday && <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#2FBF9B]" />}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* Status pill */
const pill = (s: string) => {
  const map: Record<string, string> = {
    pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
    confirmed: 'bg-green-50 text-green-700 border border-green-200',
    delivered: 'bg-blue-50 text-blue-700 border border-blue-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
    completed: 'bg-green-50 text-green-700 border border-green-200'
  }
  return map[s?.toLowerCase()] || 'bg-gray-50 text-gray-600 border border-gray-200'
}

const CARD = 'rounded-[28px] border border-[#DCE8E3] bg-white shadow-[0_18px_45px_rgba(31,42,36,0.06)]'
const HOVER = 'transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(31,42,36,0.10)]'

type Order = Record<string, string | number | null>

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [kpi, setKpi] = useState({
    customers: 0, orders: 0, contacts: 0, reservations: 0,
    careers: 0, corporate: 0, franchise: 0, outlets: 0
  })
  const [eventSummary, setEventSummary] = useState({
    upcoming_events: 0, today_bookings: 0, event_revenue: 0, pending_checkins: 0
  })
  const [orders, setOrders]   = useState<Order[]>([])
  const [activity, setActivity] = useState<{ text: string; time: string; dot: string }[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      new_order: ShoppingBag,
      payment_success: CreditCard,
      payment_failed: AlertTriangle,
      support_ticket: Headphones,
      support_reply: MessageCircle,
      contact_enquiry: MessageSquare,
      reservation: CalendarDays,
      corporate_enquiry: Building2,
      franchise_enquiry: Store,
      career_application: UserCheck,
      newsletter: Send,
      low_stock: AlertCircle,
      event_booking: CalendarDays,
      event_payment: CreditCard,
      event_checkin: UserCheck,
    }
    return icons[type] || Bell
  }

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      new_order: 'text-amber-600',
      payment_success: 'text-green-600',
      payment_failed: 'text-red-600',
      support_ticket: 'text-blue-600',
      support_reply: 'text-purple-600',
      contact_enquiry: 'text-orange-600',
      reservation: 'text-emerald-600',
      corporate_enquiry: 'text-indigo-600',
      franchise_enquiry: 'text-yellow-600',
      career_application: 'text-cyan-600',
      newsletter: 'text-gray-600',
      low_stock: 'text-red-600',
      merchandise_review: 'text-yellow-500',
    }
    return colors[type] || 'text-gray-600'
  }

  const markAsRead = async (id: number, actionUrl?: string) => {
    try {
      const res = await apiRequest(`/admin-notifications/${id}/read`, { method: 'PUT' })
      if (!res.ok) return
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      if (actionUrl) router.push(actionUrl, { scroll: false })
    } catch (err) {
      console.warn('Failed to mark notification as read:', err)
    }
  }

  const now  = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

  useEffect(() => {
    const load = async () => {
      const superAdmin = isSuperAdmin()

      // Only fetch APIs that the current user has permission to access
      const fetchIfAllowed = (endpoint: string, module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export' = 'view') =>
        (superAdmin || hasPermission(module, action)) ? safeFetch(endpoint) : Promise.resolve([])

      const [custs, ords, contacts, resv, careers, corp, franchise, outlets] =
        await Promise.allSettled([
          fetchIfAllowed('/admin/customers',        'customers'),
          fetchIfAllowed('/merchandise-orders',     'merchandise_orders'),
          fetchIfAllowed('/contact-enquiries',      'contact_enquiries'),
          fetchIfAllowed('/reservations',           'reservations'),
          fetchIfAllowed('/career-applications',    'career_applications'),
          fetchIfAllowed('/corporate-enquiries',    'corporate_enquiries'),
          fetchIfAllowed('/franchise-enquiries',    'franchise_enquiries'),
          safeFetch('/outlets'),
        ])

      const get = <T,>(r: PromiseSettledResult<T>, fallback: T) =>
        r.status === 'fulfilled' ? r.value : fallback

      const ordArr  = get(ords, []) as Order[]
      const custArr = get(custs, []) as Order[]

      setKpi({
        customers:  custArr.length,
        orders:     ordArr.length,
        contacts:   (get(contacts, []) as Order[]).length,
        reservations:(get(resv, []) as Order[]).length,
        careers:    (get(careers, []) as Order[]).length,
        corporate:  (get(corp, []) as Order[]).length,
        franchise:  (get(franchise, []) as Order[]).length,
        outlets:    (get(outlets, []) as Order[]).length
      })
      setOrders(ordArr.slice(0, 8))

      /* fetch event summary if allowed */
      if (superAdmin || hasPermission('event_bookings', 'view')) {
        try {
          const res = await apiRequest('/admin/event-bookings/summary/dashboard')
          if (res.ok) {
            const eventData = await res.json()
            if (eventData.success) setEventSummary(eventData.data)
          }
        } catch {
          console.warn('Could not fetch event summary')
        }
      }

      /* fetch recent notifications only if allowed */
      if (superAdmin || hasPermission('notifications', 'view')) {
        try {
          const res = await apiRequest('/admin-notifications/recent?limit=5')
          if (res.ok) {
            const notifData = await res.json()
            if (notifData.success) {
              setNotifications(notifData.notifications || [])
              setUnreadCount(notifData.unread_count || 0)
            }
          }
        } catch {
          console.warn('Could not fetch notifications')
        }
      }

      /* build activity from latest items */
      const acts: { text: string; time: string; dot: string }[] = []
      const fmt = (d: string | number | null) => d ? new Date(String(d)).toLocaleDateString() : '—'
      ordArr.slice(0, 2).forEach(o => acts.push({ text: `Order #${o.order_number || o.id} received`, time: fmt(o.created_at as string), dot: 'bg-[#C9943A]' }))
      custArr.slice(0, 2).forEach(c => acts.push({ text: `Customer ${c.full_name || c.email} registered`, time: fmt(c.created_at as string), dot: 'bg-[#2FBF9B]' }))
      ;(get(contacts, []) as Order[]).slice(0, 1).forEach(c => acts.push({ text: `Contact enquiry from ${c.name || 'visitor'}`, time: fmt(c.created_at as string), dot: 'bg-[#3D7FBF]' }))
      if (!acts.length) acts.push({ text: 'No recent activity yet.', time: '', dot: 'bg-[#DCE8E3]' })
      setActivity(acts)
      setLoading(false)
    }
    load()
  }, [])

  const KPI_CARDS = [
    { label: 'Total Customers',     value: kpi.customers,    icon: Users,        href: '/admin/customers',             color: 'text-[#2FBF9B]', bg: 'bg-[#DFF7EF]', trend: '+12%' },
    { label: 'Merchandise Orders',  value: kpi.orders,       icon: ShoppingBag,  href: '/admin/merchandise-orders',    color: 'text-[#C9943A]', bg: 'bg-[#FFF3DE]', trend: '+8%'  },
    { label: 'Unread Notifications',value: unreadCount,      icon: Bell,         href: '/admin/notifications',         color: 'text-[#E85D4C]', bg: 'bg-[#FDE8E8]', trend: unreadCount > 0 ? 'Alert' : '0' },
    { label: 'Contact Enquiries',   value: kpi.contacts,     icon: MessageSquare,href: '/admin/contact-enquiries',     color: 'text-[#3D7FBF]', bg: 'bg-[#E3EFFE]', trend: 'New'  },
    { label: 'Reservations',        value: kpi.reservations, icon: CalendarDays, href: '/admin/reservations',          color: 'text-[#9B59B6]', bg: 'bg-[#F3E8FF]', trend: '+5%'  },
    { label: 'Career Applications', value: kpi.careers,      icon: UserCheck,    href: '/admin/career-applications',   color: 'text-[#E74C3C]', bg: 'bg-[#FDE8E8]', trend: 'New'  },
    { label: 'Corporate Enquiries', value: kpi.corporate,    icon: Briefcase,    href: '/admin/corporate-enquiries',   color: 'text-[#1ABC9C]', bg: 'bg-[#E2F9F4]', trend: '+3'   },
    { label: 'Franchise Leads',     value: kpi.franchise,    icon: TrendingUp,   href: '/admin/franchise-enquiries',   color: 'text-[#F39C12]', bg: 'bg-[#FEF3DA]', trend: '+2'   },
    { label: 'Active Outlets',      value: kpi.outlets,      icon: Store,        href: '/admin/outlets',               color: 'text-[#8E44AD]', bg: 'bg-[#F5EEF8]', trend: 'Live' },
  ]

  const REVENUE_BARS = [[40,55,38,70,58,80,65],[28,42,55,48,62,50,72]]

  const BAR_LABELS   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-48 rounded-[28px] bg-[#DCE8E3]" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[...Array(8)].map((_,i) => <div key={i} className="h-32 rounded-[28px] bg-[#DCE8E3]" />)}
      </div>
      <div className="h-56 rounded-[28px] bg-[#DCE8E3]" />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── TOP 3-COLUMN GRID ─────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[320px_1fr_380px]">

        {/* LEFT — greeting panel */}
        <div className={`${CARD} ${HOVER} flex flex-col p-6`}>
          <p className="text-xs font-black uppercase tracking-widest text-[#9CB3AC]">{dateStr}</p>
          <h2 className="font-heading mt-2 text-[26px] font-black leading-tight text-[#0F1F1A]">
            {greeting},<br />Admin!
          </h2>
          <p className="mt-1 text-sm text-[#5F6F68]">Updates from yesterday.</p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Customers', value: kpi.customers, color: '#2FBF9B' },
              { label: 'Orders',    value: kpi.orders,    color: '#C9943A' },
              { label: 'Enquiries', value: kpi.contacts,  color: '#3D7FBF' },
            ].map(m => (
              <div key={m.label} className="rounded-2xl border border-[#DCE8E3] bg-[#F3F8F6] p-3 text-center">
                <p className="text-xl font-black" style={{ color: m.color }}>{m.value}</p>
                <p className="mt-0.5 text-[10px] text-[#5F6F68]">{m.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs font-semibold text-[#5F6F68]">
            You have <span className="font-black text-[#2FBF9B]">{kpi.orders}</span> total orders.
          </p>

          <div className="mt-4 flex-1 space-y-2 overflow-hidden">
            {orders.slice(0, 3).map((o, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-[#DCE8E3] bg-[#F3F8F6] px-3 py-2">
                <ShoppingBag className="h-4 w-4 shrink-0 text-[#C9943A]" />
                <span className="flex-1 truncate text-xs font-bold text-[#0F1F1A]">#{o.order_number || o.id}</span>
                <span className="text-xs font-black text-[#2FBF9B]">₹{o.total_amount || 0}</span>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-xs text-[#9CB3AC]">No orders yet.</p>
            )}
          </div>

          <Link href="/admin/merchandise-orders"
            className="mt-4 flex items-center gap-1.5 text-xs font-black text-[#2FBF9B] hover:underline">
            View all orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* CENTRE — earnings + revenue chart */}
        <div className="flex flex-col gap-5">
          {/* monthly earnings */}
          <div className={`${CARD} ${HOVER} flex items-center justify-between p-6`}>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#9CB3AC]">Monthly Earnings</p>
              <p className="font-heading mt-1 text-3xl font-black text-[#0F1F1A]">
                ₹{(kpi.orders * 480).toLocaleString('en-IN')}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#EAF8F3] px-2.5 py-0.5 text-xs font-black text-[#167E68]">
                <TrendingUp className="h-3 w-3" /> +4.33% vs last month
              </span>
            </div>
            <SparkLine values={[32,45,38,55,50,68,60,75,58,80]} color="#2FBF9B" />
          </div>

          {/* customer value */}
          <div className={`${CARD} ${HOVER} flex items-center justify-between p-6`}>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#9CB3AC]">Avg. Order Value</p>
              <p className="font-heading mt-1 text-3xl font-black text-[#0F1F1A]">₹480</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FFF3DE] px-2.5 py-0.5 text-xs font-black text-[#8B4513]">
                <TrendingUp className="h-3 w-3" /> +2.1% avg income/order
              </span>
            </div>
            <SparkLine values={[28,36,42,30,48,52,44,60]} color="#C9943A" />
          </div>

          {/* revenue chart */}
          <div className={`${CARD} ${HOVER} flex-1 p-6`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#9CB3AC]">Revenue Generated</p>
                <p className="mt-0.5 text-base font-black text-[#0F1F1A]">This month vs last year</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold text-[#5F6F68]">
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#DCE8E3]" />Last year</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#2FBF9B]" />This year</span>
                <span className="rounded-full bg-[#EAF8F3] px-2 py-0.5 text-[#2FBF9B]">+6.19%</span>
              </div>
            </div>
            <BarGroup bars={REVENUE_BARS} colors={['#DCE8E3','#2FBF9B']} labels={BAR_LABELS} />
          </div>
        </div>

        {/* RIGHT — promo + calendar + activity */}
        <div className="flex flex-col gap-5">
          {/* promo */}
          <div className={`${CARD} ${HOVER} bg-gradient-to-br from-[#E8F8F2] to-[#F6FBF8] p-6`}>
            <Rocket className="mb-3 h-8 w-8 text-[#2FBF9B]" />
            <p className="font-heading text-lg font-black text-[#1F2A24]">Grow your café confidently.</p>
            <p className="mt-1.5 text-xs text-[#607064]">
              Access advanced tools and insights to manage Big Bean Café faster and smarter.
            </p>
            <Link href="/admin/reports"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#3D1F0D] px-4 py-2 text-xs font-black text-[#FFF7ED] transition hover:bg-[#2FBF9B]">
              View Reports <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* calendar */}
          <div className={`${CARD} ${HOVER} p-5`}>
            <MiniCalendar />
          </div>

          {/* recent notifications */}
          <div className={`${CARD} ${HOVER} flex-1 p-5`}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black text-[#0F1F1A]">Recent Notifications</p>
              <Link href="/admin/notifications" className="text-xs font-bold text-[#2FBF9B] hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-[#9CB3AC]">No recent notifications.</p>
              ) : (
                notifications.slice(0, 5).map((n) => {
                  const Icon = getNotificationIcon(n.type)
                  return (
                    <button
                      key={n.id}
                      onClick={() => markAsRead(n.id, n.action_url)}
                      className={`flex w-full items-start gap-2.5 text-left ${!n.is_read ? 'font-semibold' : ''}`}
                    >
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${getNotificationColor(n.type)}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-[#0F1F1A]">{n.title}</p>
                        <p className="truncate text-[10px] text-[#5F6F68]">{n.message}</p>
                        <p className="text-[10px] text-[#9CB3AC]">{formatTimeAgo(n.created_at)}</p>
                      </div>
                      {!n.is_read && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9943A]" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* event snapshot */}
          <div className={`${CARD} ${HOVER} p-5`}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black text-[#0F1F1A]">Event Snapshot</p>
              <Link href="/admin/event-bookings" className="text-xs font-bold text-[#2FBF9B] hover:underline">View Bookings</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#EAF8F3] p-3">
                <CalendarDays className="h-4 w-4 text-[#2FBF9B]" />
                <p className="mt-1 text-xl font-black text-[#0F1F1A]">{eventSummary.upcoming_events}</p>
                <p className="text-[10px] font-semibold text-[#5F6F68]">Upcoming Events</p>
              </div>
              <div className="rounded-2xl bg-[#FFF3DE] p-3">
                <TrendingUp className="h-4 w-4 text-[#C9943A]" />
                <p className="mt-1 text-xl font-black text-[#0F1F1A]">{eventSummary.today_bookings}</p>
                <p className="text-[10px] font-semibold text-[#5F6F68]">Today Bookings</p>
              </div>
              <div className="rounded-2xl bg-[#E3EFFE] p-3">
                <CreditCard className="h-4 w-4 text-[#3D7FBF]" />
                <p className="mt-1 text-xl font-black text-[#0F1F1A]">₹{eventSummary.event_revenue.toLocaleString('en-IN')}</p>
                <p className="text-[10px] font-semibold text-[#5F6F68]">Event Revenue</p>
              </div>
              <div className="rounded-2xl bg-[#F3E8FF] p-3">
                <UserCheck className="h-4 w-4 text-[#8E44AD]" />
                <p className="mt-1 text-xl font-black text-[#0F1F1A]">{eventSummary.pending_checkins}</p>
                <p className="text-[10px] font-semibold text-[#5F6F68]">Pending Check-ins</p>
              </div>
            </div>
          </div>

          {/* activity */}
          <div className={`${CARD} ${HOVER} flex-1 p-5`}>
            <p className="mb-3 text-sm font-black text-[#0F1F1A]">Recent Activity</p>
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.dot}`} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#0F1F1A]">{a.text}</p>
                    {a.time && <p className="text-[10px] text-[#9CB3AC]">{a.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-3">
        {KPI_CARDS.map(({ label, value, icon: Icon, href, color, bg, trend }) => (
          <Link key={label} href={href}
            className={`${CARD} ${HOVER} flex flex-col gap-3 p-5 cursor-pointer`}>
            <div className={`inline-flex rounded-2xl p-2.5 ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="font-heading text-2xl font-black text-[#0F1F1A]">{value}</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#5F6F68]">{label}</p>
              <span className="rounded-full bg-[#FFF3DE] px-2 py-0.5 text-[10px] font-black text-[#8B4513]">{trend}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── ORDERS TABLE ───────────────────────────────────── */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-5">
          <p className="text-base font-black text-[#0F1F1A]">Latest Merchandise Orders</p>
          <Link href="/admin/merchandise-orders"
            className="flex items-center gap-1 text-xs font-black text-[#2FBF9B] hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-[#DCE8E3] bg-[#F9FDFB]">
                {['Order No','Customer','Amount','Status','Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-[#5F6F68]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[#9CB3AC]">No orders yet.</td></tr>
              )}
              {orders.map((o, i) => (
                <tr key={i} className="border-b border-[#F3F8F6] hover:bg-[#F9FDFB] transition-colors">
                  <td className="px-5 py-3.5 font-black text-[#0F1F1A]">#{o.order_number || o.id}</td>
                  <td className="px-5 py-3.5 text-[#42564D]">{o.customer_name || o.customer_email || '—'}</td>
                  <td className="px-5 py-3.5 font-black text-[#0F1F1A]">₹{o.total_amount || 0}</td>
                  <td className="px-5 py-3.5">
                    <span className={`${pill(String(o.status || ''))}`}>
                      {o.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#9CB3AC]">
                    {o.created_at ? new Date(String(o.created_at)).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
