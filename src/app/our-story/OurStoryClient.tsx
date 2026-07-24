'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { apiFetch } from '@/lib/api'
import { getImageUrl } from '@/lib/imageUrl'
import {
  Coffee,
  HeartHandshake,
  Utensils,
  BadgeCheck,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Sparkles,
  Leaf,
} from 'lucide-react'
import styles from './our-story.module.css'

interface PageHero {
  id?: number
  page_key?: string
  page_name?: string
  label?: string | null
  title?: string | null
  subtitle?: string | null
  hero_image?: string | null
  mobile_hero_image?: string | null
  primary_button_text?: string | null
  primary_button_url?: string | null
  secondary_button_text?: string | null
  secondary_button_url?: string | null
  overlay_opacity?: number | string | null
  status?: string
}

const DEFAULT_HERO: PageHero = {
  label: 'BIG BEAN CAFE',
  title: 'Our Story',
  subtitle: 'From one café dream to a growing coffee community across Bengaluru.',
  primary_button_text: 'Explore Our Menu',
  primary_button_url: '/menu',
  secondary_button_text: 'Visit Our Outlets',
  secondary_button_url: '/outlets',
  overlay_opacity: 0.45,
}

const TIMELINE = [
  {
    year: '2019',
    title: 'The Beginning',
    text: 'A dream to create a café that feels warm, premium, and welcoming.',
  },
  {
    year: '2020',
    title: 'Crafting Better Coffee',
    text: 'Focus on quality coffee, fresh ingredients, and a consistent café experience.',
  },
  {
    year: '2022',
    title: 'Growing Across Bengaluru',
    text: 'Expanding to multiple outlets while keeping the same taste and service standards.',
  },
  {
    year: 'Today',
    title: 'Building a Café Community',
    text: 'Creating a space for friends, families, professionals, and coffee lovers.',
  },
]

const STATS = [
  { value: 7, suffix: '+', label: 'Outlets' },
  { value: 50, suffix: 'K+', label: 'Happy Customers' },
  { value: 100, suffix: '%', label: 'Quality Focus' },
  { value: 1, suffix: '', label: 'Freshly Brewed Everyday' },
]

const VALUES = [
  { icon: Coffee, title: 'Quality First', text: 'Premium beans and fresh ingredients in every cup.' },
  { icon: HeartHandshake, title: 'Warm Hospitality', text: 'A welcoming space where every guest feels at home.' },
  { icon: Utensils, title: 'Fresh Food & Coffee', text: 'Handcrafted beverages and food made with care.' },
  { icon: BadgeCheck, title: 'Consistent Experience', text: 'The same great taste and service at every outlet.' },
]

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, end, duration])

  return { count, ref }
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.visible)
          obs.unobserve(entry.target)
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return ref
}

export default function OurStoryClient() {
  const [hero, setHero] = useState<PageHero>(DEFAULT_HERO)
  const [loading, setLoading] = useState(true)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateMobile = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768)
    updateMobile()
    window.addEventListener('resize', updateMobile)
    return () => window.removeEventListener('resize', updateMobile)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const data: any = await apiFetch('/page-heroes/our-story', { cache: 'no-store' })
        if (data.success && data.data) {
          setHero({ ...DEFAULT_HERO, ...data.data })
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const rawImage = isMobile && hero.mobile_hero_image ? hero.mobile_hero_image : hero.hero_image
  const heroImg = getImageUrl(rawImage, '/images/highlights/coffee.jpg')
  const overlay = Number(hero.overlay_opacity ?? 0.45)

  const heroRef = useReveal()
  const introRef = useReveal()
  const timelineRef = useReveal()
  const statsRef = useReveal()
  const valuesRef = useReveal()
  const ctaRef = useReveal()

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#FBF4EC' }}>
      <Header />

      <main>
        {/* HERO */}
        <section
          className={`relative flex items-center justify-center overflow-hidden ${styles.hero}`}
        >
          <div className={`absolute inset-0 ${styles.heroZoom}`}>
            <img
              src={heroImg}
              alt={hero.title || 'Our Story'}
              className="h-full w-full object-cover object-center"
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, rgba(18,9,5,${overlay + 0.25}) 0%, rgba(61,31,13,${overlay}) 50%, rgba(61,31,13,${overlay - 0.15}) 100%)`,
            }}
          />

          {/* decorative beans */}
          <div className={styles.beans}>
            <div className={styles.bean1} />
            <div className={styles.bean2} />
            <div className={styles.bean3} />
          </div>

          <div
            ref={heroRef as React.RefObject<HTMLDivElement>}
            className={`relative z-10 container-custom px-5 text-center lg:px-8 ${styles.fadeUp}`}
          >
            <span className="mb-4 inline-block rounded-full border border-[#C9943A]/40 bg-[#C9943A]/15 px-4 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#F6D58D]">
              {hero.label || DEFAULT_HERO.label}
            </span>
            <h1
              className="font-heading mx-auto mb-5 max-w-4xl text-[clamp(2.4rem,6vw,4.8rem)] font-black leading-[0.98] text-white"
            >
              {hero.title || DEFAULT_HERO.title}
            </h1>
            <p
              className="mx-auto mb-8 max-w-2xl text-[0.95rem] leading-relaxed md:text-[1.05rem]"
              style={{ color: '#F5D7BF' }}
            >
              {hero.subtitle || DEFAULT_HERO.subtitle}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={hero.primary_button_url || '/menu'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C9943A] px-7 py-3.5 text-xs font-black uppercase tracking-[0.08em] text-[#120905] shadow-[0_10px_28px_rgba(201,148,58,0.32)] transition-all hover:-translate-y-0.5 hover:bg-[#F6D58D] sm:w-auto"
              >
                {hero.primary_button_text || 'Explore Our Menu'} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={hero.secondary_button_url || '/outlets'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-xs font-black uppercase tracking-[0.08em] text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
              >
                {hero.secondary_button_text || 'Visit Our Outlets'} <MapPin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className="section-padding">
          <div
            ref={introRef as React.RefObject<HTMLDivElement>}
            className={`container-custom grid grid-cols-1 items-center gap-10 lg:grid-cols-2 ${styles.fadeUp}`}
          >
            <div>
              <p className="mb-3 text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#C9943A]">
                Who We Are
              </p>
              <h2 className="font-heading mb-5 text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-tight text-[#3D1F0D]">
                From a Passion for Coffee to a Café Experience
              </h2>
              <p className="mb-6 text-[0.95rem] leading-[1.8] text-[#6B3520]">
                Big Bean Café was built with a simple idea — to create a warm café space where people can enjoy quality coffee, fresh food, and meaningful moments. From our first outlet to becoming a loved café brand across Bengaluru, our journey has always been driven by passion, people, and consistency.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-[#E6C7A8] bg-white px-5 py-3 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9943A]/15">
                    <Sparkles className="h-5 w-5 text-[#C9943A]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#3D1F0D]">Premium Quality</p>
                    <p className="text-[11px] text-[#6B3520]">In every cup</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-[#E6C7A8] bg-white px-5 py-3 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9943A]/15">
                    <Leaf className="h-5 w-5 text-[#C9943A]" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#3D1F0D]">Fresh & Local</p>
                    <p className="text-[11px] text-[#6B3520]">Sourced responsibly</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[32px] border border-[#E6C7A8] bg-gradient-to-br from-[#FFF7ED] to-[#F6E6D1] p-8 shadow-[0_24px_70px_rgba(61,31,13,0.10)]">
                <ShoppingBag className="mb-4 h-10 w-10 text-[#C9943A]" />
                <p className="font-heading text-xl font-black leading-snug text-[#3D1F0D]">
                  “We don’t just serve coffee; we serve moments that bring people together.”
                </p>
                <p className="mt-4 text-sm font-bold text-[#8B4A2F]">— The Big Bean Team</p>
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[32px] bg-[#C9943A]/20" />
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="section-padding" style={{ background: '#FFF7ED' }}>
          <div className="container-custom px-5 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-3 text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#C9943A]">Journey</p>
              <h2 className="font-heading text-[clamp(1.8rem,4vw,2.8rem)] font-black text-[#3D1F0D]">Our Journey</h2>
            </div>

            <div
              ref={timelineRef as React.RefObject<HTMLDivElement>}
              className={`${styles.timeline} ${styles.fadeUp}`}
            >
              {TIMELINE.map((item, i) => (
                <div
                  key={item.title}
                  className={`${styles.timelineItem} ${i % 2 === 0 ? styles.left : styles.right}`}
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <div className={styles.timelineDot}>
                    <Coffee className="h-4 w-4 text-white" />
                  </div>
                  <span className="mb-2 inline-block rounded-full bg-[#C9943A] px-3 py-1 text-[0.6rem] font-black uppercase tracking-wider text-white">
                    {item.year}
                  </span>
                  <h3 className="font-heading mb-2 text-lg font-black text-[#3D1F0D]">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-[#6B3520]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="section-padding">
          <div
            ref={statsRef as React.RefObject<HTMLDivElement>}
            className={`container-custom ${styles.fadeUp}`}
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="section-padding" style={{ background: '#FFF7ED' }}>
          <div className="container-custom px-5 lg:px-8">
            <div className="mb-12 text-center">
              <p className="mb-3 text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#C9943A]">Principles</p>
              <h2 className="font-heading text-[clamp(1.8rem,4vw,2.8rem)] font-black text-[#3D1F0D]">What We Stand For</h2>
            </div>
            <div
              ref={valuesRef as React.RefObject<HTMLDivElement>}
              className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 ${styles.fadeUp}`}
            >
              {VALUES.map((v, i) => {
                const Icon = v.icon
                return (
                  <div
                    key={v.title}
                    className="group rounded-[28px] border border-[#E6C7A8] bg-white p-6 shadow-[0_14px_40px_rgba(61,31,13,0.08)] transition-all duration-300 hover:-translate-y-2 hover:border-[#C9943A] hover:shadow-[0_24px_60px_rgba(61,31,13,0.14)]"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C9943A]/15 transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6 text-[#C9943A]" />
                    </div>
                    <h3 className="font-heading mb-2 text-lg font-black text-[#3D1F0D]">{v.title}</h3>
                    <p className="text-sm leading-relaxed text-[#6B3520]">{v.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* EXPERIENCE CTA */}
        <section
          ref={ctaRef as React.RefObject<HTMLElement>}
          className={`relative overflow-hidden rounded-t-[40px] ${styles.experience} ${styles.fadeUp}`}
        >
          <div className={styles.shine} />
          <div className="container-custom relative z-10 px-5 py-20 text-center lg:px-8">
            <p className="mb-3 text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#F6D58D]">Visit Big Bean Café</p>
            <h2 className="font-heading mx-auto mb-5 max-w-3xl text-[clamp(1.8rem,4vw,2.8rem)] font-black text-white">
              Experience Big Bean Café Today
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-[0.95rem] leading-relaxed" style={{ color: '#F5D7BF' }}>
              Visit our cafés, explore our menu, or order your favourites online.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="https://bigbeancafe.store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C9943A] px-8 py-3.5 text-xs font-black uppercase tracking-[0.08em] text-[#120905] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#F6D58D] sm:w-auto"
              >
                Order Now <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/outlets"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-xs font-black uppercase tracking-[0.08em] text-white transition-all hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
              >
                Find Outlets <MapPin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value, 1800)
  const display = label === 'Freshly Brewed Everyday' ? 'Fresh' : count
  return (
    <div
      ref={ref}
      className="rounded-[28px] border border-[#E6C7A8] bg-white p-6 text-center shadow-[0_14px_40px_rgba(61,31,13,0.08)] transition-all duration-300 hover:-translate-y-1"
    >
      <div className="font-heading text-[2.6rem] font-black leading-none text-[#3D1F0D]">
        {display}
        {suffix}
      </div>
      <p className="mt-2 text-sm font-bold text-[#6B3520]">{label}</p>
    </div>
  )
}
