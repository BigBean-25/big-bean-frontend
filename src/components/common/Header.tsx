'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu, X, Search, User, ShoppingBag, ChevronDown,
  Home, UtensilsCrossed, MapPin, Tag, Image as ImageIcon,
  BookOpen, Briefcase, Building2, Package, Phone, Calendar,
} from 'lucide-react'
import { cartCount } from '@/lib/cart'
import { getCustomer, clearCustomerSession, isCustomerLoggedIn } from '@/lib/customerAuth'

const NAV_PRIMARY = [
  { name: 'HOME',      href: '/' },
  { name: 'ABOUT',     href: '/about' },
  { name: 'MENU',      href: '/menu' },
  { name: 'OUTLETS',   href: '/outlets' },
  { name: 'OFFERS',    href: '/offers' },
  { name: 'CONTACT',   href: '/contact' },
]

const NAV_MORE = [
  { name: 'Gallery',          href: '/gallery',          icon: ImageIcon },
  { name: 'Blog',             href: '/blog',             icon: BookOpen },
  { name: 'Careers',          href: '/careers',          icon: Briefcase },
  { name: 'Franchise',        href: '/franchise',        icon: Building2 },
  { name: 'Corporate Orders', href: '/corporate-orders', icon: UtensilsCrossed },
  { name: 'Merchandise',      href: '/merchandise',      icon: Package },
  { name: 'Reservations',     href: '/reservations',     icon: Calendar },
]

const SEARCH_ITEMS = [
  { title: 'Home',             href: '/',                type: 'Page' },
  { title: 'About Big Bean',   href: '/about',           type: 'Page' },
  { title: 'Menu',             href: '/menu',            type: 'Menu' },
  { title: 'Outlets',          href: '/outlets',         type: 'Locations' },
  { title: 'Offers',           href: '/offers',          type: 'Deals' },
  { title: 'Events',           href: '/events',          type: 'Events' },
  { title: 'Gallery',          href: '/gallery',         type: 'Media' },
  { title: 'Blog',             href: '/blog',            type: 'Stories' },
  { title: 'Careers',          href: '/careers',         type: 'Jobs' },
  { title: 'Franchise',        href: '/franchise',       type: 'Business' },
  { title: 'Corporate Orders', href: '/corporate-orders',type: 'Business' },
  { title: 'Merchandise',      href: '/merchandise',     type: 'Shop' },
  { title: 'Reservations',     href: '/reservations',    type: 'Booking' },
  { title: 'Contact',          href: '/contact',         type: 'Support' },
]

const QUICK_SEARCHES = ['Menu', 'Outlets', 'Events', 'Offers', 'Merchandise', 'Corporate Orders', 'Careers']

export default function Header() {
  const pathname  = usePathname()
  const router    = useRouter()
  const [isMenuOpen,   setIsMenuOpen]   = useState(false)
  const [isMoreOpen,   setIsMoreOpen]   = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [cartCountValue, setCartCountValue] = useState(0)
  const [customer, setCustomer] = useState<ReturnType<typeof getCustomer>>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const moreRef   = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Cart count sync
  useEffect(() => {
    const update = () => setCartCountValue(cartCount())
    update()
    window.addEventListener('bigbean-cart-updated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('bigbean-cart-updated', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  // Customer auth sync
  useEffect(() => {
    const update = () => setCustomer(isCustomerLoggedIn() ? getCustomer() : null)
    update()
    window.addEventListener('bigbean-customer-auth-updated', update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener('bigbean-customer-auth-updated', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close More dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Keyboard shortcuts: Escape closes, Ctrl/Cmd+K opens search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsSearchOpen(false); setIsMoreOpen(false); setIsMenuOpen(false) }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsSearchOpen(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Auto-focus search input
  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchRef.current?.focus(), 50)
    else setSearchQuery('')
  }, [isSearchOpen])

  // Close mobile menu + dropdowns on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsMoreOpen(false)
    setProfileOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  // Prefetch major routes
  useEffect(() => {
    router.prefetch('/menu')
    router.prefetch('/merchandise')
    router.prefetch('/cart')
    router.prefetch('/checkout')
    router.prefetch('/customer/dashboard')
    router.prefetch('/offers')
    router.prefetch('/outlets')
    router.prefetch('/contact')
  }, [router])

  const isActive = useCallback((href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href), [pathname])

  const searchResults = searchQuery.trim()
    ? SEARCH_ITEMS.filter(
        (i) =>
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const handleSearchSelect = (href: string) => {
    router.push(href)
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  const allNavActive = NAV_MORE.some((i) => isActive(i.href))

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[9999] w-full border-b border-[#E6C7A8]/70 bg-[#FFF7ED]/95 shadow-[0_4px_24px_rgba(61,31,13,0.08)] backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8 md:h-[82px]">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo/big-bean-cafe-logo-transparent.png"
              alt="Big Bean Café Coffee Roasters"
              width={150}
              height={78}
              className="h-[52px] w-auto object-contain md:h-[58px] lg:h-[64px]"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            {NAV_PRIMARY.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
                  className={`font-nav relative rounded-full px-3.5 py-2 text-[12px] xl:text-[13px] font-extrabold uppercase tracking-[0.16em] leading-none transition-all duration-200 ${
                    active
                      ? 'bg-[#3D1F0D] text-[#FFF7ED] shadow-[0_8px_20px_rgba(59,27,13,0.22)]'
                      : 'text-[#32180c] hover:bg-[#F5E6D3] hover:text-[#9b5b1d]'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setIsMoreOpen((o) => !o)}
                className={`font-nav flex items-center gap-1 rounded-full px-3.5 py-2 text-[12px] xl:text-[13px] font-extrabold uppercase tracking-[0.16em] leading-none transition-all duration-200 ${
                  allNavActive || isMoreOpen
                    ? 'bg-[#3D1F0D] text-[#FFF7ED]'
                    : 'text-[#3D1F0D] hover:bg-[#F5E6D3]'
                }`}
              >
                More
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-[22px] border border-[#E6C7A8] bg-white shadow-[0_16px_48px_rgba(61,31,13,0.14)]">
                  {NAV_MORE.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMoreOpen(false)}
                        className={`font-nav flex items-center gap-3 px-4 py-3 text-[13px] font-bold tracking-[0.04em] transition hover:bg-[#FFF7ED] ${active ? 'bg-[#FFF7ED] text-[#C9943A]' : 'text-[#32180c]'}`}
                      >
                        <Icon className="h-4 w-4 text-[#C9943A]" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop right */}
          <div className="hidden items-center gap-2 lg:flex xl:gap-2.5">
            {/* Search */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#3D1F0D] transition hover:bg-[#F5E6D3]"
            >
              <Search className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            </button>

            {/* Login / Profile */}
            {customer ? (
              <div className="relative" ref={profileRef}>
                <button type="button" onClick={() => setProfileOpen(o => !o)} aria-label="Profile"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3D1F0D] text-[#FFF7ED] text-sm font-black transition hover:bg-[#6B3520]">
                  {customer.full_name?.[0]?.toUpperCase() || 'C'}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-[22px] border border-[#E6C7A8] bg-white shadow-[0_16px_48px_rgba(61,31,13,0.14)]">
                    <div className="px-4 py-3 border-b border-[#F5E6D3]">
                      <p className="text-xs font-black text-[#3D1F0D] truncate">{customer.full_name}</p>
                      <p className="text-[10px] text-[#7A5A48] truncate">{customer.email || customer.phone || ''}</p>
                    </div>
                    {[
                      { label: 'My Dashboard', href: '/customer/dashboard' },
                      { label: 'My Orders',    href: '/customer/orders'    },
                      { label: 'Profile',      href: '/customer/profile'   },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setProfileOpen(false)}
                        className="flex items-center px-4 py-3 text-sm font-bold text-[#3D1F0D] hover:bg-[#FFF7ED] transition border-b border-[#F5E6D3] last:border-0">
                        {item.label}
                      </Link>
                    ))}
                    <button onClick={() => { clearCustomerSession(); setProfileOpen(false); router.push('/') }}
                      className="flex w-full items-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" aria-label="Login"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#3D1F0D] transition hover:bg-[#F5E6D3]">
                <User className="h-[18px] w-[18px]" />
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#3D1F0D] transition hover:bg-[#F5E6D3]"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCountValue > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#FFF7ED] bg-[#A92517] px-1 text-[9px] font-black text-white">
                  {cartCountValue}
                </span>
              )}
            </Link>

            {/* Order Now */}
            <a
              href="https://bigbeancafe.store"
              target="_blank"
              rel="noopener noreferrer"
              className="font-nav ml-1 rounded-full bg-[#3D1F0D] px-5 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.12em] leading-none text-[#FFF7ED] shadow-md transition hover:-translate-y-0.5 hover:bg-[#6B3520] hover:shadow-lg"
            >
              Order Now
            </a>
          </div>

          {/* Mobile right */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#3D1F0D] transition hover:bg-[#F5E6D3]"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#3D1F0D] transition hover:bg-[#F5E6D3]"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCountValue > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full border-2 border-[#FFF7ED] bg-[#A92517] px-0.5 text-[8px] font-black text-white">
                  {cartCountValue}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setIsMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#3D1F0D] transition hover:bg-[#F5E6D3]"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="border-t border-[#E6C7A8] bg-[#FFF7ED] lg:hidden" style={{ maxHeight: 'calc(100vh - 70px)', overflowY: 'auto' }}>
            <div className="mx-auto max-w-[1500px] px-4 pb-5 pt-3">
              {/* Primary links */}
              <div className="space-y-0.5">
                {NAV_PRIMARY.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`font-nav flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold uppercase tracking-[0.08em] transition ${
                        active ? 'bg-[#3D1F0D] text-[#FFF7ED]' : 'text-[#3D1F0D] hover:bg-[#F5E6D3]'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </div>

              {/* More links */}
              <div className="mt-3 rounded-2xl border border-[#E6C7A8] bg-white p-2">
                <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#9B6B50]">More</p>
                <div className="grid grid-cols-2 gap-1">
                  {NAV_MORE.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`font-nav flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold tracking-[0.04em] transition ${
                          active ? 'bg-[#3D1F0D] text-[#FFF7ED]' : 'text-[#3D1F0D] hover:bg-[#FFF7ED]'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0 text-[#C9943A]" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Customer area */}
              {customer ? (
                <div className="mt-3 rounded-2xl border border-[#E6C7A8] bg-white overflow-hidden">
                  {/* Avatar + name row */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-[#F5E6D3]" style={{ background: 'linear-gradient(135deg,#120905,#3D1F0D)' }}>
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#C9943A] text-[#120905] text-sm font-black">
                      {customer.full_name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[#FFF7ED] truncate">{customer.full_name}</p>
                      <p className="text-[10px] text-[#C7A489] truncate">{customer.email || customer.phone || ''}</p>
                    </div>
                  </div>
                  {[
                    { label: 'My Dashboard',   href: '/customer/dashboard' },
                    { label: 'Order History',  href: '/customer/orders'    },
                    { label: 'Wishlist',       href: '/customer/wishlist'  },
                    { label: 'Profile',        href: '/customer/profile'   },
                  ].map(item => (
                    <Link key={item.href} href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-4 py-3 text-sm font-bold text-[#3D1F0D] hover:bg-[#FFF7ED] transition border-b border-[#F5E6D3] last:border-0">
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      clearCustomerSession()
                      setIsMenuOpen(false)
                      router.push('/')
                    }}
                    className="flex w-full items-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-nav flex items-center justify-center gap-2 rounded-2xl border border-[#E6C7A8] py-3 text-xs font-extrabold uppercase tracking-[0.10em] text-[#3D1F0D] transition hover:bg-[#F5E6D3]"
                  >
                    <User className="h-4 w-4" /> Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="font-nav flex items-center justify-center gap-2 rounded-2xl border border-[#C9943A] py-3 text-xs font-extrabold uppercase tracking-[0.10em] text-[#C9943A] transition hover:bg-[#FFF7ED]"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Order Now — always visible */}
              <div className="mt-2">
                <a
                  href="https://bigbeancafe.store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-nav flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3D1F0D] py-3 text-xs font-extrabold uppercase tracking-[0.10em] text-[#FFF7ED] shadow-md transition hover:bg-[#6B3520]"
                >
                  Order Now
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer to offset fixed header so page content isn't hidden behind it */}
      <div className="h-[70px] md:h-[82px] shrink-0" aria-hidden="true" />

      {/* Search overlay */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-start justify-center px-4 pt-20 sm:pt-24"
          style={{ background: 'rgba(18,9,5,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={() => setIsSearchOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-[#E6C7A8] bg-[#FFF7ED] shadow-[0_32px_80px_rgba(18,9,5,0.28)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input row */}
            <div className="flex items-center gap-3 border-b border-[#E6C7A8] px-5 py-4">
              <Search className="h-5 w-5 flex-shrink-0 text-[#C9943A]" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu, outlets, offers, blog..."
                className="flex-1 bg-transparent text-base font-semibold text-[#3D1F0D] outline-none placeholder:text-[#A98A74]"
                aria-label="Search"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#9B6B50] transition hover:bg-[#F5E6D3]"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-3">
              {searchQuery.trim() === '' ? (
                <>
                  <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#9B6B50]">Popular Searches</p>
                  <div className="flex flex-wrap gap-2 px-3">
                    {QUICK_SEARCHES.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setSearchQuery(q)}
                        className="rounded-full border border-[#E6C7A8] bg-white px-4 py-2 text-sm font-bold text-[#3D1F0D] transition hover:border-[#C9943A] hover:bg-[#FFF7ED]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              ) : searchResults.length > 0 ? (
                <>
                  <p className="mb-1 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#9B6B50]">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
                  {searchResults.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => handleSearchSelect(item.href)}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-[#F5E6D3]"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FFF7ED] text-[#C9943A]">
                        <Search className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#3D1F0D]">{item.title}</p>
                        <p className="text-[11px] font-semibold text-[#9B6B50]">{item.type}</p>
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm font-bold text-[#9B6B50]">No results for "{searchQuery}"</p>
                  <p className="mt-1 text-xs text-[#A98A74]">Try a different keyword.</p>
                </div>
              )}
            </div>

            <div className="border-t border-[#E6C7A8] px-5 py-2.5">
              <p className="text-[10px] text-[#A98A74]">Press <kbd className="rounded bg-[#F5E6D3] px-1.5 py-0.5 font-mono text-[#6B3520]">Esc</kbd> to close · <kbd className="rounded bg-[#F5E6D3] px-1.5 py-0.5 font-mono text-[#6B3520]">Ctrl K</kbd> to open</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
