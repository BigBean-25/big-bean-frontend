'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { X, ExternalLink } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

const normalizePopupImageUrl = (img: string | null | undefined): string | null => {
  if (!img) return null
  const s = img.trim()
  if (!s) return null
  if (s.startsWith('https://')) return s
  if (s.startsWith('http://localhost') || s.startsWith('http://127.0.0.1')) {
    try {
      const u = new URL(s)
      return `${API_ORIGIN}${u.pathname}`
    } catch { return null }
  }
  const p = s.startsWith('/') ? s : `/${s}`
  return `${API_ORIGIN}${p}`
}

// ── page key helper ───────────────────────────────────────────────────────────

const PAGE_MAP: Record<string, string> = {
  '':                'home',
  'about':           'about',
  'our-story':       'our-story',
  'menu':            'menu',
  'outlets':         'outlets',
  'offers':          'offers',
  'events':          'events',
  'merchandise':     'merchandise',
  'gallery':         'gallery',
  'blog':            'blog',
  'contact':         'contact',
  'franchise':       'franchise',
  'reservations':    'reservations',
  'corporate-orders':'corporate-orders',
}

const getPageKey = (pathname: string): string => {
  const first = pathname.replace(/^\//, '').split('/')[0]
  return PAGE_MAP[first] ?? first
}

// ── frequency storage helpers ─────────────────────────────────────────────────

const PFX = 'bbc_popup'

const hasBeenDismissed = (id: number, freq: string): boolean => {
  if (typeof window === 'undefined') return false
  try {
    if (freq === 'every_visit')      return false
    if (freq === 'once_per_session') return !!sessionStorage.getItem(`${PFX}_s_${id}`)
    if (freq === 'once_per_day') {
      const v = localStorage.getItem(`${PFX}_d_${id}`)
      return v === new Date().toDateString()
    }
    if (freq === 'show_once') return !!localStorage.getItem(`${PFX}_o_${id}`)
  } catch { }
  return false
}

const markDismissed = (id: number, freq: string): void => {
  if (typeof window === 'undefined') return
  try {
    if (freq === 'once_per_session') sessionStorage.setItem(`${PFX}_s_${id}`, '1')
    else if (freq === 'once_per_day') localStorage.setItem(`${PFX}_d_${id}`, new Date().toDateString())
    else if (freq === 'show_once')    localStorage.setItem(`${PFX}_o_${id}`, '1')
  } catch { }
}

// ── types ─────────────────────────────────────────────────────────────────────

interface PopupData {
  id: number
  title: string
  popup_type: string
  short_description: string | null
  desktop_image: string
  mobile_image: string | null
  link_enabled: number
  button_text: string | null
  button_url: string | null
  open_in_new_tab: number
  image_clickable: number
  display_delay_ms: number
  display_frequency: string
  target_devices: string
}

// ── badge styles ──────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  merchandise: 'Merchandise',
  event:       'Event',
  offer:       'Offer',
  general:     'Announcement',
}
const TYPE_COLOR: Record<string, string> = {
  merchandise: 'bg-amber-100 text-amber-800',
  event:       'bg-purple-100 text-purple-800',
  offer:       'bg-emerald-100 text-emerald-800',
  general:     'bg-sky-100 text-sky-800',
}

// ── component ─────────────────────────────────────────────────────────────────

export default function GlobalWebsitePopup() {
  const pathname  = usePathname()
  const [popup,   setPopup]   = useState<PopupData | null>(null)
  const [visible, setVisible] = useState(false)
  const [imgErr,  setImgErr]  = useState(false)

  const closeBtnRef      = useRef<HTMLButtonElement>(null)
  const prevFocusRef     = useRef<HTMLElement | null>(null)
  const timerRef         = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef         = useRef<AbortController | null>(null)

  // close handler (stable reference)
  const handleClose = useCallback(() => {
    if (popup) markDismissed(popup.id, popup.display_frequency)
    setVisible(false)
    setPopup(null)
    document.body.style.overflow    = ''
    document.body.style.paddingRight = ''
    if (prevFocusRef.current?.focus) prevFocusRef.current.focus()
  }, [popup])

  // Escape key
  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible, handleClose])

  // Focus trap — move focus to close button when opened
  useEffect(() => {
    if (visible) closeBtnRef.current?.focus()
  }, [visible])

  // Fetch on route change
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return

    abortRef.current?.abort()
    if (timerRef.current) clearTimeout(timerRef.current)
    setPopup(null)
    setVisible(false)
    setImgErr(false)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    const device  = typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'desktop' : 'mobile'
    const pageKey = getPageKey(pathname)

    const run = async () => {
      try {
        const res = await fetch(
          `${API_URL}/website-popups/active?page=${encodeURIComponent(pageKey)}&device=${device}`,
          { signal: ctrl.signal }
        )
        if (!res.ok) return
        const json = await res.json()
        if (!json?.success || !json.data) return

        const pd: PopupData = json.data
        if (hasBeenDismissed(pd.id, pd.display_frequency)) return

        timerRef.current = setTimeout(() => {
          const sbw = window.innerWidth - document.documentElement.clientWidth
          if (sbw > 0) document.body.style.paddingRight = `${sbw}px`
          prevFocusRef.current = document.activeElement as HTMLElement
          document.body.style.overflow = 'hidden'
          setPopup(pd)
          setVisible(true)
        }, pd.display_delay_ms || 0)
      } catch (err: any) {
        if (err?.name === 'AbortError') return
      }
    }

    run()

    return () => {
      ctrl.abort()
      if (timerRef.current) clearTimeout(timerRef.current)
      document.body.style.overflow    = ''
      document.body.style.paddingRight = ''
    }
  }, [pathname])

  if (!visible || !popup) return null

  const isMobileView  = typeof window !== 'undefined' && window.innerWidth < 768
  const rawImgSrc     = (isMobileView && popup.mobile_image) ? popup.mobile_image : popup.desktop_image
  const imgSrc        = normalizePopupImageUrl(rawImgSrc)
  const linkOn        = popup.link_enabled === 1
  const newTab        = popup.open_in_new_tab === 1
  const imgClickable  = linkOn && popup.image_clickable === 1
  const isInternal    = (popup.button_url ?? '').startsWith('/')

  const ImageBlock = (
    <div
      aria-hidden="true"
      style={{ width: '100%', aspectRatio: isMobileView ? '4/5' : '3/2', overflow: 'hidden' }}
      className="bg-[#F8FBF7] flex items-center justify-center"
    >
      {!imgErr && imgSrc ? (
        <img
          src={imgSrc}
          alt={popup.title}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[#9DB0A1] p-4 text-center">
          {popup.title}
        </div>
      )}
    </div>
  )

  const handleNavAndClose = () => handleClose()

  return (
    <>
      <style>{`
        @keyframes bbc-popup-fade{from{opacity:0}to{opacity:1}}
        @keyframes bbc-popup-rise{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @media(prefers-reduced-motion:reduce){
          .bbc-popup-overlay,.bbc-popup-card{animation:none!important}
        }
      `}</style>

      {/* Overlay */}
      <div
        className="bbc-popup-overlay fixed inset-0 z-[9998] bg-black/65 backdrop-blur-[3px]"
        style={{ animation: 'bbc-popup-fade 200ms ease forwards' }}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bbc-popup-title"
        aria-describedby={popup.short_description ? 'bbc-popup-desc' : undefined}
        className="bbc-popup-card fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ animation: 'bbc-popup-rise 220ms ease forwards' }}
      >
        <div
          className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          style={{ maxWidth: 'min(calc(100vw - 32px), 820px)' }}
        >
          {/* Close button */}
          <button
            ref={closeBtnRef}
            onClick={handleClose}
            aria-label="Close popup"
            className="absolute right-3 top-3 z-20 flex items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Scrollable body */}
          <div className="overflow-y-auto">

            {/* Image — with optional link wrapper */}
            {imgClickable && popup.button_url ? (
              newTab || !isInternal ? (
                <a
                  href={popup.button_url}
                  target={newTab ? '_blank' : undefined}
                  rel={newTab ? 'noopener noreferrer' : undefined}
                  className="block cursor-pointer"
                  onClick={handleNavAndClose}
                  aria-label={`Navigate to ${popup.button_url}`}
                >
                  {ImageBlock}
                </a>
              ) : (
                <Link href={popup.button_url} className="block cursor-pointer" onClick={handleNavAndClose}
                  aria-label={`Navigate to ${popup.button_url}`}>
                  {ImageBlock}
                </Link>
              )
            ) : (
              ImageBlock
            )}

            {/* Text content */}
            <div className="px-5 pb-6 pt-4">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${
                  TYPE_COLOR[popup.popup_type] ?? TYPE_COLOR.general
                }`}
              >
                {TYPE_LABEL[popup.popup_type] ?? popup.popup_type}
              </span>

              <h2
                id="bbc-popup-title"
                className="mt-2 font-heading text-xl font-black leading-tight text-[#1F2A24] lg:text-2xl"
              >
                {popup.title}
              </h2>

              {popup.short_description && (
                <p id="bbc-popup-desc" className="mt-2 text-sm leading-relaxed text-[#607064]">
                  {popup.short_description}
                </p>
              )}

              {linkOn && popup.button_text && popup.button_url && (
                <div className="mt-4">
                  {newTab || !isInternal ? (
                    <a
                      href={popup.button_url}
                      target={newTab ? '_blank' : undefined}
                      rel={newTab ? 'noopener noreferrer' : undefined}
                      onClick={handleNavAndClose}
                      className="inline-flex items-center gap-2 rounded-full bg-[#3D1F0D] px-6 py-3 text-sm font-black text-[#FFF7ED] transition hover:bg-[#2FBF9B] hover:text-[#120905] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2FBF9B]"
                    >
                      {popup.button_text}
                      {newTab && <ExternalLink className="h-3.5 w-3.5" />}
                    </a>
                  ) : (
                    <Link
                      href={popup.button_url}
                      onClick={handleNavAndClose}
                      className="inline-flex items-center gap-2 rounded-full bg-[#3D1F0D] px-6 py-3 text-sm font-black text-[#FFF7ED] transition hover:bg-[#2FBF9B] hover:text-[#120905] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2FBF9B]"
                    >
                      {popup.button_text}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
