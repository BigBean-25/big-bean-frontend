'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag, CreditCard, AlertTriangle, Headphones, MessageCircle,
  Mail, CalendarDays, Building2, Store, Briefcase, Send, AlertCircle,
  Bell, Search, Check, Trash2, Filter
} from 'lucide-react'
import { formatTimeAgo } from '@/lib/timeAgo'
import { apiRequest } from '@/lib/api'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, unread: 0, high_priority: 0, today: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '20',
      }
      if (filter === 'unread') {
        params.is_read = 'false'
      } else if (filter !== 'all') {
        params.type = filter
      }
      if (search) params.search = search
      const queryParams = new URLSearchParams(params)
      const res = await apiRequest(`/admin-notifications?${queryParams}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications || [])
        setPagination(data.pagination || { page, limit: 20, total: 0, totalPages: 0 })
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await apiRequest('/admin-notifications/stats')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.success) {
        setStats(data.stats || { total: 0, unread: 0, high_priority: 0, today: 0 })
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchStats()
  }, [page, filter, search])

  const markAsRead = async (id: number) => {
    try {
      const res = await apiRequest(`/admin-notifications/${id}/read`, { method: 'PUT' })
      if (!res.ok) return
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
      fetchStats()
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await apiRequest('/admin-notifications/mark-all-read', { method: 'PUT' })
      if (!res.ok) return
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
      fetchStats()
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const deleteNotification = async (id: number) => {
    if (!confirm('Delete this notification?')) return
    try {
      const res = await apiRequest(`/admin-notifications/${id}`, { method: 'DELETE' })
      if (!res.ok) return
      setNotifications(prev => prev.filter(n => n.id !== id))
      fetchStats()
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      new_order: ShoppingBag,
      payment_success: CreditCard,
      payment_failed: AlertTriangle,
      support_ticket: Headphones,
      support_reply: MessageCircle,
      contact_enquiry: Mail,
      reservation: CalendarDays,
      corporate_enquiry: Building2,
      franchise_enquiry: Store,
      career_application: Briefcase,
      newsletter: Send,
      low_stock: AlertCircle,
    }
    return icons[type] || Bell
  }

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      new_order: 'text-amber-600 bg-amber-50',
      payment_success: 'text-green-600 bg-green-50',
      payment_failed: 'text-red-600 bg-red-50',
      support_ticket: 'text-blue-600 bg-blue-50',
      support_reply: 'text-purple-600 bg-purple-50',
      contact_enquiry: 'text-orange-600 bg-orange-50',
      reservation: 'text-emerald-600 bg-emerald-50',
      corporate_enquiry: 'text-indigo-600 bg-indigo-50',
      franchise_enquiry: 'text-yellow-600 bg-yellow-50',
      career_application: 'text-cyan-600 bg-cyan-50',
      newsletter: 'text-gray-600 bg-gray-50',
      low_stock: 'text-red-600 bg-red-50',
    }
    return colors[type] || 'text-gray-600 bg-gray-50'
  }

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      low: { text: 'Low', color: 'bg-gray-100 text-gray-700' },
      normal: { text: 'Normal', color: 'bg-blue-100 text-blue-700' },
      high: { text: 'High', color: 'bg-orange-100 text-orange-700' },
      urgent: { text: 'Urgent', color: 'bg-red-100 text-red-700' },
    }
    return badges[priority] || badges.normal
  }

  const handleNotificationClick = (notif: any) => {
    if (!notif.is_read) markAsRead(notif.id)
    if (notif.action_url) router.push(notif.action_url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0F1F1A]">Notifications</h1>
          <p className="mt-1 text-sm text-[#5F6F68]">Manage all your admin notifications</p>
        </div>
        <button onClick={markAllAsRead}
          className="inline-flex items-center gap-2 rounded-full bg-[#2FBF9B] px-5 py-2.5 text-sm font-black text-white shadow-md transition hover:bg-[#167E68]">
          <Check className="h-4 w-4" />
          Mark All Read
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5">
          <p className="text-xs font-black uppercase tracking-wider text-[#8AA89F]">Total</p>
          <p className="mt-2 text-3xl font-black text-[#0F1F1A]">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5">
          <p className="text-xs font-black uppercase tracking-wider text-[#8AA89F]">Unread</p>
          <p className="mt-2 text-3xl font-black text-[#C9943A]">{stats.unread}</p>
        </div>
        <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5">
          <p className="text-xs font-black uppercase tracking-wider text-[#8AA89F]">High Priority</p>
          <p className="mt-2 text-3xl font-black text-[#E85D4C]">{stats.high_priority}</p>
        </div>
        <div className="rounded-2xl border border-[#DCE8E3] bg-white p-5">
          <p className="text-xs font-black uppercase tracking-wider text-[#8AA89F]">Today</p>
          <p className="mt-2 text-3xl font-black text-[#2FBF9B]">{stats.today}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'unread', 'new_order', 'payment_success', 'payment_failed', 'support_ticket', 'contact_enquiry', 'reservation', 'franchise_enquiry', 'corporate_enquiry', 'career_application', 'newsletter'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1) }}
              className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                filter === f
                  ? 'bg-[#0F1F1A] text-white'
                  : 'border border-[#DCE8E3] bg-white text-[#5F6F68] hover:bg-[#F3F8F6]'
              }`}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8AA89F]" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full rounded-full border border-[#DCE8E3] bg-white pl-10 pr-4 py-2.5 text-sm text-[#0F1F1A] outline-none focus:border-[#2FBF9B] md:w-64"
          />
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2FBF9B] border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-[#DCE8E3] bg-white p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-[#DCE8E3]" />
          <p className="mt-4 text-sm font-bold text-[#5F6F68]">No notifications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const Icon = getNotificationIcon(notif.type)
            const priorityBadge = getPriorityBadge(notif.priority)
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`group flex items-start gap-4 rounded-2xl border border-[#DCE8E3] bg-white p-5 transition hover:shadow-md ${
                  !notif.is_read ? 'bg-[#F9FEFB]' : ''
                }`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getNotificationColor(notif.type)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-[#0F1F1A]">{notif.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${priorityBadge.color}`}>
                          {priorityBadge.text}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#5F6F68]">{notif.message}</p>
                      <p className="mt-1 text-xs text-[#8AA89F]">{formatTimeAgo(notif.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {!notif.is_read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif.id) }}
                          className="rounded-full p-2 text-[#8AA89F] hover:bg-[#F3F8F6]"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id) }}
                        className="rounded-full p-2 text-[#8AA89F] hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {!notif.is_read && (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C9943A]" />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full border border-[#DCE8E3] bg-white px-4 py-2 text-sm font-bold text-[#0F1F1A] disabled:opacity-50 hover:bg-[#F3F8F6]"
          >
            Previous
          </button>
          <p className="text-sm text-[#5F6F68]">
            Page {page} of {pagination.totalPages}
          </p>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="rounded-full border border-[#DCE8E3] bg-white px-4 py-2 text-sm font-bold text-[#0F1F1A] disabled:opacity-50 hover:bg-[#F3F8F6]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
