'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, User, Package, MapPin, Heart, Headphones, LogOut, X, Menu, ShieldCheck, AlertTriangle } from 'lucide-react'
import { clearCustomerSession, getCustomer, Customer } from '@/lib/customerAuth'

const LINKS = [
  { href: '/customer/dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
  { href: '/customer/profile',   label: 'Profile',    Icon: User },
  { href: '/customer/orders',    label: 'My Orders',  Icon: Package },
  { href: '/customer/addresses', label: 'Addresses',  Icon: MapPin },
  { href: '/customer/wishlist',  label: 'Wishlist',   Icon: Heart },
  { href: '/customer/support',   label: 'Support',    Icon: Headphones },
]

function SidebarInner({ customer, pathname, onNav, onLogoutRequest }: {
  customer: Customer | null
  pathname: string
  onNav?: () => void
  onLogoutRequest: () => void
}) {
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const initials = customer?.full_name
    ? customer.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'C'

  return (
    <div className="flex flex-col h-full">
      {/* Profile card */}
      <div className="px-4 pt-5 pb-4 border-b border-[#F5E6D3]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full text-base font-black text-[#FFF7ED] shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg,#3D1F0D,#C9943A)' }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-[#3D1F0D]">{customer?.full_name || 'Customer'}</p>
            <p className="truncate text-[11px] text-[#7A5A48] mt-0.5">{customer?.email || customer?.phone || '—'}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest text-[#C9943A] bg-[#FFF7ED] border border-[#E6C7A8] px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-2.5 h-2.5" /> Big Bean Member
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {LINKS.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} onClick={onNav}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold mb-0.5 transition-all ${
                active
                  ? 'bg-[#3D1F0D] text-[#FFF7ED] shadow-sm'
                  : 'text-[#42382F] hover:bg-[#FFF7ED] hover:text-[#3D1F0D]'
              }`}>
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#C9943A]' : 'text-[#9B7B60]'}`} />
              <span>{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9943A] shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-[#F5E6D3] pt-3">
        <button onClick={onLogoutRequest}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all">
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function CustomerSidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [customer, setCustomer]     = useState<Customer | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    setCustomer(getCustomer())
    const handler = () => setCustomer(getCustomer())
    window.addEventListener('bigbean-customer-auth-updated', handler)
    return () => window.removeEventListener('bigbean-customer-auth-updated', handler)
  }, [])

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [pathname])

  const doLogout = () => {
    clearCustomerSession()
    router.push('/')
  }

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white border-b border-[#E6C7A8] px-4 py-3 shadow-sm">
        <button onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-[#E6C7A8] px-3 py-1.5 text-sm font-bold text-[#3D1F0D] hover:bg-[#FFF7ED] transition">
          <Menu className="w-4 h-4 text-[#C9943A]" />
          Menu
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-[#FFF7ED]"
            style={{ background: 'linear-gradient(135deg,#3D1F0D,#C9943A)' }}>
            {customer?.full_name?.[0]?.toUpperCase() || 'C'}
          </div>
          <span className="text-sm font-bold text-[#3D1F0D] truncate max-w-[140px]">{customer?.full_name || 'Account'}</span>
        </div>
      </div>

      {/* ── Mobile backdrop ──────────────────────────── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
      )}

      {/* ── Mobile drawer ────────────────────────────── */}
      <aside className={`lg:hidden fixed left-0 top-0 z-50 h-screen w-[280px] bg-white shadow-2xl border-r border-[#E6C7A8] transition-transform duration-300
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setDrawerOpen(false)}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-[#7A5A48] hover:bg-[#FFF7ED]">
          <X className="w-5 h-5" />
        </button>
        <SidebarInner customer={customer} pathname={pathname} onNav={() => setDrawerOpen(false)} onLogoutRequest={() => { setDrawerOpen(false); setShowLogout(true) }} />
      </aside>

      {/* ── Desktop sidebar ──────────────────────────── */}
      <aside className="hidden lg:block w-[260px] shrink-0 self-start sticky top-6">
        <div className="rounded-2xl border border-[#E6C7A8] bg-white shadow-sm overflow-hidden">
          <SidebarInner customer={customer} pathname={pathname} onLogoutRequest={() => setShowLogout(true)} />
        </div>
      </aside>

      {/* ── Logout Confirmation Modal ─────────────────── */}
      {showLogout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E6C7A8] p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-black text-[#3D1F0D]">Log out?</p>
                <p className="text-sm text-[#7A5A48]">You will need to sign in again.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E6C7A8] text-sm font-bold text-[#3D1F0D] hover:bg-[#FFF7ED] transition">
                Cancel
              </button>
              <button onClick={doLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
