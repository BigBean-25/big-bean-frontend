'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, ShoppingBag, Users, Store, BarChart3, FileText,
  Coffee, Package, CalendarDays, Tag, Briefcase, MessageSquare,
  Settings, Globe, LogOut, Menu, X, Bell, Search, ChevronDown,
  User, BookOpen, MapPin, Image as ImageIcon, Phone, Calendar,
  UserCheck, Mail, Smartphone, Home, TrendingUp, Star, Instagram, Headphones as HeadphonesIcon,
  CreditCard, AlertTriangle, MessageCircle, Building2, Send, AlertCircle, Shield, Ticket, QrCode
} from 'lucide-react'
import { formatTimeAgo } from '@/lib/timeAgo'
import { apiRequest } from '@/lib/api'
import {
  isSuperAdmin, filterMenuByPermissions, clearAdminAuthData,
  getAdminToken, getAdminUser, saveAdminAuthData
} from '@/lib/adminPermissions'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminDateTime from '@/components/admin/AdminDateTime'
import { Toaster } from 'react-hot-toast'

/* ── all nav groups ───────────────────────────────────── */
const NAV = [
  {
    group: 'MAIN',
    items: [
      { href: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard'   },
      { href: '/admin/notifications', icon: Bell,          label: 'Notifications' },
      { href: '/admin/reports',    icon: BarChart3,        label: 'Reports'     },
      { href: '/admin/settings',          icon: Settings,  label: 'Settings'        },
      { href: '/admin/settings/contact', icon: Phone,     label: 'Contact Details' },
      { href: '/admin/users',      icon: UserCheck,        label: 'Admin Users' },
      { href: '/admin/roles',      icon: Shield,           label: 'Roles & Permissions' },
      { href: '/admin/customers',  icon: Users,            label: 'Customers'   },
    ]
  },
  {
    group: 'WEBSITE CONTENT',
    items: [
      { href: '/admin/home-banners',       icon: Home,       label: 'Home Banners'       },
      { href: '/admin/about-hero',         icon: BookOpen,   label: 'About Hero'         },
      { href: '/admin/menu-hero',          icon: Coffee,     label: 'Menu Hero'          },
      { href: '/admin/offers-hero',        icon: Tag,        label: 'Offers Hero'        },
      { href: '/admin/outlet-hero',        icon: MapPin,     label: 'Outlet Hero'        },
      { href: '/admin/reservation-hero',   icon: CalendarDays, label: 'Reservation Hero' },
      { href: '/admin/blog-hero',          icon: FileText,   label: 'Blog Hero'          },
      { href: '/admin/gallery-hero',       icon: ImageIcon,  label: 'Gallery Hero'       },
      { href: '/admin/career-hero',        icon: Briefcase,  label: 'Career Hero'        },
      { href: '/admin/contact-hero',       icon: Phone,      label: 'Contact Hero'       },
      { href: '/admin/events-hero',        icon: Calendar,   label: 'Events Hero'        },
      { href: '/admin/franchise-hero',     icon: Store,      label: 'Franchise Hero'     },
      { href: '/admin/corporate-hero',     icon: Briefcase,  label: 'Corporate Hero'     },
      { href: '/admin/page-heroes',        icon: Globe,      label: 'Page Heroes'        },
      { href: '/admin/legal-pages',        icon: FileText,   label: 'Legal Pages'        },
      { href: '/admin/seo',                icon: Globe,      label: 'SEO Management'     },
      { href: '/admin/seo/settings',       icon: Settings,   label: 'SEO Settings'       },
    ]
  },
  {
    group: 'BUSINESS',
    items: [
      { href: '/admin/outlets',                  icon: Store,         label: 'Outlets'               },
      { href: '/admin/reservations',             icon: CalendarDays,  label: 'Reservations'          },
      { href: '/admin/corporate-orders',         icon: Briefcase,     label: 'Corporate Orders'      },
      { href: '/admin/corporate-enquiries',      icon: Briefcase,     label: 'Corporate Enquiries'   },
      { href: '/admin/franchise-enquiries',      icon: Store,         label: 'Franchise Enquiries'   },
      { href: '/admin/career-jobs',              icon: Briefcase,     label: 'Career Jobs'           },
      { href: '/admin/career-applications',      icon: UserCheck,     label: 'Applications'          },
      { href: '/admin/contact-enquiries',        icon: MessageSquare, label: 'Contact Enquiries'     },
      { href: '/admin/support-tickets',          icon: HeadphonesIcon, label: 'Support Tickets'      },
      { href: '/admin/newsletter-subscribers',   icon: Mail,          label: 'Newsletter'            },
      { href: '/admin/testimonials',             icon: Star,          label: 'Testimonials'          },
    ]
  },
  {
    group: 'CONTENT',
    items: [
      { href: '/admin/blog',                   icon: FileText,   label: 'Blog Posts'           },
      { href: '/admin/gallery',                icon: ImageIcon,  label: 'Gallery'              },
      { href: '/admin/events',                 icon: Calendar,   label: 'Events'               },
      { href: '/admin/event-bookings',         icon: Ticket,     label: 'Event Bookings'       },
      { href: '/admin/event-checkin',          icon: QrCode,     label: 'Event Check-in',       action: 'edit' },
      { href: '/admin/event-message-templates',icon: Mail,       label: 'Event Messages'       },
      { href: '/admin/offers',                 icon: Tag,        label: 'Offers'               },
      { href: '/admin/menu',                   icon: Coffee,     label: 'Menu'                 },
      { href: '/admin/menu-combos',            icon: Coffee,     label: 'Menu Combos'          },
    ]
  },
  {
    group: 'MERCHANDISE',
    items: [
      { href: '/admin/merchandise',            icon: Package,    label: 'Products'             },
      { href: '/admin/merchandise-orders',     icon: ShoppingBag,label: 'Orders'               },
      { href: '/admin/merchandise-categories', icon: Tag,        label: 'Categories'           },
      { href: '/admin/merchandise-banners',    icon: ImageIcon,  label: 'Banners'              },
      { href: '/admin/merchandise-reviews',    icon: Star,       label: 'Reviews'              },
    ]
  },
  {
    group: 'APP & MARKETING',
    items: [
      { href: '/admin/app-promos',       icon: Smartphone, label: 'App Promos'       },
      { href: '/admin/instagram-media',  icon: ImageIcon,  label: 'Instagram Media'  },
    ]
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen]     = useState(false)
  const [user, setUser]               = useState<Record<string, any> | null>(null)
  const [loading, setLoading]         = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filteredNav, setFilteredNav] = useState(NAV)
  const router     = useRouter()
  const pathname   = usePathname()
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef   = useRef<HTMLDivElement>(null)

  // Notification icon mapping
  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      new_order: ShoppingBag,
      payment_success: CreditCard,
      payment_failed: AlertTriangle,
      support_ticket: HeadphonesIcon,
      support_reply: MessageCircle,
      contact_enquiry: Mail,
      reservation: CalendarDays,
      corporate_enquiry: Building2,
      franchise_enquiry: Store,
      career_application: Briefcase,
      newsletter: Send,
      low_stock: AlertCircle,
      merchandise_review: Star,
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

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest('/admin-notifications/recent?limit=8')
      if (!res.ok) {
        // 403 = no permission for notifications; silently hide — do not logout
        if (res.status === 403) {
          setNotifications([])
          setUnreadCount(0)
        }
        return
      }
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch {
      // Network errors — silently ignore to avoid console spam
    }
  }

  const markAsRead = async (id: number, actionUrl?: string) => {
    try {
      const res = await apiRequest(`/admin-notifications/${id}/read`, { method: 'PUT' })
      if (!res.ok) return
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
      if (actionUrl) {
        setNotifOpen(false)
        router.push(actionUrl, { scroll: false })
      }
    } catch (err) {
      console.warn('Failed to mark notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await apiRequest('/admin-notifications/mark-all-read', { method: 'PUT' })
      if (!res.ok) return
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
      setUnreadCount(0)
    } catch (err) {
      console.warn('Failed to mark all notifications as read:', err)
    }
  }

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) { setLoading(false); return }

    const token = getAdminToken()
    if (!token) {
      router.replace('/admin/login')
      return
    }

    // Verify token with backend — this is the single source of truth
    apiRequest('/admin-auth/me')
      .then(async (res) => {
        // Only 401 (invalid/expired token) should trigger logout+redirect
        if (res.status === 401) {
          clearAdminAuthData()
          router.replace('/admin/login', { scroll: false })
          return
        }
        // 403 or any other non-ok status — fall back to cached data, do not logout
        if (!res.ok) {
          const cachedUser = getAdminUser()
          if (cachedUser) {
            setUser(cachedUser)
            setFilteredNav(isSuperAdmin() ? NAV : filterMenuByPermissions(NAV))
          }
          setLoading(false)
          return
        }
        const data = await res.json()
        if (!data.success) {
          // Invalid response body — fall back to cached rather than logout
          const cachedUser = getAdminUser()
          if (cachedUser) {
            setUser(cachedUser)
            setFilteredNav(isSuperAdmin() ? NAV : filterMenuByPermissions(NAV))
            setLoading(false)
          } else {
            clearAdminAuthData()
            router.replace('/admin/login', { scroll: false })
          }
          return
        }
        // Refresh stored auth data with latest from server
        const permissions = data.permissions || []
        const menuAccess  = data.menuAccess  || {}
        saveAdminAuthData(token, data.user, permissions, menuAccess)
        setUser(data.user)
        setFilteredNav(
          data.user.role_key === 'super_admin'
            ? NAV
            : filterMenuByPermissions(NAV)
        )
        setLoading(false)
      })
      .catch(() => {
        // Network error — fall back to cached data rather than logging out
        const cachedUser = getAdminUser()
        if (cachedUser) {
          setUser(cachedUser)
          setFilteredNav(isSuperAdmin() ? NAV : filterMenuByPermissions(NAV))
          setLoading(false)
        } else {
          router.replace('/admin/login', { scroll: false })
        }
      })
  }, [router, isLoginPage])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Poll notifications every 30 seconds
  useEffect(() => {
    if (isLoginPage) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isLoginPage])

  if (isLoginPage) return <>{children}</>

  const handleLogout = () => {
    clearAdminAuthData()
    router.push('/admin/login', { scroll: false })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F8F6]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2FBF9B] border-t-transparent" />
          <p className="text-sm text-[#5F6F68]">Loading…</p>
        </div>
      </div>
    )
  }


  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F8F6] text-[#0F1F1A]">

      {/* ── Desktop sidebar ── */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[280px] overflow-hidden border-r border-[#DCE8E3] bg-white lg:block">
        <AdminSidebar nav={filteredNav} pathname={pathname} user={user} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile backdrop ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)} />
      )}

      {/* ── Mobile drawer ── */}
      <aside className={`fixed left-0 top-0 z-50 h-screen w-[280px] border-r border-[#DCE8E3] bg-white shadow-2xl
        transition-transform duration-300 lg:hidden
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setDrawerOpen(false)}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-[#5F6F68] hover:bg-[#F3F8F6]">
          <X className="h-5 w-5" />
        </button>
        <AdminSidebar nav={filteredNav} pathname={pathname} user={user} onLogout={handleLogout} onNav={() => setDrawerOpen(false)} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden lg:pl-[280px]">
        <div className="flex-1 overflow-y-auto">

          {/* Topbar */}
          <header className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-[#DCE8E3] bg-white/90 px-5 backdrop-blur-xl lg:px-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setDrawerOpen(true)}
                className="rounded-xl p-2 text-[#5F6F68] hover:bg-[#F3F8F6] lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden items-center gap-2.5 rounded-full border border-[#DCE8E3] bg-[#EEF5F2] px-4 py-2.5 md:flex w-full max-w-xs lg:max-w-sm">
                <Search className="h-4 w-4 shrink-0 text-[#9CB3AC]" />
                <input type="text" placeholder="Search anything…"
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
                  className="w-full bg-transparent text-sm text-[#0F1F1A] outline-none placeholder:text-[#9CB3AC]" />
              </div>
            </div>

            <AdminDateTime />

            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <div ref={notifRef} className="relative">
                <button onClick={() => setNotifOpen(v => !v)}
                  className="relative rounded-full p-2.5 text-[#5F6F68] hover:bg-[#EEF5F2]">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-2 top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-[#C9943A] px-1 text-[10px] font-black text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#E8D8C7] bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#F7EFE7] px-4 py-3">
                      <h3 className="font-heading text-sm font-black text-[#3D1F0D]">Notifications</h3>
                      <button onClick={markAllAsRead}
                        className="text-xs font-black text-[#C9943A] hover:text-[#6B3520]">
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center font-nav text-sm text-[#7A6A60]">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const Icon = getNotificationIcon(notif.type)
                          return (
                            <button
                              key={notif.id}
                              onClick={() => markAsRead(notif.id, notif.action_url)}
                              className={`flex w-full gap-3 border-b border-[#F3F8F6] px-4 py-3 text-left transition hover:bg-[#F3F8F6] ${
                                !notif.is_read ? 'bg-[#F9FEFB]' : ''
                              }`}
                            >
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getNotificationColor(notif.type)} bg-opacity-10`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#0F1F1A]">{notif.title}</p>
                                <p className="mt-0.5 truncate text-[11px] text-[#5F6F68]">{notif.message}</p>
                                <p className="mt-1 text-[10px] text-[#8AA89F]">{formatTimeAgo(notif.created_at)}</p>
                              </div>
                              {!notif.is_read && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C9943A]" />
                              )}
                            </button>
                          )
                        })
                      )}
                    </div>

                    <div className="border-t border-[#DCE8E3] px-4 py-2">
                      <Link href="/admin/notifications" scroll={false} onClick={() => setNotifOpen(false)}
                        className="flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold text-[#2FBF9B] hover:bg-[#EAF8F3]">
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/admin/settings" scroll={false} className="rounded-full p-2.5 text-[#5F6F68] hover:bg-[#EEF5F2]">
                <Settings className="h-5 w-5" />
              </Link>

              {/* profile dropdown */}
              <div ref={profileRef} className="relative ml-1">
                <button onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2.5 rounded-full border border-[#DCE8E3] bg-white py-1.5 pl-1.5 pr-3 shadow-sm hover:bg-[#F3F8F6]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#C9943A] to-[#8B4513] text-xs font-black text-white">
                    {(user?.username || user?.name || 'A')[0].toUpperCase()}
                  </div>
                  <span className="hidden text-sm font-bold text-[#0F1F1A] sm:block">
                    {user?.username || user?.name || 'Admin'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#5F6F68]" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-[#DCE8E3] bg-white py-1.5 shadow-xl">
                    <Link href="/admin/settings" scroll={false} onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0F1F1A] hover:bg-[#F3F8F6]">
                      <User className="h-4 w-4 text-[#8AA89F]" /> Profile
                    </Link>
                    <a href="/" target="_blank" rel="noopener noreferrer" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0F1F1A] hover:bg-[#F3F8F6]">
                      <Globe className="h-4 w-4 text-[#8AA89F]" /> Visit Website
                    </a>
                    <div className="my-1 border-t border-[#DCE8E3]" />
                    <button onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="min-h-[calc(100vh-68px)] p-5 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
