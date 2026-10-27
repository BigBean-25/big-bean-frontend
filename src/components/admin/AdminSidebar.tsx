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
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* ── logo header — fixed at top ── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#F0E8DB] px-5 py-4">
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
        <span className="font-nav ml-auto shrink-0 rounded-full border border-[#EEDFC6] bg-[#FDF1DC] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#A97B28]">
          Admin
        </span>
      </div>

      {/* ── scrollable nav — takes all remaining height ── */}
      <div
        ref={sidebarRef}
        onScroll={handleScroll}
        role="navigation"
        aria-label="Admin menu"
        className="custom-admin-scroll flex-1 overflow-y-auto px-3.5 py-3"
      >
        {nav.length === 0 && (
          <div className="mx-2 mt-6 rounded-2xl border border-[#EAE2D6] bg-[#F8F5EF] px-4 py-5 text-center">
            <p className="text-xs font-black text-[#6B5B49]">No admin modules assigned</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#A89888]">
              Please contact a Super Admin to configure your account permissions.
            </p>
          </div>
        )}

        {nav.map(({ group, items }) => (
          <div key={group} className="mb-1">
            <div className="font-nav px-4 pb-1.5 pt-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#B3A491]">
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
                  className={`font-nav group mb-0.5 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition-all duration-150 ${
                    active
                      ? 'bg-[#F7EBD9] text-[#6B3A1F] shadow-[inset_0_0_0_1px_#EEDFC6]'
                      : 'text-[#6B5B49] hover:bg-[#F8F5EF] hover:text-[#241A10]'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? 'text-[#C9943A]' : 'text-[#B3A491] group-hover:text-[#8A7B6C]'
                  }`} />
                  <span className="truncate">{label}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9943A]" />}
                </Link>
              )
            })}
          </div>
        ))}

        {/* system links */}
        <div className="mt-2 pb-2">
          <div className="font-nav px-4 pb-1.5 pt-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#B3A491]">
            SYSTEM
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNav}
            className="font-nav mb-0.5 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-[#6B5B49] transition-all duration-150 hover:bg-[#F8F5EF] hover:text-[#241A10]"
          >
            <Globe className="h-4 w-4 shrink-0 text-[#B3A491]" />
            View Website
          </a>
        </div>

        {/* promo card */}
        <div className="mb-3 mt-3 rounded-2xl border border-[#EEDFC6] bg-gradient-to-br from-[#FDF1DC] to-[#FFF9EF] p-4">
          <p className="text-xs font-black text-[#3B1C12]">Big Bean Control</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#8A7B6C]">
            Manage outlets, website and customer activity from one place.
          </p>
        </div>
      </div>

      {/* ── user card — fixed at bottom ── */}
      <div className="shrink-0 border-t border-[#F0E8DB] bg-[#FDFBF7] px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9943A] to-[#5A2D1D] text-sm font-black text-white shadow-sm">
            {(user?.username || user?.name || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-[#241A10]">
              {user?.username || user?.name || 'Admin'}
            </p>
            <p className="truncate text-[11px] text-[#A89888]">{user?.role || 'Administrator'}</p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#A89888] transition hover:bg-[#FBE9E7] hover:text-[#B4552D]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
