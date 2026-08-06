'use client'

import { Armchair, Coffee, UtensilsCrossed, CakeSlice, Laptop, GlassWater } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import styles from './Highlights.module.css'

// ── Marquee images ────────────────────────────────────────────────────────────
const marqueeImages = [
  { src: '/images/highlights/cozy-cafe.webp',         label: 'Cozy Café'             },
  { src: '/images/highlights/premium-coffee.webp',    label: 'Premium Coffee'        },
  { src: '/images/highlights/delicious-food.webp',    label: 'Delicious Food'        },
  { src: '/images/highlights/desserts.webp',          label: 'Irresistible Desserts' },
  { src: '/images/highlights/work-friendly.webp',     label: 'Work-Friendly Space'   },
  { src: '/images/highlights/signature-coolers.webp', label: 'Signature Coolers'     },
]

// ── Information cards ─────────────────────────────────────────────────────────
const highlights = [
  {
    icon: Armchair,
    title: 'Cozy Café',
    description: 'A warm and welcoming café ambience created for conversations, comfort, and memorable moments.',
    stat: 'Cozy',
    statLabel: 'Ambience',
    accent: '#8B5A3C',
  },
  {
    icon: Coffee,
    title: 'Premium Coffee',
    description: 'Freshly brewed coffee crafted using quality beans, rich aroma, and smooth café-style flavour.',
    stat: 'Fresh',
    statLabel: 'Daily',
    accent: '#C9943A',
  },
  {
    icon: UtensilsCrossed,
    title: 'Delicious Food',
    description: 'Enjoy flavourful meals, café favourites, satisfying bites, and dishes prepared for every mood.',
    stat: '100+',
    statLabel: 'Items',
    accent: '#6B3520',
  },
  {
    icon: CakeSlice,
    title: 'Irresistible Desserts',
    description: 'Indulge in cakes, pastries, desserts, and sweet creations that pair perfectly with your coffee.',
    stat: 'Sweet',
    statLabel: 'Moments',
    accent: '#B97855',
  },
  {
    icon: Laptop,
    title: 'Work-Friendly Space',
    description: 'A comfortable environment for work, meetings, studying, and productive coffee breaks.',
    stat: 'Work',
    statLabel: 'Comfortably',
    accent: '#7A5A40',
  },
  {
    icon: GlassWater,
    title: 'Signature Coolers',
    description: 'Refresh yourself with signature coolers, vibrant flavours, and chilled beverages crafted for every mood.',
    stat: 'Chilled',
    statLabel: 'Refreshment',
    accent: '#5DA9A6',
  },
]

// ── MarqueeImageCard ──────────────────────────────────────────────────────────
function MarqueeImageCard({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={styles.marqueeCard}>
      {!failed ? (
        <img
          src={src}
          alt={label}
          className={styles.marqueeImg}
          onError={() => setFailed(true)}
          draggable={false}
          loading="lazy"
        />
      ) : (
        <div className={styles.marqueeFallback} aria-hidden="true" />
      )}
      <span className={styles.marqueeLabel}>{label}</span>
    </div>
  )
}

// ── Highlights section ────────────────────────────────────────────────────────
export default function Highlights() {
  const [isPaused, setIsPaused] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.querySelectorAll('[data-hl-card]').forEach((card, i) => {
              setTimeout(() => card.classList.add(styles.visible), i * 130)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* ── Heading ── */}
      <div className={`container-custom ${styles.inner}`}>
        <div className="text-center mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: '#C9943A' }}>
            Our Promise
          </p>
          <h2 className="font-heading text-3xl font-bold md:text-4xl" style={{ color: '#3D1F0D' }}>
            Why Choose Big Bean Café
          </h2>
          <span className={styles.underline} aria-hidden="true" />
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed" style={{ color: '#8B5A3C' }}>
            Every visit, every cup, every bite — crafted to make your café moment special.
          </p>
        </div>
      </div>

      {/* ── Marquee image strip ── */}
      <div
        className={styles.marqueeViewport}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        aria-label="Café highlights image gallery"
        role="region"
      >
        <div className={`${styles.marqueeTrack}${isPaused ? ' ' + styles.paused : ''}`}>
          {/* Original group — visible to screen readers */}
          <div className={styles.marqueeGroup}>
            {marqueeImages.map((item, i) => (
              <MarqueeImageCard key={i} src={item.src} label={item.label} />
            ))}
          </div>
          {/* Duplicate group — hidden from screen readers */}
          <div className={styles.marqueeGroup} aria-hidden="true">
            {marqueeImages.map((item, i) => (
              <MarqueeImageCard key={i} src={item.src} label={item.label} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Information cards ── */}
      <div className={`container-custom ${styles.inner}`}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, index) => (
            <div key={index} className={styles.card} data-hl-card="">
              <div className={styles.iconWrap}>
                <item.icon className="w-8 h-8" style={{ color: item.accent }} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <div className="mb-3">
                <span className={styles.stat} style={{ color: item.accent }}>{item.stat}</span>
                <span className={styles.statLabel}>{item.statLabel}</span>
              </div>
              <h3 className="mb-2 text-lg font-bold font-heading" style={{ color: '#3D1F0D' }}>
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6B3520' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
