'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Store, Users, ShoppingBag, CalendarDays, Briefcase,
  UserCheck, TrendingUp, ArrowRight, ArrowUpRight, BarChart3,
  MessageSquare, ChevronLeft, ChevronRight,
  Bell, CreditCard, AlertTriangle, Headphones, MessageCircle,
  Building2, Send, AlertCircle, Wallet, Receipt, Globe
} from 'lucide-react'
import { formatTimeAgo } from '@/lib/timeAgo'
import { apiRequest } from '@/lib/api'
import { isSuperAdmin, hasPermission } from '@/lib/adminPermissions'
import WebsiteContentSlider from '@/components/admin/WebsiteContentSlider'

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

/* ── tiny sparkline (real series passed in) ─────────────── */
function SparkLine({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  const w = 96, h = 34, pad = 4
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2)
    const y = h - pad - (v / max) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[34px] w-[96px]">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── two-series weekly revenue bars ─────────────────────── */
function RevenueBars({ current, previous, labels }: { current: number[]; previous: number[]; labels: string[] }) {
  const max = Math.max(...current, ...previous, 1)
  const fmt = (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`
  return (
    <div className="flex h-[220px] items-end gap-2 sm:gap-4">
      {labels.map((l, i) => (
        <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
          <div className="flex h-[180px] w-full items-end justify-center gap-1 sm:gap-1.5">
            <div
              title={`Previous: ${fmt(previous[i] || 0)}`}
              className="w-full max-w-[20px] rounded-t-lg bg-[#EDE5D8] transition-colors group-hover:bg-[#DED1BE]"
              style={{ height: `${Math.max((previous[i] / max) * 100, previous[i] > 0 ? 3 : 0)}%` }}
            />
            <div
              title={`This week: ${fmt(current[i] || 0)}`}
              className="w-full max-w-[20px] rounded-t-lg bg-gradient-to-t from-[#8B4A2F] to-[#C9943A] transition-opacity group-hover:opacity-90"
              style={{ height: `${Math.max((current[i] / max) * 100, current[i] > 0 ? 3 : 0)}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-[#A89888]">{l}</span>
        </div>
      ))}
    </div>
  )
}

/* ── mini calendar ──────────────────────────────────────── */
function MiniCalendar() {
  const now   = new Date()
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const first = new Date(cur.y, cur.m, 1).getDay()
  const days  = new Date(cur.y, cur.m + 1, 0).getDate()
  const offset = (first + 6) % 7   // Mon start
  const today = now.getDate()
  const isCurrentMonth = cur.y === now.getFullYear() && cur.m === now.getMonth()
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-black text-[#241A10]">{MONTHS[cur.m]} {cur.y}</p>
        <div className="flex gap-1">
          <button onClick={() => setCur(c => { const d = new Date(c.y, c.m - 1); return { y: d.getFullYear(), m: d.getMonth() } })}
            className="rounded-full p-1 text-[#6B5B49] hover:bg-[#F6F1E9]"><ChevronLeft className="h-3.5 w-3.5" /></button>
          <button onClick={() => setCur(c => { const d = new Date(c.y, c.m + 1); return { y: d.getFullYear(), m: d.getMonth() } })}
            className="rounded-full p-1 text-[#6B5B49] hover:bg-[#F6F1E9]"><ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <span key={i} className="text-[10px] font-black text-[#B3A491]">{d}</span>
        ))}
        {Array.from({ length: offset }).map((_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1
          const isToday = isCurrentMonth && d === today
          return (
            <span key={d} className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold
              ${isToday ? 'bg-[#8B4A2F] text-white' : 'text-[#4A3B2C] hover:bg-[#F6F1E9]'}`}>
              {d}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ── status pill ────────────────────────────────────────── */
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

const CARD  = 'rounded-3xl border border-[#EAE2D6] bg-white shadow-[0_1px_2px_rgba(43,28,16,0.04),0_16px_40px_-16px_rgba(43,28,16,0.10)]'
const HOVER = 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_-18px_rgba(43,28,16,0.18)]'

type Order = Record<string, string | number | null>

interface Metrics {
  monthRevenue: number
  aov: number
  week: number[]
  prevWeek: number[]
  weekLabels: string[]
  spark: number[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [kpi, setKpi] = useState({
    customers: 0, orders: 0, contacts: 0, reservations: 0,
    careers: 0, corporate: 0, franchise: 0, outlets: 0
  })
  const [metrics, setMetrics] = useState<Metrics>({
    monthRevenue: 0, aov: 0, week: [], prevWeek: [], weekLabels: [], spark: []
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

  const getNotificationChip = (type: string) => {
    const map: Record<string, string> = {
      new_order: 'bg-[#FDF1DC] text-[#C9943A]',
      payment_success: 'bg-[#E8F6F0] text-[#167E68]',
      payment_failed: 'bg-[#FBE9E7] text-[#B4552D]',
      support_ticket: 'bg-[#E8F1FB] text-[#3D7FBF]',
      support_reply: 'bg-[#F4ECF8] text-[#7A4E9E]',
      contact_enquiry: 'bg-[#FDF1DC] text-[#B4552D]',
      reservation: 'bg-[#E8F6F0] text-[#167E68]',
      corporate_enquiry: 'bg-[#EEF1FA] text-[#4A5FA5]',
      franchise_enquiry: 'bg-[#FDF1DC] text-[#C9943A]',
      career_application: 'bg-[#E8F1FB] text-[#3D7FBF]',
      newsletter: 'bg-[#F4EFE8] text-[#6B5B49]',
      low_stock: 'bg-[#FBE9E7] text-[#B4552D]',
      merchandise_review: 'bg-[#FDF1DC] text-[#C9943A]',
      event_booking: 'bg-[#E8F6F0] text-[#167E68]',
      event_payment: 'bg-[#E8F6F0] text-[#167E68]',
      event_checkin: 'bg-[#E8F6F0] text-[#167E68]',
    }
    return map[type] || 'bg-[#F4EFE8] text-[#6B5B49]'
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
        customers:   custArr.length,
        orders:      ordArr.length,
        contacts:    (get(contacts, []) as Order[]).length,
        reservations:(get(resv, []) as Order[]).length,
        careers:     (get(careers, []) as Order[]).length,
        corporate:   (get(corp, []) as Order[]).length,
        franchise:   (get(franchise, []) as Order[]).length,
        outlets:     (get(outlets, []) as Order[]).length
      })
      setOrders(ordArr.slice(0, 8))

      /* ── derive real revenue metrics from fetched orders ── */
      const amountOf = (o: Order) => Number(o.total_amount ?? o.total ?? o.amount ?? 0) || 0
      const dateOf   = (o: Order) => {
        const d = new Date(String(o.created_at || ''))
        return isNaN(d.getTime()) ? null : d
      }

      const today = new Date()
      const mRevenue = ordArr.reduce((sum, o) => {
        const d = dateOf(o)
        return d && d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth()
          ? sum + amountOf(o) : sum
      }, 0)
      const totalRevenue = ordArr.reduce((s, o) => s + amountOf(o), 0)

      const dayBuckets = (daysAgoFrom: number, daysAgoTo: number) => {
        const arr = new Array(7).fill(0)
        ordArr.forEach(o => {
          const d = dateOf(o)
          if (!d) return
          const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const diff = Math.floor((dayStart.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000)
          if (diff >= daysAgoFrom && diff <= daysAgoTo) arr[daysAgoTo - diff] += amountOf(o)
        })
        return arr
      }
      const week     = dayBuckets(0, 6)
      const prevWeek = dayBuckets(7, 13)
      const weekLabels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (6 - i))
        return d.toLocaleDateString('en-US', { weekday: 'short' })
      })
      const spark = Array.from({ length: 10 }, (_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (9 - i))
        return ordArr.reduce((s, o) => {
          const od = dateOf(o)
          return od && od.toDateString() === d.toDateString() ? s + amountOf(o) : s
        }, 0)
      })

      setMetrics({
        monthRevenue: mRevenue,
        aov: ordArr.length ? totalRevenue / ordArr.length : 0,
        week, prevWeek, weekLabels, spark
      })

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
      if (!acts.length) acts.push({ text: 'No recent activity yet.', time: '', dot: 'bg-[#EAE2D6]' })
      setActivity(acts)
      setLoading(false)
    }
    load()
  }, [])

  const inr = (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`
  const weekTotal = metrics.week.reduce((s, v) => s + v, 0)

  const KPI_CARDS = [
    { label: 'Total Customers',    value: String(kpi.customers),       sub: 'Registered',   icon: Users,        href: '/admin/customers',          tint: 'bg-[#E8F6F0]', ink: 'text-[#167E68]' },
    { label: 'Merchandise Orders', value: String(kpi.orders),          sub: 'All time',     icon: ShoppingBag,  href: '/admin/merchandise-orders', tint: 'bg-[#FDF1DC]', ink: 'text-[#C9943A]' },
    { label: 'Contact Enquiries',  value: String(kpi.contacts),        sub: 'Received',     icon: MessageSquare,href: '/admin/contact-enquiries',  tint: 'bg-[#E8F1FB]', ink: 'text-[#3D7FBF]' },
    { label: 'Monthly Earnings',   value: inr(metrics.monthRevenue),   sub: 'This month',   icon: Wallet,       href: '/admin/reports',            tint: 'bg-[#F7E9E2]', ink: 'text-[#8B4A2F]', spark: true },
    { label: 'Avg. Order Value',   value: inr(metrics.aov),            sub: 'Per order',    icon: Receipt,      href: '/admin/merchandise-orders', tint: 'bg-[#F4ECF8]', ink: 'text-[#7A4E9E]' },
  ]

  const QUICK_STATS = [
    { label: 'Reservations',         value: kpi.reservations, icon: CalendarDays, href: '/admin/reservations',         tint: 'bg-[#EEF1FA]', ink: 'text-[#4A5FA5]' },
    { label: 'Career Applications',  value: kpi.careers,      icon: UserCheck,    href: '/admin/career-applications',   tint: 'bg-[#E8F1FB]', ink: 'text-[#3D7FBF]' },
    { label: 'Corporate Enquiries',  value: kpi.corporate,    icon: Briefcase,    href: '/admin/corporate-enquiries',   tint: 'bg-[#E8F6F0]', ink: 'text-[#167E68]' },
    { label: 'Franchise Enquiries',  value: kpi.franchise,    icon: TrendingUp,   href: '/admin/franchise-enquiries',   tint: 'bg-[#FDF1DC]', ink: 'text-[#C9943A]' },
    { label: 'Active Outlets',       value: kpi.outlets,      icon: Store,        href: '/admin/outlets',               tint: 'bg-[#F7E9E2]', ink: 'text-[#8B4A2F]' },
    { label: 'Unread Notifications', value: unreadCount,      icon: Bell,         href: '/admin/notifications',         tint: 'bg-[#FBE9E7]', ink: 'text-[#B4552D]' },
  ]

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 rounded-3xl bg-[#EAE2D6]" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_,i) => <div key={i} className="h-32 rounded-3xl bg-[#EAE2D6]" />)}
      </div>
      <div className="h-72 rounded-3xl bg-[#EAE2D6]" />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* ── HERO / GREETING ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-[#2A1408] bg-gradient-to-br from-[#1E0F09] via-[#3B1C12] to-[#5A2D1D] p-6 shadow-[0_24px_60px_-20px_rgba(30,15,8,0.55)] sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#C9943A]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-[#2FBF9B]/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#C9943A]">{dateStr}</p>
            <h1 className="font-heading mt-2 text-[26px] font-black leading-tight text-[#FFF7ED] sm:text-3xl">
              {greeting}, Admin
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-[#D9C6B2]">
              Here&apos;s what&apos;s brewing at Big Bean Café today — {kpi.orders} orders, {kpi.contacts} enquiries and {unreadCount} unread notifications.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/admin/reports" scroll={false}
              className="inline-flex items-center gap-2 rounded-full bg-[#C9943A] px-5 py-2.5 text-xs font-black text-[#241405] shadow-lg shadow-black/20 transition hover:bg-[#D9A94F]">
              <BarChart3 className="h-3.5 w-3.5" /> View Reports
            </Link>
            <a href="#website-content"
              className="inline-flex items-center gap-2 rounded-full border border-[#FFF7ED]/25 bg-white/5 px-5 py-2.5 text-xs font-black text-[#FFF7ED] backdrop-blur transition hover:bg-white/15">
              <Globe className="h-3.5 w-3.5" /> Website Content
            </a>
            <Link href="/admin/notifications" scroll={false}
              className="relative inline-flex items-center gap-2 rounded-full border border-[#FFF7ED]/25 bg-white/5 px-5 py-2.5 text-xs font-black text-[#FFF7ED] backdrop-blur transition hover:bg-white/15">
              <Bell className="h-3.5 w-3.5" /> Notifications
              {unreadCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C9943A] px-1 text-[9px] font-black text-[#241405]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </section>

      {/* ── KPI CARDS ───────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {KPI_CARDS.map(({ label, value, sub, icon: Icon, href, tint, ink, spark }) => (
          <Link key={label} href={href} scroll={false}
            className={`${CARD} ${HOVER} group flex flex-col justify-between gap-4 p-5`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
                <Icon className={`h-5 w-5 ${ink}`} />
              </span>
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#B3A491]">
                {sub}
                <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
              </span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="font-heading truncate text-[26px] font-black leading-none text-[#241A10]">{value}</p>
                <p className="mt-1.5 text-xs font-semibold text-[#8A7B6C]">{label}</p>
              </div>
              {spark && metrics.spark.length > 1 && (
                <SparkLine values={metrics.spark} color="#C9943A" />
              )}
            </div>
          </Link>
        ))}
      </section>

      {/* ── QUICK STATS STRIP ───────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {QUICK_STATS.map(({ label, value, icon: Icon, href, tint, ink }) => (
          <Link key={label} href={href} scroll={false}
            className="group flex items-center gap-3 rounded-2xl border border-[#EAE2D6] bg-white px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E4D3B8] hover:shadow-[0_14px_30px_-14px_rgba(43,28,16,0.20)]">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tint}`}>
              <Icon className={`h-4 w-4 ${ink}`} />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-black leading-none text-[#241A10]">{value}</span>
              <span className="mt-1 block truncate text-[10px] font-bold uppercase tracking-wide text-[#A89888]">{label}</span>
            </span>
          </Link>
        ))}
      </section>

      {/* ── MAIN GRID: analytics + utility column ───────────── */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

        {/* revenue chart */}
        <div className={`${CARD} flex flex-col p-6 sm:p-7`}>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B3A491]">Revenue Generated</p>
              <p className="font-heading mt-1 text-2xl font-black text-[#241A10]">{inr(weekTotal)}</p>
              <p className="mt-0.5 text-xs text-[#8A7B6C]">Last 7 days vs previous 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold text-[#8A7B6C]">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#EDE5D8]" />Previous</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#C9943A]" />This week</span>
            </div>
          </div>
          <RevenueBars current={metrics.week} previous={metrics.prevWeek} labels={metrics.weekLabels} />
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#F1EAE0] pt-4 text-[11px] font-semibold text-[#8A7B6C]">
            <span>This month: <span className="font-black text-[#241A10]">{inr(metrics.monthRevenue)}</span></span>
            <span>Avg. order: <span className="font-black text-[#241A10]">{inr(metrics.aov)}</span></span>
            <span>Total orders: <span className="font-black text-[#241A10]">{kpi.orders}</span></span>
          </div>
        </div>

        {/* utility column */}
        <div className="flex flex-col gap-5">

          {/* reports shortcut */}
          <div className={`${CARD} ${HOVER} bg-gradient-to-br from-[#FDF1DC] to-[#FFF9EF] p-5`}>
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B4A2F]">
                <BarChart3 className="h-5 w-5 text-[#FFF7ED]" />
              </span>
              <div>
                <p className="text-sm font-black text-[#241A10]">Reports &amp; insights</p>
                <p className="mt-1 text-xs leading-relaxed text-[#8A7B6C]">
                  Sales, orders and café performance in one place.
                </p>
              </div>
            </div>
            <Link href="/admin/reports" scroll={false}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#3B1C12] px-4 py-2 text-xs font-black text-[#FFF7ED] transition hover:bg-[#5A2D1D]">
              Open Reports <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* calendar */}
          <div className={`${CARD} p-5`}>
            <MiniCalendar />
          </div>

          {/* recent notifications */}
          <div className={`${CARD} p-5`}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black text-[#241A10]">Recent Notifications</p>
              <Link href="/admin/notifications" scroll={false} className="text-xs font-bold text-[#8B4A2F] hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-[#B3A491]">No recent notifications.</p>
              ) : (
                notifications.slice(0, 5).map((n) => {
                  const Icon = getNotificationIcon(n.type)
                  return (
                    <button
                      key={n.id}
                      onClick={() => markAsRead(n.id, n.action_url)}
                      className={`flex w-full items-start gap-2.5 text-left ${!n.is_read ? 'font-semibold' : ''}`}
                    >
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${getNotificationChip(n.type)}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-[#241A10]">{n.title}</p>
                        <p className="truncate text-[10px] text-[#8A7B6C]">{n.message}</p>
                        <p className="text-[10px] text-[#B3A491]">{formatTimeAgo(n.created_at)}</p>
                      </div>
                      {!n.is_read && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9943A]" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* event snapshot */}
          <div className={`${CARD} p-5`}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black text-[#241A10]">Event Snapshot</p>
              <Link href="/admin/event-bookings" scroll={false} className="text-xs font-bold text-[#8B4A2F] hover:underline">Bookings</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#E8F6F0] p-3">
                <CalendarDays className="h-4 w-4 text-[#167E68]" />
                <p className="mt-1 text-xl font-black text-[#241A10]">{eventSummary.upcoming_events}</p>
                <p className="text-[10px] font-semibold text-[#6B5B49]">Upcoming Events</p>
              </div>
              <div className="rounded-2xl bg-[#FDF1DC] p-3">
                <TrendingUp className="h-4 w-4 text-[#C9943A]" />
                <p className="mt-1 text-xl font-black text-[#241A10]">{eventSummary.today_bookings}</p>
                <p className="text-[10px] font-semibold text-[#6B5B49]">Today Bookings</p>
              </div>
              <div className="rounded-2xl bg-[#E8F1FB] p-3">
                <CreditCard className="h-4 w-4 text-[#3D7FBF]" />
                <p className="mt-1 text-xl font-black text-[#241A10]">{inr(eventSummary.event_revenue)}</p>
                <p className="text-[10px] font-semibold text-[#6B5B49]">Event Revenue</p>
              </div>
              <div className="rounded-2xl bg-[#F4ECF8] p-3">
                <UserCheck className="h-4 w-4 text-[#7A4E9E]" />
                <p className="mt-1 text-xl font-black text-[#241A10]">{eventSummary.pending_checkins}</p>
                <p className="text-[10px] font-semibold text-[#6B5B49]">Pending Check-ins</p>
              </div>
            </div>
          </div>

          {/* activity */}
          <div className={`${CARD} flex-1 p-5`}>
            <p className="mb-3 text-sm font-black text-[#241A10]">Recent Activity</p>
            <div className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.dot}`} />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#241A10]">{a.text}</p>
                    {a.time && <p className="text-[10px] text-[#B3A491]">{a.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── WEBSITE CONTENT TOOLS ───────────────────────────── */}
      <div id="website-content" className="scroll-mt-24">
        <WebsiteContentSlider />
      </div>

      {/* ── LATEST ORDERS TABLE ─────────────────────────────── */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-5 sm:px-7">
          <div>
            <p className="text-base font-black text-[#241A10]">Latest Merchandise Orders</p>
            <p className="mt-0.5 text-xs text-[#A89888]">Most recent orders across the store</p>
          </div>
          <Link href="/admin/merchandise-orders" scroll={false}
            className="flex items-center gap-1 rounded-full border border-[#EAE2D6] px-3.5 py-1.5 text-xs font-black text-[#8B4A2F] transition hover:border-[#C9943A] hover:bg-[#FDF1DC]">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-[#F1EAE0] bg-[#FBF8F3]">
                {['Order No','Customer','Amount','Status','Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider text-[#8A7B6C]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[#B3A491]">No orders yet.</td></tr>
              )}
              {orders.map((o, i) => (
                <tr key={i} className="border-b border-[#F7F2EA] transition-colors hover:bg-[#FBF8F3]">
                  <td className="px-5 py-3.5 font-black text-[#241A10]">#{o.order_number || o.id}</td>
                  <td className="px-5 py-3.5 text-[#4A3B2C]">{o.customer_name || o.customer_email || '—'}</td>
                  <td className="px-5 py-3.5 font-black text-[#241A10]">₹{o.total_amount || 0}</td>
                  <td className="px-5 py-3.5">
                    <span className={`${pill(String(o.status || ''))} rounded-full px-2.5 py-0.5 text-[11px] font-bold`}>
                      {o.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#A89888]">
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
