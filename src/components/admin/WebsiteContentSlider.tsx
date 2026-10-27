'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Home, BookOpen, User, Coffee, Tag, MapPin, CalendarDays, FileText,
  Image as ImageIcon, Briefcase, Phone, Calendar, Store, Building2,
  Globe, ScrollText, ChevronLeft, ChevronRight, ArrowUpRight
} from 'lucide-react'
import { canAccessRoute } from '@/lib/adminPermissions'

interface ContentLink {
  href: string
  label: string
  desc: string
  tag: 'Hero' | 'Page'
  icon: React.ComponentType<{ className?: string }>
  tint: string   // icon chip bg
  ink: string    // icon color
}

const WEBSITE_CONTENT: ContentLink[] = [
  { href: '/admin/home-banners',      label: 'Home Banners',       desc: 'Homepage hero slides',  tag: 'Hero', icon: Home,         tint: 'bg-[#FDF1DC]', ink: 'text-[#C9943A]' },
  { href: '/admin/about-hero',        label: 'About Hero',         desc: 'About page banner',     tag: 'Hero', icon: BookOpen,     tint: 'bg-[#E8F6F0]', ink: 'text-[#167E68]' },
  { href: '/admin/about-founders',    label: 'Founder Management', desc: 'Founder profiles',      tag: 'Page', icon: User,         tint: 'bg-[#F7E9E2]', ink: 'text-[#8B4A2F]' },
  { href: '/admin/menu-hero',         label: 'Menu Hero',          desc: 'Menu page banner',      tag: 'Hero', icon: Coffee,       tint: 'bg-[#FDF1DC]', ink: 'text-[#8B4A2F]' },
  { href: '/admin/offers-hero',       label: 'Offers Hero',        desc: 'Offers page banner',    tag: 'Hero', icon: Tag,          tint: 'bg-[#FBE9E7]', ink: 'text-[#B4552D]' },
  { href: '/admin/outlet-hero',       label: 'Outlet Hero',        desc: 'Outlets page banner',   tag: 'Hero', icon: MapPin,       tint: 'bg-[#E8F6F0]', ink: 'text-[#167E68]' },
  { href: '/admin/reservation-hero',  label: 'Reservation Hero',   desc: 'Booking page banner',   tag: 'Hero', icon: CalendarDays, tint: 'bg-[#EEF1FA]', ink: 'text-[#4A5FA5]' },
  { href: '/admin/blog-hero',         label: 'Blog Hero',          desc: 'Blog page banner',      tag: 'Hero', icon: FileText,     tint: 'bg-[#FDF1DC]', ink: 'text-[#C9943A]' },
  { href: '/admin/gallery-hero',      label: 'Gallery Hero',       desc: 'Gallery page banner',   tag: 'Hero', icon: ImageIcon,    tint: 'bg-[#F4ECF8]', ink: 'text-[#7A4E9E]' },
  { href: '/admin/career-hero',       label: 'Career Hero',        desc: 'Careers page banner',   tag: 'Hero', icon: Briefcase,    tint: 'bg-[#E8F1FB]', ink: 'text-[#3D7FBF]' },
  { href: '/admin/contact-hero',      label: 'Contact Hero',       desc: 'Contact page banner',   tag: 'Hero', icon: Phone,        tint: 'bg-[#E8F6F0]', ink: 'text-[#167E68]' },
  { href: '/admin/events-hero',       label: 'Events Hero',        desc: 'Events page banner',    tag: 'Hero', icon: Calendar,     tint: 'bg-[#FBE9E7]', ink: 'text-[#B4552D]' },
  { href: '/admin/franchise-hero',    label: 'Franchise Hero',     desc: 'Franchise page banner', tag: 'Hero', icon: Store,        tint: 'bg-[#FDF1DC]', ink: 'text-[#8B4A2F]' },
  { href: '/admin/corporate-hero',    label: 'Corporate Hero',     desc: 'Corporate page banner', tag: 'Hero', icon: Building2,    tint: 'bg-[#EEF1FA]', ink: 'text-[#4A5FA5]' },
  { href: '/admin/page-heroes',       label: 'Page Heroes',        desc: 'All hero sections',     tag: 'Page', icon: Globe,        tint: 'bg-[#F7E9E2]', ink: 'text-[#8B4A2F]' },
  { href: '/admin/legal-pages',       label: 'Legal Pages',        desc: 'Terms & policies',      tag: 'Page', icon: ScrollText,   tint: 'bg-[#E8F1FB]', ink: 'text-[#3D7FBF]' },
]

export default function WebsiteContentSlider() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<ContentLink[] | null>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  // Resolve permission-filtered items after mount (localStorage-backed checks)
  useEffect(() => {
    setItems(WEBSITE_CONTENT.filter(item => canAccessRoute(item.href)))
  }, [])

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft < max - 4)
  }, [])

  useEffect(() => {
    updateArrows()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [items, updateArrows])

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.75), behavior: 'smooth' })
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[#EAE2D6] bg-white shadow-[0_1px_2px_rgba(43,28,16,0.04),0_16px_40px_-16px_rgba(43,28,16,0.10)]">
      <style>{`.wc-track{scrollbar-width:none;-ms-overflow-style:none}.wc-track::-webkit-scrollbar{display:none}`}</style>

      {/* header */}
      <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-7">
        <div>
          <h2 className="font-heading text-lg font-black text-[#241A10]">Website Content</h2>
          <p className="mt-0.5 text-xs text-[#8A7B6C] sm:text-[13px]">
            Quick access to manage website pages, hero sections and content blocks
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            disabled={!canPrev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EAE2D6] bg-white text-[#6B5B49] transition hover:border-[#C9943A] hover:text-[#8B4A2F] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#EAE2D6] disabled:hover:text-[#6B5B49]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            disabled={!canNext}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EAE2D6] bg-white text-[#6B5B49] transition hover:border-[#C9943A] hover:text-[#8B4A2F] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#EAE2D6] disabled:hover:text-[#6B5B49]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* slider track */}
      <div
        ref={trackRef}
        className="wc-track mt-5 flex gap-3.5 overflow-x-auto scroll-smooth px-6 pb-6 sm:px-7"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {items === null ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-[118px] w-[200px] shrink-0 animate-pulse rounded-2xl bg-[#F4EFE8] sm:w-[216px]" />
          ))
        ) : items.length === 0 ? (
          <p className="py-6 text-sm text-[#A89888]">No website content tools available for your role.</p>
        ) : (
          items.map(({ href, label, desc, tag, icon: Icon, tint, ink }) => (
            <Link
              key={href}
              href={href}
              scroll={false}
              style={{ scrollSnapAlign: 'start' }}
              className="group flex w-[200px] shrink-0 flex-col justify-between rounded-2xl border border-[#EFE7DB] bg-[#FDFBF8] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E4D3B8] hover:bg-white hover:shadow-[0_14px_30px_-12px_rgba(90,60,30,0.25)] sm:w-[216px]"
            >
              <div className="flex items-start justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
                  <Icon className={`h-[18px] w-[18px] ${ink}`} />
                </span>
                <span className="rounded-full bg-[#F4EFE8] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#A89888] transition group-hover:bg-[#FDF1DC] group-hover:text-[#C9943A]">
                  {tag}
                </span>
              </div>
              <div className="mt-4">
                <p className="flex items-center gap-1 text-[13px] font-black leading-snug text-[#2B2117]">
                  {label}
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#C9943A] opacity-0 transition group-hover:opacity-100" />
                </p>
                <p className="mt-0.5 truncate text-[11px] text-[#A89888]">{desc}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}
