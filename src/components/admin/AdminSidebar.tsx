'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Globe, LogOut } from 'lucide-react'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  action?: 'view' | 'create' | 'edit' | 'delete' | 'export' | string
}

interface NavGroup {
  group: string
  items: NavItem[]
}

interface AdminSidebarProps {
  nav: NavGroup[]
  pathname: string
  user: Record<string, any> | null
  onLogout: () => void
  onNav?: () => void
}

const SIDEBAR_SCROLL_KEY = 'admin_sidebar_scroll_top'

export default function AdminSidebar({ nav, pathname, user, onLogout, onNav }: AdminSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Restore the last saved scroll position once on mount.
  useEffect(() => {
    const el = sidebarRef.current
    if (!el) return
    const saved = sessionStorage.getItem(SIDEBAR_SCROLL_KEY)
    if (saved) {
      requestAnimationFrame(() => {
        el.scrollTop = Number(saved)
      })
    }
  }, [])

  // Save scroll position on every scroll.
  const handleScroll = useCallback(() => {
    const el = sidebarRef.current
    if (el) {
      sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop))
    }
  }, [])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── logo header — fixed at top ── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#DCE8E3] px-5 py-4">
        <Link
          href="/admin/dashboard"
          scroll={false}
          onClick={onNav}
          className="flex items-center gap-2.5"
        >
          <Image
            src="/logo/big-bean-cafe-logo-transparent.png"
            alt="Big Bean Café"
            width={110}
            height={52}
            className="w-[110px] object-contain"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
        </Link>
        <span className="font-nav ml-auto shrink-0 rounded-full bg-[#EAF8F3] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#2FBF9B]">
          Admin
        </span>
      </div>

      {/* ── scrollable nav — takes all remaining height ── */}
      <div
        ref={sidebarRef}
        onScroll={handleScroll}
        role="navigation"
        aria-label="Admin menu"
        className="custom-admin-scroll flex-1 overflow-y-auto px-3 py-3"
      >
        {nav.map(({ group, items }) => (
          <div key={group} className="mb-1">
            <div className="font-nav px-3 pb-1 pt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#8A9A91]">
              {group}
            </div>
            {items.map(({ href, icon: Icon, label }) => {
              const active =
                pathname === href ||
                (href !== '/admin/dashboard' &&
                  href !== '/' &&
                  pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  scroll={false}
                  onClick={onNav}
                  className={`font-nav mb-0.5 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all ${
                    active
                      ? 'bg-[#EAF8F3] text-[#167E68]'
                      : 'text-[#42564D] hover:bg-[#F3F8F6] hover:text-[#0F1F1A]'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#2FBF9B]' : 'text-[#8AA89F]'}`} />
                  <span className="truncate">{label}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#2FBF9B]" />}
                </Link>
              )
            })}
          </div>
        ))}

        {/* logout inside scroll area at very bottom */}
        <div className="mt-2 pb-2">
          <div className="font-nav px-3 pb-1 pt-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#8A9A91]">
            SYSTEM
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNav}
            className="font-nav mb-0.5 flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-[#42564D] transition-all hover:bg-[#F3F8F6] hover:text-[#0F1F1A]"
          >
            <Globe className="h-4 w-4 shrink-0 text-[#8AA89F]" />
            View Website
          </a>
          <button
            onClick={onLogout}
            className="font-nav flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-[#42564D] transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 shrink-0 text-[#8AA89F]" />
            Logout
          </button>
        </div>

        {/* promo card */}
        <div className="mb-2 rounded-[20px] border border-[#DCE8E3] bg-gradient-to-br from-[#EAF8F3] to-[#FFF7ED] p-4">
          <p className="text-xs font-black text-[#1F2A24]">Big Bean Control</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#5F6F68]">
            Manage outlets, website and customer activity from one place.
          </p>
        </div>
      </div>

      {/* ── user card — fixed at bottom ── */}
      <div className="shrink-0 border-t border-[#DCE8E3] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9943A] to-[#8B4513] text-sm font-black text-white shadow">
            {(user?.username || user?.name || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-[#0F1F1A]">
              {user?.username || user?.name || 'Admin'}
            </p>
            <p className="text-[11px] text-[#5F6F68]">{user?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
