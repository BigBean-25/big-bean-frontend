'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Calendar, ArrowRight, ArrowLeft, Tag } from 'lucide-react'
import styles from './OffersPreview.module.css'

interface Offer {
  id: number
  title: string
  description: string | null
  discount_text: string | null
  badge_text: string | null
  label_text: string | null
  offer_code: string | null
  start_date: string | null
  end_date: string | null
  image: string | null
  button_text: string
  button_url: string
  status: string
  sort_order: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

const FALLBACK_OFFERS: Offer[] = [
  {
    id: -1,
    title: 'Wednesday Coffee Offer',
    description: 'Buy one coffee and enjoy one more on us every Wednesday. A perfect reason to make Wednesdays your favourite café day.',
    discount_text: 'BUY 1 GET 1',
    badge_text: 'BEST DEAL',
    label_text: 'LIMITED TIME OFFER',
    offer_code: 'WEDBOGO',
    start_date: null,
    end_date: null,
    image: '/images/highlights/coffee.jpg',
    button_text: 'ORDER NOW',
    button_url: 'https://bigbeancafe.store',
    status: 'active',
    sort_order: 0,
  },
  {
    id: -2,
    title: 'Combo Treat',
    description: 'Pair your favourite coffee with a delicious café snack at a special price. Available all day, every day.',
    discount_text: 'COMBO DEAL',
    badge_text: 'SAVE NOW',
    label_text: 'SPECIAL OFFER',
    offer_code: null,
    start_date: null,
    end_date: null,
    image: '/images/highlights/food.jpg',
    button_text: 'Explore Menu',
    button_url: 'https://bigbeancafe.store',
    status: 'active',
    sort_order: 1,
  },
  {
    id: -3,
    title: 'Sweet Dessert Moment',
    description: 'Enjoy handcrafted desserts with your beverage and make your café break even better.',
    discount_text: 'SPECIAL OFFER',
    badge_text: 'NEW OFFER',
    label_text: 'CAFÉ SPECIAL',
    offer_code: null,
    start_date: null,
    end_date: null,
    image: '/images/highlights/dessert.jpg',
    button_text: 'View Offer',
    button_url: 'https://bigbeancafe.store',
    status: 'active',
    sort_order: 2,
  },
]

const BADGE_FALLBACKS = ['BEST\nDEAL', 'SAVE\nNOW', 'NEW\nOFFER']

function getImageUrl(image?: string | null): string | null {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

function formatDate(d: string | null): string | null {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ── Badge label split into two lines ── */
function BadgeLabel({ label }: { label: string }) {
  const parts = label.split('\n')
  return (
    <>
      {parts.map((p, i) => (
        <span key={i} style={{ display: 'block' }}>{p}</span>
      ))}
    </>
  )
}

/* ─────────── Single featured card ─────────── */
function FeaturedOfferCard({ offer, index }: { offer: Offer; index: number }) {
  const imgUrl = getImageUrl(offer.image)
  const badgeLabel = (offer.badge_text || BADGE_FALLBACKS[index % BADGE_FALLBACKS.length]).replace(' ', '\n')

  return (
    <div className={styles.card}>

      {/* ── LEFT: text panel ── */}
      <div className={styles.textPanel}>

        {/* small label with dot */}
        <div className={styles.offerLabel}>
          <span className={styles.offerLabelDot} />
          {offer.label_text || (offer.offer_code ? 'LIMITED TIME OFFER' : 'SPECIAL OFFER')}
        </div>

        {/* big discount text — NOT a pill */}
        {offer.discount_text && (
          <p className={styles.discountText}>{offer.discount_text}</p>
        )}

        {/* title */}
        <h3 className={`${styles.offerTitle} font-heading`}>{offer.title}</h3>

        {/* description */}
        {offer.description && (
          <p className={styles.offerDesc}>{offer.description}</p>
        )}

        {/* code chip — dashed */}
        {offer.offer_code && (
          <div className={styles.codeChip}>
            <Tag size={11} />
            Code:&nbsp;{offer.offer_code}
          </div>
        )}

        {/* validity */}
        {offer.end_date ? (
          <div className={styles.validity}>
            <Calendar size={13} />
            Valid until {formatDate(offer.end_date)}
          </div>
        ) : (
          <div className={styles.validity}>Limited time offer</div>
        )}

        {/* CTA */}
        <a
          href={offer.button_url || 'https://bigbeancafe.store'}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ctaBtn}
        >
          {offer.button_text || 'ORDER NOW'}
          <ArrowRight size={15} />
        </a>
      </div>

      {/* ── BEST DEAL badge — sits at left-edge of image ── */}
      <div className={styles.badge}>
        <BadgeLabel label={badgeLabel} />
      </div>

      {/* ── RIGHT: image — absolute, 190px left-radius curve ── */}
      <div className={styles.imageWrap}>
        {imgUrl ? (
          <img src={imgUrl} alt={offer.title} className={styles.offerImg} />
        ) : (
          <div className={styles.imgFallback}>
            <Tag size={52} color="#F5E6D3" opacity={0.18} />
          </div>
        )}
        <div className={styles.imageOverlay} />
      </div>
    </div>
  )
}

/* ─────────── Skeleton ─────────── */
function OfferSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonText}>
        <div className={styles.skeletonLine} style={{ height: '10px', width: '80px' }} />
        <div className={styles.skeletonLine} style={{ height: '36px', width: '180px' }} />
        <div className={styles.skeletonLine} style={{ height: '24px', width: '240px' }} />
        <div className={styles.skeletonLine} style={{ height: '14px', width: '320px' }} />
        <div className={styles.skeletonLine} style={{ height: '14px', width: '280px' }} />
        <div className={styles.skeletonLine} style={{ height: '44px', width: '148px', borderRadius: '999px', marginTop: '8px' }} />
      </div>
      <div className={styles.skeletonImage} />
    </div>
  )
}

/* ─────────── Main section ─────────── */
export default function OffersPreview() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [paused, setPaused] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [sectionVisible, setSectionVisible] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* fetch */
  useEffect(() => {
    fetch(`${API_URL}/offers/active`)
      .then(r => r.json())
      .then(d => {
        const live = ((d.data || []) as Offer[])
          .sort((a, b) => a.sort_order - b.sort_order || b.id - a.id)
          .slice(0, 8)
        setOffers(live.length > 0 ? live : FALLBACK_OFFERS)
      })
      .catch(() => setOffers(FALLBACK_OFFERS))
      .finally(() => setLoading(false))
  }, [])

  /* scroll reveal */
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setSectionVisible(true) },
      { threshold: 0.06 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /* navigation */
  const goTo = useCallback((idx: number) => {
    setCurrent(idx)
    setAnimKey(k => k + 1)
  }, [])

  const next = useCallback(() => goTo((current + 1) % offers.length), [current, offers.length, goTo])
  const prev = useCallback(() => goTo((current - 1 + offers.length) % offers.length), [current, offers.length, goTo])

  /* autoplay — only when 2+ offers */
  useEffect(() => {
    if (offers.length <= 1 || paused) return
    intervalRef.current = setInterval(next, 4500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [offers.length, paused, next])

  const stopAuto = () => { setPaused(true); if (intervalRef.current) clearInterval(intervalRef.current) }
  const startAuto = () => setPaused(false)

  const multiple = offers.length > 1

  return (
    <section
      ref={sectionRef}
      className={styles.section}
    >
      <div className="container-custom" style={{ paddingLeft: '4rem', paddingRight: '4rem' }}>

        {/* ── Heading ── */}
        <div className={`text-center mb-12 ${styles.sectionReveal} ${sectionVisible ? styles.visible : ''}`}>
          <p className={styles.eyebrow}>Special Offers</p>
          <h2 className={`${styles.heading} font-heading`}>Exclusive Big Bean Café Offers</h2>
          <p className={styles.subheading}>
            Discover exciting deals, limited‑time café offers, and delicious savings crafted for every coffee lover.
          </p>
        </div>

        {/* ── Skeleton ── */}
        {loading && <OfferSkeleton />}

        {/* ── Banner / Carousel ── */}
        {!loading && offers.length > 0 && (
          <div
            className={`${styles.sectionReveal} ${sectionVisible ? styles.visible : ''}`}
            style={{ transitionDelay: '0.12s' }}
          >
            <div
              className={styles.sliderWrap}
              onMouseEnter={stopAuto}
              onMouseLeave={startAuto}
            >
              {/* left arrow */}
              {multiple && (
                <button
                  className={`${styles.arrowBtn} ${styles.arrowLeft}`}
                  onClick={prev}
                  aria-label="Previous offer"
                >
                  <ArrowLeft size={18} />
                </button>
              )}

              {/* card — key forces remount = animation replay */}
              <FeaturedOfferCard
                key={animKey}
                offer={offers[current]}
                index={current}
              />

              {/* right arrow */}
              {multiple && (
                <button
                  className={`${styles.arrowBtn} ${styles.arrowRight}`}
                  onClick={next}
                  aria-label="Next offer"
                >
                  <ArrowRight size={18} />
                </button>
              )}
            </div>

            {/* dots */}
            {multiple && (
              <div className={styles.dotsRow}>
                {offers.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                    onClick={() => { stopAuto(); goTo(i) }}
                    aria-label={`Go to offer ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── View All CTA ── */}
        <div
          className={`text-center mt-12 ${styles.sectionReveal} ${sectionVisible ? styles.visible : ''}`}
          style={{ transitionDelay: '0.26s' }}
        >
          <a href="/offers" className={styles.viewAllBtn}>
            VIEW ALL OFFERS <ArrowRight size={15} />
          </a>
        </div>

      </div>
    </section>
  )
}
