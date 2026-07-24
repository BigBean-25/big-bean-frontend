'use client'

import { Coffee, Users, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import styles from './Highlights.module.css'

const highlights = [
  {
    icon: Coffee,
    title: 'Premium Coffee',
    description: 'Freshly brewed coffee crafted with care, rich aroma, and smooth café-style taste.',
    stat: 'Fresh',
    statLabel: 'Daily',
    accent: '#C9943A',
    image: '/images/highlights/coffee.jpg',
  },
  {
    icon: Users,
    title: 'Cozy Ambience',
    description: 'A warm café space made for work, conversations, friends, and relaxed coffee moments.',
    stat: '7+',
    statLabel: 'Outlets',
    accent: '#8B5A3C',
    image: '/images/highlights/outlet.jpg',
  },
  {
    icon: UtensilsCrossed,
    title: 'Delicious Food',
    description: 'Enjoy café bites, snacks, desserts, and beverages made to match every mood.',
    stat: '100+',
    statLabel: 'Items',
    accent: '#6B3520',
    image: '/images/highlights/food.jpg',
  },
  {
    icon: ShoppingBag,
    title: 'Order Online',
    description: 'Enjoy your Big Bean Café favourites through Zomato, Swiggy, and our online ordering platform.',
    stat: 'Online',
    statLabel: 'Orders',
    accent: '#3D1F0D',
    image: '/images/highlights/order.jpg',
  },
]

const marqueeImages = [
  { src: '/images/highlights/coffee.jpg',  label: 'Fresh Coffee'  },
  { src: '/images/highlights/outlet.jpg',  label: 'Cozy Outlet'   },
  { src: '/images/highlights/food.jpg',    label: 'Café Food'      },
  { src: '/images/highlights/dessert.jpg', label: 'Desserts'       },
  { src: '/images/highlights/order.jpg',   label: 'Order Online'   },
]

// Triple for seamless loop with no visible gap
const marqueeLoop = [...marqueeImages, ...marqueeImages, ...marqueeImages]

function MarqueeCard({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return <div className={styles.imgCardPlaceholder} aria-hidden="true" />
  }
  return (
    <div className={styles.imgCard}>
      <img
        src={src}
        alt={label}
        className={styles.imgCardImg}
        onError={() => setFailed(true)}
        draggable={false}
      />
      <span className={styles.imgLabel}>{label}</span>
    </div>
  )
}

function CardBg({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      onError={() => setFailed(true)}
      className={styles.cardBgImg}
    />
  )
}

export default function Highlights() {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <section
      className={styles.section}
      ref={(el) => {
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
      }}
    >
      <div className="container-custom">
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
      </div>

      {/* Marquee strip — pause on hover / touch */}
      <div
        className={styles.marqueeOuter}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        aria-hidden="true"
      >
        <div
          className={`${styles.marqueeTrack}${isPaused ? ' ' + styles.paused : ''}`}
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {marqueeLoop.map((item, i) => (
            <MarqueeCard key={i} src={item.src} label={item.label} />
          ))}
        </div>
      </div>

      <div className="container-custom">
        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, index) => (
            <div key={index} className={styles.card} data-hl-card="">
              <CardBg src={item.image} />
              <div className={styles.cardInner}>
                <div className={styles.iconWrap}>
                  <item.icon className="w-8 h-8" style={{ color: item.accent }} strokeWidth={1.7} />
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
