'use client'

import React, { useEffect, useState, useRef } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import Link from 'next/link'
import { Calendar, ArrowRight, Tag, Search, Coffee, Smartphone, UtensilsCrossed, Star, Gift, ChevronLeft, ChevronRight, MapPin, ExternalLink, Zap } from 'lucide-react'
import s from './OffersClient.module.css'

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

interface OffersHero {
  id: number
  eyebrow: string
  title: string
  highlight_text: string | null
  subtitle: string | null
  button_primary_text: string
  button_primary_url: string
  button_secondary_text: string
  button_secondary_url: string
  image: string | null
  stat_1_value: string
  stat_1_label: string
  stat_2_value: string
  stat_2_label: string
  stat_3_value: string
  stat_3_label: string
}

interface MenuCombo {
  id: number
  title: string
  subtitle: string | null
  badge_text: string | null
  items_text: string | null
  price: number | null
  mrp: number | null
  image: string | null
  button_text: string
  button_url: string | null
  status: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

const FALLBACK_OFFERS: Offer[] = [
  {
    id: -1,
    title: 'Wednesday Coffee BOGO',
    description: 'Buy one coffee and get one coffee free every Wednesday. The perfect reason to share a great cup with someone special.',
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
    sort_order: 0
  },
  {
    id: -2,
    title: 'Combo Treat',
    description: 'Pair your favourite coffee with a delicious café snack at a special price. Available all day, every day at all our outlets.',
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
    sort_order: 1
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
    sort_order: 2
  }
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

/* ── Same premium card as homepage ── */
function OfferCard({ offer, index }: { offer: Offer; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const imgUrl = getImageUrl(offer.image)
  const badgeLabel = (offer.badge_text || BADGE_FALLBACKS[index % BADGE_FALLBACKS.length]).replace(' ', '\n')
  const badgeParts = badgeLabel.split('\n')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.06 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  /* shared card styles */
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    minHeight: '300px',
    borderRadius: '26px',
    background: 'linear-gradient(90deg, #FFF7ED 0%, #FFF2E3 46%, #F8EBDD 100%)',
    border: '1px solid rgba(201,148,58,0.28)',
    boxShadow: '0 24px 70px rgba(61,31,13,0.12)',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.55s ease ${index * 0.1}s, transform 0.55s ease ${index * 0.1}s, box-shadow 0.3s ease`,
    cursor: 'default',
  }

  return (
    <div
      ref={ref}
      style={cardStyle}
      onMouseOver={e => (e.currentTarget.style.boxShadow = '0 32px 90px rgba(61,31,13,0.18)')}
      onMouseOut={e => (e.currentTarget.style.boxShadow = '0 24px 70px rgba(61,31,13,0.12)')}
    >
      {/* LEFT: text panel */}
      <div style={{
        position: 'relative', zIndex: 3, width: '50%',
        padding: '2.6rem 2rem 2.6rem 2.8rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        minHeight: 'inherit',
      }}>
        {/* dot label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.45rem',
          fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.22em', color: '#8B5A3C', marginBottom: '0.6rem',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9943A', flexShrink: 0 }} />
          {offer.label_text || (offer.offer_code ? 'LIMITED TIME OFFER' : 'SPECIAL OFFER')}
        </div>

        {/* big discount text */}
        {offer.discount_text && (
          <p style={{
            fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 900,
            color: '#A92517', textTransform: 'uppercase', letterSpacing: '0.03em',
            lineHeight: 1.1, marginBottom: '0.5rem',
          }}>
            {offer.discount_text}
          </p>
        )}

        {/* title */}
        <h3 className="font-heading" style={{
          fontSize: 'clamp(1.2rem, 2.2vw, 1.65rem)', fontWeight: 800,
          color: '#3D1F0D', lineHeight: 1.25, marginBottom: '0.65rem',
        }}>
          {offer.title}
        </h3>

        {/* description */}
        {offer.description && (
          <p style={{
            fontSize: '0.9rem', color: '#6B3520', lineHeight: 1.65,
            marginBottom: '0.9rem', maxWidth: '420px',
          }}>
            {offer.description}
          </p>
        )}

        {/* code chip — dashed */}
        {offer.offer_code && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(255,255,255,0.60)',
            border: '1px dashed rgba(169,37,23,0.38)',
            borderRadius: '10px', padding: '0.45rem 1rem',
            color: '#A92517', fontSize: '0.75rem', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: '0.9rem', width: 'fit-content',
          }}>
            <Tag size={11} />
            Code:&nbsp;{offer.offer_code}
          </div>
        )}

        {/* validity */}
        {offer.end_date ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.38rem', fontSize: '0.78rem', color: '#9B7355', marginBottom: '1.4rem' }}>
            <Calendar size={13} />
            Valid until {formatDate(offer.end_date)}
          </div>
        ) : (
          <p style={{ fontSize: '0.78rem', color: '#9B7355', marginBottom: '1.4rem' }}>Limited time offer</p>
        )}

        {/* CTA */}
        <a
          href={offer.button_url || 'https://bigbeancafe.store'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#A92517', color: '#FFF7ED',
            fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.1em', padding: '0.85rem 1.85rem',
            borderRadius: '999px', textDecoration: 'none',
            boxShadow: '0 12px 28px rgba(139,46,27,0.28)',
            transition: 'background 0.2s ease, transform 0.18s ease',
            width: 'fit-content', marginTop: 'auto',
          }}
          onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#8B2E1B' }}
          onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#A92517' }}
        >
          {offer.button_text || 'ORDER NOW'}
          <ArrowRight size={14} />
        </a>
      </div>

      {/* BEST DEAL badge — at left edge of image */}
      <div style={{
        position: 'absolute', top: '28px', left: 'calc(50% - 20px)',
        zIndex: 10, width: '88px', height: '88px', borderRadius: '50%',
        background: '#C93024', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', fontSize: '0.6rem', fontWeight: 900,
        textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.3,
        boxShadow: '0 12px 30px rgba(139,46,27,0.30), 0 0 0 4px rgba(201,148,58,0.20)',
        pointerEvents: 'none',
      }}>
        {badgeParts.map((p, i) => <span key={i} style={{ display: 'block' }}>{p}</span>)}
      </div>

      {/* RIGHT: image — absolute, 190px left-radius curve */}
      <div style={{
        position: 'absolute', right: 0, top: 0,
        width: '58%', height: '100%',
        borderRadius: '0 26px 26px 0',
        borderTopLeftRadius: '190px',
        borderBottomLeftRadius: '190px',
        overflow: 'hidden', zIndex: 1,
      }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={offer.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3D1F0D,#8B5A3C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={52} color="#F5E6D3" opacity={0.18} />
          </div>
        )}
        {/* edge overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(255,247,237,0.22),rgba(255,247,237,0.02))', zIndex: 2, pointerEvents: 'none' }} />
      </div>
    </div>
  )
}

/* ── Skeleton ── */
function PageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ display: 'flex', borderRadius: '26px', overflow: 'hidden', border: '1px solid #E8CFA8', minHeight: '300px', background: '#FDF6EC' }}>
          <div style={{ flex: 1, padding: '2.8rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[80, 180, 240, 200, 148].map((w, j) => (
              <div key={j} style={{ height: j === 1 ? '34px' : '14px', width: `${w}px`, borderRadius: '999px', background: '#E8CFA8' }} />
            ))}
          </div>
          <div style={{ width: '58%', background: '#E2C49A' }} />
        </div>
      ))}
    </div>
  )
}

const OFFER_CATEGORIES = [
  { icon: Coffee, label: 'Coffee Deals', desc: 'Fresh brews and signature beverages' },
  { icon: UtensilsCrossed, label: 'Combo Meals', desc: 'Coffee + food + dessert specials' },
  { icon: Smartphone, label: 'App Exclusive', desc: 'Rewards, Big Coins and app-only offers' },
  { icon: MapPin, label: 'Dine-in Specials', desc: 'Visit your nearby outlet and enjoy café deals' },
  { icon: Star, label: 'Events & Workshops', desc: 'Special offers during selected events' },
]

const WEEKLY_SPECIALS = [
  { day: 'Monday', title: 'Fresh Start Coffee Deal', desc: 'Start your week right with 20% off on all coffees every Monday morning.', badge: 'MON', color: '#C9943A' },
  { day: 'Wednesday', title: 'BOGO Coffee', desc: 'Buy one coffee, get one free every Wednesday. Share with a friend!', badge: 'WED', color: '#A92517' },
  { day: 'Weekend', title: 'Combo Treats', desc: 'Saturday & Sunday combo meals at special café prices. All day long.', badge: 'WKD', color: '#3D1F0D' },
]

function ComboCard({ combo, single }: { combo: MenuCombo; single: boolean }) {
  const imgUrl = getImageUrl(combo.image)
  const savePct = combo.mrp && combo.price && combo.mrp > combo.price
    ? Math.round(((combo.mrp - combo.price) / combo.mrp) * 100)
    : null

  return (
    <div style={{
      minWidth: single ? '100%' : 360,
      maxWidth: single ? '100%' : 420,
      flex: single ? '1 1 auto' : '0 0 auto',
      borderRadius: 28,
      background: 'linear-gradient(135deg,#1A0D07 0%,#3D1F0D 60%,#5C2E12 100%)',
      border: '1px solid rgba(201,148,58,0.25)',
      boxShadow: '0 12px 40px rgba(18,9,5,0.28)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: single ? 'row' : 'column',
      scrollSnapAlign: 'start',
      transition: 'transform 0.25s, box-shadow 0.25s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 24px 60px rgba(18,9,5,0.38)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(18,9,5,0.28)' }}>

      {/* Image */}
      <div style={{ position: 'relative', height: single ? '100%' : 200, minHeight: single ? 200 : 200, width: single ? 300 : '100%', flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg,#3D1F0D,#6B3520)' }}>
        {imgUrl ? (
          <img src={imgUrl} alt={combo.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92, filter: 'brightness(1.08) contrast(1.04)', transition: 'transform 0.5s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UtensilsCrossed style={{ width: 48, height: 48, color: 'rgba(201,148,58,0.3)' }} />
          </div>
        )}
        {/* Badge */}
        {combo.badge_text && (
          <div style={{ position: 'absolute', top: 14, left: 14, background: '#A92517', color: '#fff', borderRadius: 20, padding: '0.22rem 0.75rem', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 4px 12px rgba(169,37,23,0.4)' }}>
            {combo.badge_text}
          </div>
        )}
        {savePct && (
          <div style={{ position: 'absolute', top: 14, right: 14, background: '#C9943A', color: '#120905', borderRadius: 20, padding: '0.22rem 0.75rem', fontSize: '0.65rem', fontWeight: 900 }}>
            Save {savePct}%
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.4rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FFF7ED', lineHeight: 1.2 }}>{combo.title}</h3>
        {combo.subtitle && <p style={{ fontSize: '0.82rem', color: '#C7A489', lineHeight: 1.6 }}>{combo.subtitle}</p>}
        {combo.items_text && (
          <p style={{ fontSize: '0.75rem', color: 'rgba(199,164,137,0.7)', lineHeight: 1.5, marginTop: 2 }}>{combo.items_text}</p>
        )}

        {/* Price row */}
        {(combo.price !== null || combo.mrp !== null) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
            {combo.price !== null && (
              <span className="font-heading" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F6D58D' }}>₹{combo.price}</span>
            )}
            {combo.mrp !== null && combo.mrp !== combo.price && (
              <span style={{ fontSize: '0.85rem', color: 'rgba(199,164,137,0.55)', textDecoration: 'line-through' }}>₹{combo.mrp}</span>
            )}
          </div>
        )}

        <a href={combo.button_url || 'https://bigbeancafe.store'} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#C9943A', color: '#120905', borderRadius: 100, padding: '0.7rem 1.4rem', fontSize: '0.76rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 'auto', width: 'fit-content', transition: 'all 0.18s', boxShadow: '0 6px 20px rgba(201,148,58,0.3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F6D58D' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C9943A' }}>
          {combo.button_text || 'Order Combo'} <ArrowRight style={{ width: 13, height: 13 }} />
        </a>
      </div>
    </div>
  )
}

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [hero, setHero] = useState<OffersHero | null>(null)
  const [combos, setCombos] = useState<MenuCombo[]>([])
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${API_URL}/offers-hero/active`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setHero(d.data) })
      .catch(() => {})

    fetch(`${API_URL}/menu-combos/active`)
      .then(r => r.json())
      .then(d => { setCombos((d.data || []).filter((c: MenuCombo) => c.status === 'active')) })
      .catch(() => {})

    fetch(`${API_URL}/offers/active`)
      .then(r => r.json())
      .then(d => {
        const live = ((d.data || []) as Offer[]).sort((a, b) => a.sort_order - b.sort_order || b.id - a.id)
        setOffers(live.length > 0 ? live : FALLBACK_OFFERS)
      })
      .catch(() => setOffers(FALLBACK_OFFERS))
      .finally(() => setLoading(false))
  }, [])

  const filtered = offers.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    (o.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const heroImg = getImageUrl(hero?.image)

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return
    carouselRef.current.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ background: '#FBF4EC' }}>
      <Header />
      <main>

        {/* ── HERO ── */}
        <section className="relative flex items-center overflow-hidden min-h-auto md:min-h-[460px] lg:min-h-[500px] xl:min-h-[540px]" style={{ padding: '5rem 0 3.5rem' }}>
          {/* Fallback / base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#120905] via-[#2A120B] to-[#5C2E12]" />

          {/* Background image */}
          {heroImg && (
            <img
              src={heroImg}
              alt={hero?.title || 'Offers'}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.9, filter: 'brightness(1.05) contrast(1.08) saturate(1.08)' }}
            />
          )}

          {/* Dark overlay for readability */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg,
                  rgba(18,9,5,0.86) 0%,
                  rgba(18,9,5,0.72) 34%,
                  rgba(18,9,5,0.42) 62%,
                  rgba(18,9,5,0.22) 100%
                ),
                linear-gradient(180deg,
                  rgba(18,9,5,0.20) 0%,
                  rgba(18,9,5,0.32) 55%,
                  rgba(18,9,5,0.58) 100%
                )
              `
            }}
          />

          {/* Gold glows */}
          <div className="absolute right-0 top-0 w-[420px] h-[420px] md:w-[680px] md:h-[680px] rounded-full bg-[#C9943A]/15 blur-3xl" />
          <div className="absolute left-0 bottom-0 w-[300px] h-[300px] md:w-[520px] md:h-[520px] rounded-full bg-[#8B4A2F]/20 blur-3xl" />

          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #C9943A 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />

          {/* Content */}
          <div className="relative z-10 w-full max-w-[1280px] mx-auto px-8" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
            <div style={{ maxWidth: 620 }}>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C9943A]/35 bg-[#C9943A]/12 px-4 py-1.5 mb-6">
                <Tag style={{ width: 13, height: 13, color: '#C9943A' }} />
                <span className="text-[0.6rem] font-black tracking-[0.22em] uppercase" style={{ color: '#F7D891' }}>
                  {hero?.eyebrow || 'Big Bean Café Offers'}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading font-black text-white mb-4" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 4.2rem)', lineHeight: 0.98 }}>
                {hero?.title || 'Fresh Deals,'}
                {(hero?.highlight_text || !hero) && (
                  <span className="block bg-gradient-to-r from-[#F6D58D] to-[#C9943A] bg-clip-text text-transparent">
                    {hero?.highlight_text || 'Bigger Savings.'}
                  </span>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-[0.95rem] leading-relaxed mb-6" style={{ color: '#F5D7BF', maxWidth: 620, lineHeight: 1.7 }}>
                {hero?.subtitle || 'Discover Big Bean Café combos, app-exclusive rewards, dine-in offers and special café deals made for every coffee moment.'}
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 mb-7">
                <a
                  href={hero?.button_primary_url || '#active-offers'}
                  className="inline-flex items-center gap-2 rounded-full font-black uppercase tracking-[0.08em] text-[0.8rem] no-underline transition-all"
                  style={{ background: '#C9943A', color: '#120905', padding: '0.75rem 1.5rem', boxShadow: '0 10px 28px rgba(201,148,58,0.32)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F6D58D'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C9943A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                >
                  <Tag style={{ width: 14, height: 14 }} />
                  {hero?.button_primary_text || 'View Offers'}
                </a>
                <a
                  href={hero?.button_secondary_url || 'https://bigbeancafe.store'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full font-black uppercase tracking-[0.08em] text-[0.8rem] no-underline transition-all border border-white/25 text-white"
                  style={{ padding: '0.75rem 1.5rem' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                >
                  {hero?.button_secondary_text || 'Order Online'} <ExternalLink style={{ width: 13, height: 13 }} />
                </a>
              </div>

              {/* Stats */}
              <div className="inline-flex rounded-[22px] border border-white/18 backdrop-blur-md overflow-hidden mt-2" style={{ background: 'rgba(255,255,255,0.10)' }}>
                {[
                  { val: hero?.stat_1_value || 'Fresh', lbl: hero?.stat_1_label || 'Daily Deals' },
                  { val: hero?.stat_2_value || 'Big Coins', lbl: hero?.stat_2_label || 'Rewards' },
                  { val: hero?.stat_3_value || 'Combo', lbl: hero?.stat_3_label || 'Savings' },
                ].map((s, i) => (
                  <div key={i} className="text-center px-4 py-2.5" style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
                    <div className="font-heading text-[1.05rem] font-black leading-tight" style={{ color: '#F6D58D' }}>{s.val}</div>
                    <div className="text-[0.58rem] font-bold uppercase tracking-[0.1em] mt-0.5" style={{ color: '#C7A489' }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating offer card — desktop only */}
            <div className="hidden lg:block absolute right-[5%] bottom-[7%] max-w-[310px]" style={{ background: 'rgba(18,9,5,0.64)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 22, padding: '1.1rem', boxShadow: '0 24px 70px rgba(18,9,5,0.35)' }}>
              <div className="flex items-start gap-2.5 mb-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,148,58,0.18)', border: '1px solid rgba(201,148,58,0.35)' }}>
                  <Tag style={{ width: 16, height: 16, color: '#C9943A' }} />
                </div>
                <div>
                  <div className="font-black text-[0.85rem]" style={{ color: '#F6D58D' }}>Save More with Big Bean Café</div>
                  <div className="text-[0.72rem] mt-0.5" style={{ color: 'rgba(199,164,137,0.85)' }}>Combos • Rewards • App Offers</div>
                </div>
              </div>
              <p className="text-[0.75rem] leading-relaxed" style={{ color: 'rgba(245,215,191,0.75)' }}>
                Fresh deals for every coffee moment. Explore our daily combos, app rewards, and exclusive café offers.
              </p>
            </div>
          </div>
        </section>

        {/* ── COMBO OFFERS ── */}
        {combos.length > 0 && (
          <section id="active-offers" style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 2rem 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.22em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Combo Deals</p>
              <h2 className="font-heading" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.1, marginBottom: '0.8rem' }}>Combo Offers You&apos;ll Love</h2>
              <p style={{ fontSize: '0.95rem', color: '#6B3520', maxWidth: 500, margin: '0 auto', lineHeight: 1.75 }}>
                Enjoy curated Big Bean Café combos with coffee, food and desserts at special prices.
              </p>
            </div>

            {combos.length === 1 ? (
              <ComboCard combo={combos[0]} single={true} />
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Arrow buttons */}
                <button onClick={() => scrollCarousel('left')}
                  style={{ position: 'absolute', left: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 44, height: 44, borderRadius: '50%', background: '#FFF7ED', border: '1.5px solid #E6C7A8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(61,31,13,0.14)', transition: 'all 0.18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#3D1F0D'; (e.currentTarget as HTMLElement).style.borderColor = '#3D1F0D' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFF7ED'; (e.currentTarget as HTMLElement).style.borderColor = '#E6C7A8' }}>
                  <ChevronLeft style={{ width: 18, height: 18, color: '#3D1F0D' }} />
                </button>
                <button onClick={() => scrollCarousel('right')}
                  style={{ position: 'absolute', right: -18, top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: 44, height: 44, borderRadius: '50%', background: '#FFF7ED', border: '1.5px solid #E6C7A8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(61,31,13,0.14)', transition: 'all 0.18s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#3D1F0D'; (e.currentTarget as HTMLElement).style.borderColor = '#3D1F0D' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFF7ED'; (e.currentTarget as HTMLElement).style.borderColor = '#E6C7A8' }}>
                  <ChevronRight style={{ width: 18, height: 18, color: '#3D1F0D' }} />
                </button>
                <div ref={carouselRef} style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none', paddingBottom: '0.5rem', paddingTop: '0.25rem' }}>
                  {combos.map(c => <ComboCard key={c.id} combo={c} single={false} />)}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── OFFER CATEGORIES STRIP ── */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 2rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.22em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Browse By Type</p>
            <h2 className="font-heading" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.1 }}>Choose Your Offer Mood</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1.25rem' }}>
            {OFFER_CATEGORIES.map((cat, i) => {
              const Icon = cat.icon
              return (
                <div key={i} style={{ borderRadius: 22, background: '#FFF7ED', border: '1px solid #E6C7A8', padding: '1.6rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', transition: 'all 0.22s', cursor: 'pointer', boxShadow: '0 2px 12px rgba(61,31,13,0.05)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 36px rgba(61,31,13,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = '#C9943A' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(61,31,13,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = '#E6C7A8' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,rgba(201,148,58,0.18),rgba(139,74,47,0.12))', border: '1px solid rgba(201,148,58,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: 22, height: 22, color: '#C9943A' }} />
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#3D1F0D' }}>{cat.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6B3520', lineHeight: 1.55 }}>{cat.desc}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── BIG COINS REWARDS ── */}
        <section className={s.bigCoinsWrapper}>
          <div className={s.bigCoinsSection}>
            <div className={s.bigCoinsGlow} />

            {/* Left */}
            <div className={s.bigCoinsLeft}>
              <div className={s.bigCoinsBadge}>
                <Zap size={13} />
                <span>Loyalty Rewards</span>
              </div>
              <h2 className={`font-heading ${s.bigCoinsTitle}`}>
                Earn More with<br />
                <span>Big Coins</span>
              </h2>
              <p className={s.bigCoinsSubtitle}>
                Order through the Big Bean Café app and earn Big Coins on eligible purchases. Redeem rewards and enjoy exclusive benefits.
              </p>
              <Link href="/app" className={s.bigCoinsButton}>
                <Smartphone size={14} /> Download App
              </Link>
            </div>

            {/* Right cards */}
            <div className={s.bigCoinsRight}>
              {[
                { icon: Gift, title: 'Earn coins on orders', desc: 'Get Big Coins on every eligible purchase through the app.' },
                { icon: ArrowRight, title: 'Redeem on future purchases', desc: 'Use your accumulated Big Coins on your next order.' },
                { icon: Star, title: 'Unlock exclusive rewards', desc: 'Access member-only deals, free items, and surprise offers.' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className={s.bigCoinsRewardCard}>
                    <div className={s.bigCoinsIconCircle}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className={s.bigCoinsRewardTitle}>{item.title}</div>
                      <div className={s.bigCoinsRewardDesc}>{item.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── WEEKLY SPECIALS ── */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 2rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.22em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Every Week</p>
            <h2 className="font-heading" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.1, marginBottom: '0.5rem' }}>Weekly Café Specials</h2>
            <p style={{ fontSize: '0.78rem', color: '#9B6B50', fontStyle: 'italic' }}>*T&C Apply</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
            {WEEKLY_SPECIALS.map((w, i) => (
              <div key={i} style={{ borderRadius: 28, background: '#FFF7ED', border: '1px solid #E6C7A8', overflow: 'hidden', boxShadow: '0 4px 20px rgba(61,31,13,0.07)', transition: 'all 0.25s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 18px 48px rgba(61,31,13,0.13)'; (e.currentTarget as HTMLElement).style.borderColor = '#C9943A' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(61,31,13,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = '#E6C7A8' }}>
                {/* Top bar */}
                <div style={{ height: 8, background: w.color }} />
                <div style={{ padding: '1.5rem 1.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: w.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#FFF7ED', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{w.badge}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#9B6B50', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{w.day}</div>
                      <div className="font-heading" style={{ fontSize: '1rem', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.2 }}>{w.title}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#6B3520', lineHeight: 1.65 }}>{w.desc}</p>
                  <a href="https://bigbeancafe.store" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.1rem', fontSize: '0.74rem', fontWeight: 800, color: w.color, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.07em' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}>
                    Grab Deal <ArrowRight style={{ width: 12, height: 12 }} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ACTIVE OFFERS (original section) ── */}
        <section style={{ padding: '4rem 0 0', background: 'transparent' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', paddingLeft: '2rem', paddingRight: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.22em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Current Deals</p>
              <h2 className="font-heading" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.1, marginBottom: '1rem' }}>Active Café Offers</h2>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: '420px', margin: '0 auto 3rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8B5A3C' }} />
              <input type="text" placeholder="Search offers..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', borderRadius: '999px', border: '1.5px solid #E6C7A8', paddingLeft: '2.8rem', paddingRight: '1.2rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', fontSize: '0.875rem', outline: 'none', background: '#FFF7ED', color: '#3D1F0D', transition: 'box-shadow 0.2s' }}
                onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,148,58,0.20)')}
                onBlur={e => (e.currentTarget.style.boxShadow = 'none')} />
            </div>

            {loading && <PageSkeleton />}

            {!loading && filtered.length === 0 && search.trim() !== '' && (
              <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                <Search size={48} style={{ margin: '0 auto 1rem', opacity: 0.2, color: '#C9943A' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4A2518', marginBottom: '0.5rem' }}>No offers match &ldquo;{search}&rdquo;</h3>
                <p style={{ fontSize: '0.875rem', color: '#A9866F', marginBottom: '1.5rem' }}>Try a different keyword.</p>
                <button onClick={() => setSearch('')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#3D1F0D', color: '#FFF7ED', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  Clear Search
                </button>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {filtered.map((offer, i) => <OfferCard key={offer.id} offer={offer} index={i} />)}
              </div>
            )}
          </div>
        </section>

        {/* ── ORDER PLATFORMS ── */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 2rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.22em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Order Now</p>
            <h2 className="font-heading" style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.1 }}>Order Your Favourites Online</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.25rem' }}>
            {[
              { name: 'Big Bean Store', desc: 'Order directly from our official store', href: 'https://bigbeancafe.store', color: '#3D1F0D', textColor: '#FFF7ED', badge: 'Official' },
              { name: 'Zomato', desc: 'Order on Zomato for fast delivery', href: '#', color: '#E23744', textColor: '#fff', badge: 'Delivery' },
              { name: 'Swiggy', desc: 'Order on Swiggy and track in real time', href: '#', color: '#FC8019', textColor: '#fff', badge: 'Delivery' },
            ].map((p, i) => (
              <a key={i} href={p.href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderRadius: 24, background: p.color, padding: '1.75rem 1.6rem', textDecoration: 'none', transition: 'all 0.22s', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: p.textColor }}>{p.name}</span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 900, background: 'rgba(255,255,255,0.2)', color: p.textColor, borderRadius: 20, padding: '0.2rem 0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{p.badge}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: p.textColor, opacity: 0.8, lineHeight: 1.55 }}>{p.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', fontWeight: 800, color: p.textColor, opacity: 0.9 }}>
                  Order Now <ExternalLink style={{ width: 12, height: 12 }} />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ maxWidth: 1280, margin: '4rem auto', padding: '0 2rem' }}>
          <div style={{ borderRadius: 40, background: 'linear-gradient(135deg,#120905 0%,#2A120B 50%,#5C2E12 100%)', overflow: 'hidden', padding: '4rem 3.5rem', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 24px 72px rgba(18,9,5,0.28)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(201,148,58,0.08),transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(201,148,58,0.05) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,148,58,0.14)', border: '1px solid rgba(201,148,58,0.3)', borderRadius: 100, padding: '0.4rem 1.1rem', marginBottom: '1.75rem' }}>
              <MapPin style={{ width: 13, height: 13, color: '#C9943A' }} />
              <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.22em', color: '#F3D59B', textTransform: 'uppercase' }}>Visit Us</span>
            </div>

            <h2 className="font-heading" style={{ position: 'relative', zIndex: 2, fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: '#FFF7ED', lineHeight: 1.1, marginBottom: '1rem', maxWidth: 560 }}>
              Visit Your Nearby Big Bean Café
            </h2>
            <p style={{ position: 'relative', zIndex: 2, fontSize: '1.05rem', color: '#C7A489', lineHeight: 1.8, maxWidth: 500, marginBottom: '2.25rem' }}>
              Enjoy fresh coffee, food, desserts and special offers at your nearest outlet.
            </p>

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/outlets"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#C9943A', color: '#120905', borderRadius: 100, padding: '0.9rem 2.2rem', fontSize: '0.8rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.09em', boxShadow: '0 10px 28px rgba(201,148,58,0.3)', transition: 'all 0.22s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F6D58D'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C9943A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                <MapPin style={{ width: 14, height: 14 }} /> Find Outlet <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
              <a href="https://bigbeancafe.store" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: '#FFF7ED', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 100, padding: '0.9rem 2.2rem', fontSize: '0.8rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.09em', transition: 'all 0.22s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                Order Online <ExternalLink style={{ width: 13, height: 13 }} />
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      <style>{`
        div::-webkit-scrollbar { height: 4px; }
        div::-webkit-scrollbar-track { background: transparent; }
        div::-webkit-scrollbar-thumb { background: rgba(201,148,58,0.3); border-radius: 99px; }
        @media (max-width: 640px) {
          .offer-page-card-inner { flex-direction: column !important; }
        }
      `}</style>
    </div>
  )
}
