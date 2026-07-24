'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Smartphone, ShoppingBag, Clock, Package } from 'lucide-react'
import styles from './OrderingInfo.module.css'

const ORDER_URL = 'https://bigbeancafe.store'

const OPTIONS = [
  {
    icon: Smartphone,
    step: '01',
    title: 'Dine-in QR Ordering',
    description: 'Scan the QR code at your table, browse the menu, and place your order directly from your phone.',
    action: 'Available at selected outlets',
  },
  {
    icon: ShoppingBag,
    step: '02',
    title: 'Takeaway Pickup',
    description: 'Order ahead and pick up your coffee, food, and desserts without waiting in queue.',
    action: 'Quick pickup available',
  },
  {
    icon: Clock,
    step: '03',
    title: 'Home Delivery',
    description: 'Enjoy fresh Big Bean Café favourites delivered through our online ordering platform.',
    action: 'Fast and convenient',
  },
  {
    icon: Package,
    step: '04',
    title: 'Corporate & Bulk Orders',
    description: 'Perfect for office meetings, team treats, events, and large group orders.',
    action: 'For bulk orders',
  },
]

export default function OrderingInfo() {
  const sectionRef  = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className="container-custom">
        <div className={styles.layout}>

          {/* ── Left: content ── */}
          <div className={`${styles.contentPanel}${visible ? ' ' + styles.visible : ''}`}>
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: '#C9943A' }}>
              Order Online
            </p>
            <h2 className="font-heading text-3xl font-bold md:text-4xl leading-tight max-w-[560px]" style={{ color: '#3D1F0D' }}>
               Order Coffee Online<br />Favourites Your Way
            </h2>
            <div className={styles.headingLine} />
            <p className="leading-[1.75] mb-8 max-w-[620px]" style={{ fontSize: 17, color: '#6B3520' }}>
              Dine in, pick up, or get your favourites delivered — Big Bean Café makes every coffee moment easier.
            </p>

            {/* Option cards */}
            <div className={styles.optionsList}>
              {OPTIONS.map((opt, i) => (
                <div
                  key={i}
                  className={`${styles.optionCard}${visible ? ' ' + styles.visible : ''}`}
                  style={{ transitionDelay: visible ? `${0.25 + i * 0.1}s` : '0s' }}
                >
                  <span className={styles.stepNum}>{opt.step}</span>
                  <div className={styles.iconCircle}>
                    <opt.icon style={{ width: 22, height: 22, color: '#6B3520' }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className={styles.optionTitle}>{opt.title}</p>
                    <p className={styles.optionDesc}>{opt.description}</p>
                    <span className={styles.optionAction}>{opt.action}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className={styles.ctas}>
              <a href={ORDER_URL} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
                Start Ordering
              </a>
              <Link href="/menu" className={styles.btnOutline}>
                View Menu
              </Link>
            </div>
          </div>

          {/* ── Right: image ── */}
          <div className={`${styles.imgPanel}${visible ? ' ' + styles.visible : ''}`}>
            <img src="/images/highlights/order.jpg" alt="Order from Big Bean Café" />
            <div className={styles.imgOverlay} aria-hidden="true" />
            <div className={styles.imgBadge}>
              <span className={styles.imgBadgeTitle}>Order Online</span>
              <span className={styles.imgBadgeSub}>Zomato · Swiggy · Big Bean Store</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
