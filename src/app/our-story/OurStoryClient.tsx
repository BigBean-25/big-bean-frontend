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
    year: 'June 2024',
    outlet: 'RR Nagar',
    title: 'Where the Journey Began',
    text:
      'Big Bean Café opened its first outlet at RR Nagar, creating a warm neighbourhood café built around quality coffee, fresh food and welcoming hospitality.',
    startDate: '2024-06-01',
  },
  {
    year: 'April 2025',
    outlet: 'M5',
    title: 'A New Café Destination',
    text:
      'The M5 outlet opened in April 2025, bringing the Big Bean Café experience to a new and growing community.',
    startDate: '2025-04-01',
  },
  {
    year: 'April 2025',
    outlet: 'Koramangala',
    title: 'Entering the Heart of Bengaluru',
    text:
      "Koramangala became part of the Big Bean journey in April 2025, strengthening our presence in one of Bengaluru's most vibrant neighborhoods.",
    startDate: '2025-04-01',
  },
  {
    year: 'August 2025',
    outlet: 'HSR Layout',
    title: 'Growing with the Community',
    text:
      'The HSR Layout outlet opened in August 2025, offering a comfortable space for coffee, conversations, work meetings and everyday café moments.',
    startDate: '2025-08-01',
  },
  {
    year: 'October 2025',
    outlet: 'Jayanagar',
    title: 'Bringing Big Bean to South Bengaluru',
    text:
      'Jayanagar joined the Big Bean Café family in October 2025, continuing our commitment to consistent quality, service and café culture.',
    startDate: '2025-10-01',
  },
  {
    year: 'November 2025',
    outlet: 'Indiranagar',
    title: 'Expanding into a Café Landmark',
    text:
      "The Indiranagar outlet opened in November 2025, bringing premium coffee and handcrafted food to one of Bengaluru's most energetic destinations.",
    startDate: '2025-11-01',
  },
  {
    year: 'March 2026',
    outlet: 'Kammanahalli',
    title: 'Seven Outlets and Still Growing',
    text:
      "Kammanahalli opened in March 2026, marking another important milestone in Big Bean Café's growing Bengaluru journey.",
    startDate: '2026-03-01',
  },
]

const STATS = [
  { value: 7, suffix: '+', label: 'Outlets' },
  { value: 50, suffix: 'K+', label: 'Happy Customers' },
  { value: 100, suffix: '%', label: 'Quality Focus' },
  { value: 1, suffix: '', label: 'Freshly Brewed Everyday' },
]

const STORY_FAQS = [
  {
    question: 'When was Big Bean Cafe founded?',
    answer:
      'Big Bean Cafe began its journey with the RR Nagar outlet in June 2024 and has since grown across Bengaluru.',
  },
  {
    question: 'How many Big Bean Cafe outlets are there?',
    answer:
      'Big Bean Cafe has seven outlets across Bengaluru: RR Nagar, M5, Koramangala, HSR Layout, Jayanagar, Indiranagar and Kammanahalli.',
  },
  {
    question: 'What makes Big Bean Cafe different?',
    answer:
      'Big Bean Cafe focuses on premium, freshly sourced coffee and a warm, consistent café experience at every outlet.',
  },
  {
    question: 'Does Big Bean Cafe offer franchise opportunities?',
    answer:
      'Yes, Big Bean Cafe offers franchise opportunities. Visit the Franchise page for more details.',
  },
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
    <div className={styles.page}>
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
            className={`${styles.heroContent} ${styles.fadeUp}`}
          >
            <span className={styles.heroLabel}>
              {hero.label || DEFAULT_HERO.label}
            </span>
            <h1 className={styles.heroTitle}>
              {hero.title || DEFAULT_HERO.title}
            </h1>
            <p className={styles.heroSubtitle}>
              {hero.subtitle || DEFAULT_HERO.subtitle}
            </p>
            <div className={styles.heroActions}>
              <Link
                href={hero.primary_button_url || '/menu'}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C9943A] px-7 py-3.5 font-black uppercase tracking-[0.08em] text-[#120905] shadow-[0_10px_28px_rgba(201,148,58,0.32)] transition-all hover:-translate-y-0.5 hover:bg-[#F6D58D]"
              >
                {hero.primary_button_text || 'Explore Our Menu'} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={hero.secondary_button_url || '/outlets'}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-black uppercase tracking-[0.08em] text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                {hero.secondary_button_text || 'Visit Our Outlets'} <MapPin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* INTRO */}
        <section className={`${styles.section} ${styles.introSection}`}>
          <div
            ref={introRef as React.RefObject<HTMLDivElement>}
            className={`${styles.container} ${styles.introGrid} ${styles.fadeUp}`}
          >
            <div>
              <p className={styles.sectionEyebrow}>Who We Are</p>
              <h2 className={styles.sectionTitle}>
                From a Passion for Coffee to a Café Experience
              </h2>
              <p className={`${styles.bodyText} mb-6 mt-5`}>
                Big Bean Café was built with a simple idea — to create a warm café space where people can enjoy quality coffee, fresh food, and meaningful moments. From our first outlet to becoming a loved café brand across Bengaluru, our journey has always been driven by passion, people, and consistency.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-[#E6C7A8] bg-white px-5 py-3 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9943A]/15">
                    <Sparkles className="h-5 w-5 text-[#C9943A]" />
                  </div>
                  <div>
                    <p className="text-[0.8rem] font-black text-[#3D1F0D]">Premium Quality</p>
                    <p className={styles.supportingText}>In every cup</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-[#E6C7A8] bg-white px-5 py-3 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9943A]/15">
                    <Leaf className="h-5 w-5 text-[#C9943A]" />
                  </div>
                  <div>
                    <p className="text-[0.8rem] font-black text-[#3D1F0D]">Fresh &amp; Local</p>
                    <p className={styles.supportingText}>Sourced responsibly</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[32px] border border-[#E6C7A8] bg-gradient-to-br from-[#FFF7ED] to-[#F6E6D1] p-8 shadow-[0_24px_70px_rgba(61,31,13,0.10)]">
                <ShoppingBag className="mb-4 h-10 w-10 text-[#C9943A]" />
                <p className="font-heading text-[clamp(1.2rem,2.2vw,1.6rem)] font-black leading-snug text-[#3D1F0D]">
                  &ldquo;We don&apos;t just serve coffee; we serve moments that bring people together.&rdquo;
                </p>
                <p className="mt-4 text-[0.82rem] font-bold text-[#8B4A2F]">— The Big Bean Team</p>
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[32px] bg-[#C9943A]/20" />
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className={styles.section} style={{ background: '#FFF7ED' }}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionEyebrow}>Journey</p>
              <h2 className={styles.sectionTitle}>Our Journey</h2>
            </div>

            <div
              ref={timelineRef as React.RefObject<HTMLDivElement>}
              className={`${styles.timeline} ${styles.fadeUp}`}
            >
              {TIMELINE.map((item, i) => (
                <div
                  key={`${item.outlet}-${item.year}`}
                  className={`${styles.timelineItem} ${
                    i % 2 === 0 ? styles.left : styles.right
                  }`}
                  style={{ transitionDelay: `${i * 110}ms` }}
                >
                  <div className={styles.timelineDot}>
                    <Coffee className="h-4 w-4 text-white" />
                  </div>

                  <div className={styles.timelineDate}>
                    {item.year}
                  </div>

                  <div className={styles.timelineOutlet}>
                    <MapPin aria-hidden="true" />
                    <span>{item.outlet}</span>
                  </div>

                  <h3 className={styles.timelineTitle}>
                    {item.title}
                  </h3>

                  <p className={styles.timelineText}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className={styles.section}>
          <div
            ref={statsRef as React.RefObject<HTMLDivElement>}
            className={`${styles.container} ${styles.statsGrid} ${styles.fadeUp}`}
          >
            {STATS.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 80} />
            ))}
          </div>
        </section>

        {/* VALUES */}
        <section className={styles.section} style={{ background: '#FFF7ED' }}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionEyebrow}>Principles</p>
              <h2 className={styles.sectionTitle}>What We Stand For</h2>
            </div>
            <div
              ref={valuesRef as React.RefObject<HTMLDivElement>}
              className={`${styles.valuesGrid} ${styles.fadeUp}`}
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
                    <h3 className={`${styles.cardTitle} mb-2`}>{v.title}</h3>
                    <p className={styles.bodyText}>{v.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.section} style={{ background: '#FFF7ED' }}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionEyebrow}>FAQ</p>
              <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
              <p className={styles.sectionSubtitle}>
                Quick answers about Big Bean Café, our journey, outlets and franchise opportunities.
              </p>
            </div>
            <div className={styles.faqGrid}>
              {STORY_FAQS.map((faq, i) => (
                <div
                  key={faq.question}
                  className="rounded-[1.4rem] border border-[#E7CFAF] bg-white/85 p-6 shadow-[0_18px_45px_rgba(61,31,13,0.08)]"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <h3 className={`${styles.cardTitle} mb-3`}>
                    {faq.question}
                  </h3>
                  {faq.question.includes('franchise') ? (
                    <p className={styles.bodyText}>
                      Yes, Big Bean Cafe offers franchise opportunities. Visit the{' '}
                      <Link href="/franchise" className="font-bold text-[#C9943A] underline underline-offset-4">
                        Franchise page
                      </Link>{' '}
                      for more details.
                    </p>
                  ) : (
                    <p className={styles.bodyText}>{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EXPERIENCE CTA */}
        <section
          ref={ctaRef as React.RefObject<HTMLElement>}
          className={`relative overflow-hidden rounded-t-[40px] ${styles.experience} ${styles.fadeUp}`}
        >
          <div className={styles.shine} />
          <div className={styles.experienceContent}>
            <p className={`${styles.sectionEyebrow} mb-3 text-[#F6D58D]`}>Visit Big Bean Café</p>
            <h2 className={`${styles.sectionTitle} mx-auto mb-5 max-w-3xl text-white`}>
              Experience Big Bean Café Today
            </h2>
            <p className={`${styles.bodyText} mx-auto mb-8 max-w-xl`} style={{ color: '#F5D7BF' }}>
              Visit our cafés, explore our menu, or order your favourites online.
            </p>
            <div className={styles.heroActions}>
              <a
                href="https://bigbeancafe.store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C9943A] px-8 py-3.5 font-black uppercase tracking-[0.08em] text-[#120905] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#F6D58D]"
              >
                Order Now <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/outlets"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-3.5 font-black uppercase tracking-[0.08em] text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
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

function StatCard({ value, suffix, label, delay = 0 }: { value: number; suffix: string; label: string; delay?: number }) {
  const { count, ref } = useCountUp(value, 1800)
  const display = label === 'Freshly Brewed Everyday' ? 'Fresh' : count
  return (
    <div
      ref={ref}
      className="rounded-[28px] border border-[#E6C7A8] bg-white p-6 text-center shadow-[0_14px_40px_rgba(61,31,13,0.08)] transition-all duration-300 hover:-translate-y-1"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="font-heading font-black leading-none text-[#3D1F0D]" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
        {display}
        {suffix}
      </div>
      <p className="mt-2 font-bold text-[#6B3520]" style={{ fontSize: '0.82rem' }}>{label}</p>
    </div>
  )
}
