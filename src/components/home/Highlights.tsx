'use client'

import { Armchair, Coffee, UtensilsCrossed, CakeSlice, Laptop, GlassWater } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import styles from './Highlights.module.css'

const highlights = [
  {
    icon: Armchair,
    title: 'Cozy Café',
    description: 'A warm and welcoming café ambience created for conversations, comfort, and memorable moments.',
    stat: 'Cozy',
    statLabel: 'Ambience',
    accent: '#8B5A3C',
    image: '/images/highlights/cozy-cafe.webp',
    alt: 'Cozy café interior at Big Bean Café',
  },
  {
    icon: Coffee,
    title: 'Premium Coffee',
    description: 'Freshly brewed coffee crafted using quality beans, rich aroma, and smooth café-style flavour.',
    stat: 'Fresh',
    statLabel: 'Daily',
    accent: '#C9943A',
    image: '/images/highlights/premium-coffee.webp',
    alt: 'Premium coffee at Big Bean Café',
  },
  {
    icon: UtensilsCrossed,
    title: 'Delicious Food',
    description: 'Enjoy flavourful meals, café favourites, satisfying bites, and dishes prepared for every mood.',
    stat: '100+',
    statLabel: 'Items',
    accent: '#6B3520',
    image: '/images/highlights/delicious-food.webp',
    alt: 'Delicious food at Big Bean Café',
  },
  {
    icon: CakeSlice,
    title: 'Irresistible Desserts',
    description: 'Indulge in cakes, pastries, desserts, and sweet creations that pair perfectly with your coffee.',
    stat: 'Sweet',
    statLabel: 'Moments',
    accent: '#B97855',
    image: '/images/highlights/desserts.webp',
    alt: 'Desserts and pastries at Big Bean Café',
  },
  {
    icon: Laptop,
    title: 'Work-Friendly Space',
    description: 'A comfortable environment for work, meetings, studying, and productive coffee breaks.',
    stat: 'Work',
    statLabel: 'Comfortably',
    accent: '#7A5A40',
    image: '/images/highlights/work-friendly.webp',
    alt: 'Work-friendly space at Big Bean Café',
  },
  {
    icon: GlassWater,
    title: 'Signature Coolers',
    description: 'Refresh yourself with our signature coolers, vibrant flavours, and chilled beverages crafted for every mood.',
    stat: 'Chilled',
    statLabel: 'Refreshment',
    accent: '#5DA9A6',
    image: '/images/highlights/signature-coolers.webp',
    alt: 'Signature coolers at Big Bean Café',
  },
]

function CardBg({ src, accent }: { src: string; accent: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <>
      {!failed ? (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          onError={() => setFailed(true)}
          className={styles.cardBgImg}
          loading="lazy"
        />
      ) : (
        <div
          className={styles.cardFallback}
          style={{ background: `linear-gradient(145deg, #3D1F0D 0%, ${accent} 100%)` }}
          aria-hidden="true"
        />
      )}
      <div className={styles.cardOverlay} aria-hidden="true" />
    </>
  )
}

export default function Highlights() {
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
      <div className={`container-custom ${styles.inner}`}>
        {/* Heading */}
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

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, index) => (
            <div key={index} className={styles.card} data-hl-card="">
              <CardBg src={item.image} accent={item.accent} />
              <div className={styles.cardInner}>
                <div className={styles.iconWrap}>
                  <item.icon className="w-6 h-6" style={{ color: '#FFF7ED' }} strokeWidth={1.7} aria-hidden="true" />
                </div>
                <div className="mb-2">
                  <span className={styles.stat}>{item.stat}</span>
                  <span className={styles.statLabel}>{item.statLabel}</span>
                </div>
                <h3 className={`mb-2 text-xl font-bold font-heading ${styles.cardTitle}`}>
                  {item.title}
                </h3>
                <p className={`text-sm leading-relaxed ${styles.cardDesc}`}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
