'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Coffee, Store, Users, Heart, Sparkles, MapPin, Award, Leaf, ArrowRight, Star, Smartphone, QrCode, Check, Plus, Minus, HelpCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace('/api', '')

const getImg = (img?: string | null): string | null => {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${API_BASE}/${img.replace(/^\/+/, '')}`
}

const DEFAULT_HERO = {
  eyebrow: 'ABOUT US',
  title: 'Brewed with Passion,',
  highlight_text: 'Served with Heart.',
  subtitle: "Big Bean Café is more than just coffee — it's an experience crafted with passion, quality, and a love for bringing people together.",
  button_primary_text: 'Know Our Story',
  button_primary_url: '#story',
  button_secondary_text: 'Explore Outlets',
  button_secondary_url: '/outlets',
  stat_1_value: '7+', stat_1_label: 'Outlets',
  stat_2_value: '50K+', stat_2_label: 'Happy Customers',
  stat_3_value: '100%', stat_3_label: 'Quality Coffee',
  image: null as string | null,
}

const VALUES = [
  { icon: Award, title: 'Quality First', text: 'We source the finest beans and never compromise on quality.' },
  { icon: Heart, title: 'Made with Love', text: 'Every cup is crafted with passion and served with a smile.' },
  { icon: Users, title: 'Community Focused', text: 'We create spaces where connections, conversations and memories are made.' },
  { icon: Leaf, title: 'Sustainable Choices', text: 'We care for the planet with responsible sourcing and eco-friendly practices.' },
]

const EXPERIENCE = [
  { icon: Coffee, title: 'Exceptional Coffee', text: 'Handcrafted beverages made with premium coffee beans.' },
  { icon: Sparkles, title: 'Delicious Food', text: 'A wide range of meals and bites made fresh every day.' },
  { icon: Users, title: 'Cozy Ambience', text: 'Comfortable spaces designed for work, relax or meet.' },
  { icon: Award, title: 'Expertly Roasted', text: 'Our beans are roasted to perfection for ultimate flavor.' },
]

const WHY = [
  { icon: Star, title: 'Premium Quality Ingredients', text: 'We use the best coffee beans and ingredients.' },
  { icon: Award, title: 'Skilled Baristas', text: 'Our baristas are trained to create perfect coffee.' },
  { icon: Store, title: 'Consistent Experience', text: 'Enjoy the same great experience at every Big Bean outlet.' },
  { icon: Heart, title: 'Customer Happiness', text: 'Your happiness is our biggest achievement.' },
  { icon: Sparkles, title: 'Loyalty Rewards', text: 'Earn Big Coins and enjoy exclusive benefits.' },
]

type HeroType = typeof DEFAULT_HERO

interface AppPromoData {
  id: number
  eyebrow: string | null
  title: string
  subtitle: string | null
  feature_1: string | null
  feature_2: string | null
  feature_3: string | null
  feature_4: string | null
  google_play_url: string | null
  app_store_url: string | null
  order_url: string | null
  qr_image: string | null
  mockup_image: string | null
  background_image: string | null
  button_text: string | null
}

const APP_FALLBACK: AppPromoData = {
  id: 0,
  eyebrow: 'BIG BEAN CAFÉ APP',
  title: 'Order on the Go with Big Bean Café App',
  subtitle: 'Download our app for quick ordering, rewards, exclusive offers, and seamless café ordering.',
  feature_1: 'Mobile ordering & payment',
  feature_2: 'Exclusive app-only deals',
  feature_3: 'QR code ordering in-store',
  feature_4: 'Big Coins rewards',
  google_play_url: '#',
  app_store_url: '#',
  order_url: 'https://bigbeancafe.store',
  qr_image: null,
  mockup_image: null,
  background_image: null,
  button_text: 'Order Online Now',
}

function ValuesBackground() {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#FFF7ED 0%,#F6E6D1 40%,#E6C7A8 70%,#C9943A 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(201,148,58,0.22) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(61,31,13,0.18) 0%, transparent 45%)' }} />
      </div>
    )
  }
  return (
    <img
      src="/images/about/values-bg.png"
      alt=""
      aria-hidden
      onError={() => setFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
    />
  )
}

function CommunityImage() {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3D1F0D 0%,#6B3520 50%,#C9943A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Users style={{ width: 48, height: 48, color: 'rgba(246,213,141,0.5)' }} />
      </div>
    )
  }
  return (
    <img
      src="/images/about/values-community.png"
      alt="Community at Big Bean Café"
      onError={() => setFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
    />
  )
}

function StoryImage() {
  const [src, setSrc] = useState('/images/about/about-story-girl-cafe.png')
  const [fallback, setFallback] = useState(false)
  const [failed, setFailed] = useState(false)

  const handleError = () => {
    if (!fallback) {
      setFallback(true)
      setSrc('/images/about/about-cafe-story.png')
    } else {
      setFailed(true)
    }
  }

  if (failed) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#3D1F0D 0%,#6B3520 35%,#8B4A2F 60%,#C9943A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Coffee style={{ width: 38, height: 38, color: '#F6D58D' }} />
        </div>
        <p className="font-heading" style={{ color: '#F6D58D', fontSize: '1.3rem', fontWeight: 700, textAlign: 'center', padding: '0 2rem' }}>
          Big Bean Café<br />
          <span style={{ fontSize: '1rem', fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>Brewing Since Day One</span>
        </p>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt="Big Bean Café story"
      onError={handleError}
      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
    />
  )
}

const FAQS = [
  {
    q: 'Does Big Bean Cafe have multiple outlets in Bengaluru?',
    a: 'Yes. Big Bean Cafe currently operates seven outlets across Bengaluru, making it easy for customers to enjoy our premium coffee and handcrafted food from multiple locations.',
  },
  {
    q: 'Can I order online from Big Bean Cafe?',
    a: 'Yes. Customers can currently order through Swiggy and Zomato. Our own website and mobile application will soon support direct online ordering.',
  },
  {
    q: 'Do you serve breakfast?',
    a: 'Yes. Our menu includes breakfast, handcrafted coffee, snacks, desserts and a variety of freshly prepared food.',
  },
  {
    q: 'Where is the first Big Bean Cafe outlet?',
    a: 'Big Bean Cafe started its journey with its first outlet in RR Nagar, Bengaluru.',
  },
  {
    q: 'Do you offer dine-in and takeaway?',
    a: 'Yes. All Big Bean Cafe outlets provide both dine-in and takeaway services.',
  },
]

export default function AboutPage() {
  const [hero, setHero] = useState<HeroType>(DEFAULT_HERO)
  const [outlets, setOutlets] = useState<any[]>([])
  const [heroImg, setHeroImg] = useState<string | null>(null)
  const [appPromo, setAppPromo] = useState<AppPromoData>(APP_FALLBACK)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    fetch(`${API_URL}/about-hero/active`)
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setHero({ ...DEFAULT_HERO, ...d.data })
          setHeroImg(getImg(d.data.image))
        }
      })
      .catch(() => {})

    fetch(`${API_URL}/outlets/active`)
      .then(r => r.json())
      .then(d => setOutlets((d.data || d.outlets || []).slice(0, 8)))
      .catch(() => {})

    fetch(`${API_URL}/app-promos/active`)
      .then(r => r.json())
      .then(d => { const items: AppPromoData[] = d.data || []; if (items.length > 0) setAppPromo(items[0]) })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#FBF4EC' }}>
      <style>{`
        .about-hero { min-height: 520px; }
        @media (max-width: 1024px) { .about-hero { min-height: 420px; } }
        @media (max-width: 640px) { .about-hero { min-height: 360px; } }
      `}</style>
      <Header />
      <main>

        {/* HERO */}
        <section className="about-hero" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#120905', overflow: 'hidden' }}>

          {/* Background image — bright and visible */}
          {heroImg && (
            <img src={heroImg} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.9, filter: 'brightness(1.2) contrast(1.05) saturate(1.08)', zIndex: 0 }} />
          )}

          {/* Directional overlay — readable left, clear right */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(90deg,rgba(18,9,5,0.82) 0%,rgba(18,9,5,0.62) 34%,rgba(18,9,5,0.28) 62%,rgba(18,9,5,0.16) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg,rgba(18,9,5,0.12) 0%,rgba(18,9,5,0.28) 100%)' }} />

          {/* Subtle gold glow top-left */}
          <div style={{ position: 'absolute', top: -100, left: -100, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.14),transparent 70%)', zIndex: 1, pointerEvents: 'none' }} />

          {/* Left content — full width, max 620px */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1320, margin: '0 auto', padding: '3rem 2rem 2.5rem', width: '100%' }}>
            <div style={{ maxWidth: 560 }}>

              {/* Eyebrow */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,148,58,0.15)', border: '1px solid rgba(201,148,58,0.35)', borderRadius: 100, padding: '0.38rem 0.95rem', marginBottom: '1.4rem' }}>
                <Sparkles style={{ width: 14, height: 14, color: '#C9943A' }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.22em', color: '#F3D59B', textTransform: 'uppercase' }}>{hero.eyebrow}</span>
              </div>

              {/* Title */}
              <h1 className="font-heading" style={{ fontSize: 'clamp(2.2rem,4vw,3.9rem)', fontWeight: 900, color: '#fff', lineHeight: 1, margin: 0 }}>
                {hero.title}
                {hero.highlight_text && (
                  <span style={{ display: 'block', background: 'linear-gradient(90deg,#F6D58D,#C9943A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {hero.highlight_text}
                  </span>
                )}
              </h1>

              {/* Subtitle */}
              {hero.subtitle && (
                <p style={{ marginTop: '1.4rem', fontSize: '0.92rem', color: '#E8C7A8', lineHeight: 1.7, maxWidth: 520 }}>
                  {hero.subtitle}
                </p>
              )}

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.8rem', flexWrap: 'wrap' }}>
                <a href={hero.button_primary_url}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#C9943A', color: '#120905', borderRadius: 100, padding: '0.82rem 1.65rem', fontSize: '0.7rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 10px 28px rgba(201,148,58,0.32)', transition: 'all 0.25s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.background = '#F6D58D' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.background = '#C9943A' }}>
                  {hero.button_primary_text} <ArrowRight style={{ width: 14, height: 14 }} />
                </a>
                <a href={hero.button_secondary_url}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: '#fff', borderRadius: 100, padding: '0.82rem 1.65rem', fontSize: '0.7rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', border: '1.5px solid rgba(255,255,255,0.3)', transition: 'all 0.25s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                  <MapPin style={{ width: 14, height: 14 }} /> {hero.button_secondary_text}
                </a>
              </div>

              {/* Stats glass strip */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.6rem', flexWrap: 'wrap' }}>
                {[
                  { v: hero.stat_1_value, l: hero.stat_1_label },
                  { v: hero.stat_2_value, l: hero.stat_2_label },
                  { v: hero.stat_3_value, l: hero.stat_3_label },
                ].map(s => (
                  <div key={s.l} style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 14, padding: '0.75rem 1rem', backdropFilter: 'blur(12px)', minWidth: 88 }}>
                    <div className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#F6D58D', lineHeight: 1 }}>{s.v}</div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>{s.l}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Floating badge — bottom right, small and non-intrusive */}
          <div style={{ position: 'absolute', right: '4%', bottom: '8%', maxWidth: 300, zIndex: 3, background: 'rgba(18,9,5,0.55)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(14px)', borderRadius: 22, padding: '1.2rem' }}
            className="hidden lg:block">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#C9943A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Coffee style={{ width: 18, height: 18, color: '#120905' }} />
              </div>
              <span className="font-heading" style={{ fontSize: '0.82rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>Bengaluru&apos;s Favourite<br />Coffee Destination</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
              {hero.stat_1_value} outlets across Bengaluru, crafting premium coffee every day.
            </p>
          </div>

        </section>

        {/* STORY */}
        <section id="story" style={{ background: '#FBF4EC', padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative faint botanical background */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(201,148,58,0.06) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(61,31,13,0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '5rem', alignItems: 'center' }}>

              {/* LEFT — Story content */}
              <div>
                {/* Eyebrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 28, height: 2, background: '#C9943A', borderRadius: 2 }} />
                  <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.25em', color: '#C9943A', textTransform: 'uppercase', margin: 0 }}>OUR STORY</p>
                </div>

                {/* Title */}
                <h2 className="font-heading" style={{ fontSize: 'clamp(2rem,3.4vw,3.4rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.05, marginBottom: '1.25rem' }}>
                  How Our Journey Began
                </h2>

                {/* Gold divider */}
                <div style={{ width: 64, height: 3, background: 'linear-gradient(90deg,#C9943A,#F6D58D)', borderRadius: 3, marginBottom: '2rem' }} />

                {/* Paragraphs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.95rem', color: '#6B3520', lineHeight: 1.75 }}>
                  <p style={{ margin: 0 }}>Big Bean Cafe began its journey in 2023 with its first outlet in RR Nagar, Bengaluru. What started as a passion for premium coffee has grown into a trusted café brand with seven outlets across the city.</p>
                  <p style={{ margin: 0 }}> Every cup of coffee is prepared using ethically sourced and freshly roasted beans, paired with handcrafted food and exceptional hospitality.</p>
                  <p style={{ margin: 0 }}>Our goal is to create welcoming spaces where friends, families, professionals and coffee lovers can relax, connect and enjoy memorable café experiences.</p>
                </div>

                {/* Signature */}
                <div style={{ marginTop: '2.25rem', padding: '1.1rem 1.5rem', borderRadius: 16, background: '#FFF7ED', border: '1px solid #E6C7A8', display: 'inline-block' }}>
                  <span className="font-heading" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3D1F0D', fontStyle: 'italic' }}>— The Big Bean Team</span>
                </div>

                {/* Button */}
                <div style={{ marginTop: '2rem' }}>
                  <Link href="/our-story"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', background: '#3D1F0D', color: '#FFF7ED', borderRadius: 100, padding: '0.9rem 2.2rem', fontSize: '0.74rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.25s', boxShadow: '0 8px 28px rgba(61,31,13,0.2)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.background = '#6B3520'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 40px rgba(61,31,13,0.28)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.background = '#3D1F0D'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(61,31,13,0.2)' }}>
                    Know Our Story <ArrowRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>
              </div>

              {/* RIGHT — Large café image card */}
              <div style={{ position: 'relative' }}>
                {/* Decorative glow behind card */}
                <div style={{ position: 'absolute', inset: -20, borderRadius: 60, background: 'linear-gradient(135deg,rgba(201,148,58,0.12),rgba(61,31,13,0.08))', filter: 'blur(30px)', zIndex: 0 }} />

                {/* Image card */}
                <div
                  style={{ position: 'relative', zIndex: 1, borderRadius: 40, overflow: 'hidden', height: 620, border: '1px solid #E6C7A8', boxShadow: '0 32px 80px rgba(61,31,13,0.16)', transition: 'transform 0.4s ease, box-shadow 0.4s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.015)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 44px 100px rgba(61,31,13,0.22)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 32px 80px rgba(61,31,13,0.16)' }}>

                  {/* Image with zoom on parent hover */}
                  <StoryImage />

                  {/* Very light warm overlay — keeps image bright */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(18,9,5,0.05) 0%,rgba(18,9,5,0.18) 100%)', pointerEvents: 'none' }} />

                  {/* Decorative coffee bean icon top-right */}
                  <div style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,247,237,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(230,199,168,0.7)', boxShadow: '0 4px 16px rgba(61,31,13,0.12)' }}>
                    <Coffee style={{ width: 20, height: 20, color: '#C9943A' }} />
                  </div>

                  {/* Stats strip overlay — bottom of image */}
                  <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, background: 'rgba(255,247,237,0.92)', backdropFilter: 'blur(16px)', borderRadius: 24, border: '1px solid #E6C7A8', boxShadow: '0 8px 32px rgba(61,31,13,0.12)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', overflow: 'hidden' }}>
                    {[
                      { v: '7+', l: 'Outlets' },
                      { v: '50K+', l: 'Happy Customers' },
                      { v: '100%', l: 'Quality' },
                    ].map((s, i) => (
                      <div key={s.l} style={{ padding: '1rem 0.5rem', textAlign: 'center', borderRight: i < 2 ? '1px solid #E6C7A8' : 'none' }}>
                        <div className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 900, color: '#3D1F0D' }}>{s.v}</div>
                        <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#9B6B50', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* VALUES */}
        <section style={{ position: 'relative', padding: '4rem 0', overflow: 'hidden', background: '#FFF7ED' }}>
          {/* Background image */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <ValuesBackground />
          </div>
          {/* Warm overlay fading to dark at bottom */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,247,237,0.92) 0%,rgba(255,247,237,0.72) 38%,rgba(18,9,5,0.58) 100%)', zIndex: 1 }} />
          {/* Subtle radial glows */}
          <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.10),transparent 70%)', zIndex: 1, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

            {/* Section header */}
            <div style={{ textAlign: 'center', marginBottom: '2.2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Coffee style={{ width: 16, height: 16, color: '#C9943A' }} />
              </div>
              <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.25em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.8rem' }}>OUR VALUES</p>
              <h2 className="font-heading" style={{ fontSize: 'clamp(1.6rem,2.6vw,2.25rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.08, marginBottom: '0.75rem' }}>
                What Drives Us Every Day
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#6B3520', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 1rem' }}>
                At Big Bean Café, our values are more than words — they are the heart of everything we do.
              </p>
              {/* Gold divider with heart */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <div style={{ width: 48, height: 2, background: 'linear-gradient(90deg,transparent,#C9943A)', borderRadius: 2 }} />
                <Heart style={{ width: 14, height: 14, color: '#C9943A', fill: '#C9943A' }} />
                <div style={{ width: 48, height: 2, background: 'linear-gradient(90deg,#C9943A,transparent)', borderRadius: 2 }} />
              </div>
            </div>

            {/* Top row — 3 cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>

              {/* Quality First */}
              <div
                style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', height: 300, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(135deg,rgba(18,9,5,0.88),rgba(61,31,13,0.76),rgba(139,74,47,0.62))', border: '1px solid rgba(201,148,58,0.35)', boxShadow: '0 20px 60px rgba(18,9,5,0.3)', backdropFilter: 'blur(8px)', transition: 'all 0.35s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,148,58,0.75)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 32px 80px rgba(18,9,5,0.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,148,58,0.35)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(18,9,5,0.3)' }}>
                {/* Decorative circle */}
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.18),transparent 70%)' }} />
                {/* Icon */}
                <div style={{ position: 'absolute', top: '2rem', left: '2rem', width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,148,58,0.18)', border: '1.5px solid rgba(201,148,58,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award style={{ width: 22, height: 22, color: '#F6D58D' }} />
                </div>
                <div>
                  <div style={{ width: 32, height: 2, background: '#C9943A', borderRadius: 2, marginBottom: '0.75rem' }} />
                  <h3 className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginBottom: '0.65rem', lineHeight: 1.2 }}>Quality First</h3>
                  <p style={{ fontSize: '0.83rem', color: 'rgba(230,199,168,0.9)', lineHeight: 1.7, marginBottom: '1.2rem' }}>We source the finest beans from trusted farms and never compromise on quality.</p>
                  <a href="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, color: '#F6D58D', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'gap 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.gap = '0.7rem' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.gap = '0.4rem' }}>
                    Learn More <ArrowRight style={{ width: 12, height: 12 }} />
                  </a>
                </div>
              </div>

              {/* Made with Love */}
              <div
                style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', height: 300, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(135deg,rgba(18,9,5,0.88),rgba(61,31,13,0.76),rgba(139,74,47,0.62))', border: '1px solid rgba(201,148,58,0.35)', boxShadow: '0 20px 60px rgba(18,9,5,0.3)', backdropFilter: 'blur(8px)', transition: 'all 0.35s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,148,58,0.75)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 32px 80px rgba(18,9,5,0.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,148,58,0.35)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(18,9,5,0.3)' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.18),transparent 70%)' }} />
                <div style={{ position: 'absolute', top: '2rem', left: '2rem', width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,148,58,0.18)', border: '1.5px solid rgba(201,148,58,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart style={{ width: 22, height: 22, color: '#F6D58D' }} />
                </div>
                <div>
                  <div style={{ width: 32, height: 2, background: '#C9943A', borderRadius: 2, marginBottom: '0.75rem' }} />
                  <h3 className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginBottom: '0.65rem', lineHeight: 1.2 }}>Made with Love</h3>
                  <p style={{ fontSize: '0.83rem', color: 'rgba(230,199,168,0.9)', lineHeight: 1.7, marginBottom: '1.2rem' }}>Every cup is crafted with passion and served with a genuine smile.</p>
                  <a href="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, color: '#F6D58D', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'gap 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.gap = '0.7rem' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.gap = '0.4rem' }}>
                    Learn More <ArrowRight style={{ width: 12, height: 12 }} />
                  </a>
                </div>
              </div>

              {/* Sustainable Choices */}
              <div
                style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', height: 300, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(135deg,rgba(18,9,5,0.88),rgba(36,45,28,0.78),rgba(61,31,13,0.62))', border: '1px solid rgba(201,148,58,0.35)', boxShadow: '0 20px 60px rgba(18,9,5,0.3)', backdropFilter: 'blur(8px)', transition: 'all 0.35s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,148,58,0.75)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 32px 80px rgba(18,9,5,0.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,148,58,0.35)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(18,9,5,0.3)' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle,rgba(100,140,60,0.15),transparent 70%)' }} />
                <div style={{ position: 'absolute', top: '2rem', left: '2rem', width: 48, height: 48, borderRadius: '50%', background: 'rgba(100,140,60,0.18)', border: '1.5px solid rgba(150,190,80,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf style={{ width: 22, height: 22, color: '#C8E090' }} />
                </div>
                <div>
                  <div style={{ width: 32, height: 2, background: '#C9943A', borderRadius: 2, marginBottom: '0.75rem' }} />
                  <h3 className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', marginBottom: '0.65rem', lineHeight: 1.2 }}>Sustainable Choices</h3>
                  <p style={{ fontSize: '0.83rem', color: 'rgba(230,199,168,0.9)', lineHeight: 1.7, marginBottom: '1.2rem' }}>We care for the planet with responsible sourcing and eco-friendly practices.</p>
                  <a href="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, color: '#F6D58D', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'gap 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.gap = '0.7rem' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.gap = '0.4rem' }}>
                    Learn More <ArrowRight style={{ width: 12, height: 12 }} />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom row — 1 wide Community card */}
            <div
              style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', minHeight: 190, display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid rgba(201,148,58,0.35)', boxShadow: '0 20px 60px rgba(18,9,5,0.3)', transition: 'all 0.35s', cursor: 'default' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,148,58,0.75)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 32px 80px rgba(18,9,5,0.4)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,148,58,0.35)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(18,9,5,0.3)' }}>

              {/* Left content */}
              <div style={{ background: 'linear-gradient(135deg,rgba(18,9,5,0.90),rgba(61,31,13,0.80),rgba(139,74,47,0.65))', backdropFilter: 'blur(8px)', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.12),transparent 70%)' }} />
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,148,58,0.18)', border: '1.5px solid rgba(201,148,58,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Users style={{ width: 22, height: 22, color: '#F6D58D' }} />
                </div>
                <div style={{ width: 32, height: 2, background: '#C9943A', borderRadius: 2, marginBottom: '0.75rem' }} />
                <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.2 }}>Community Focused</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(230,199,168,0.9)', lineHeight: 1.7, marginBottom: '1.25rem', maxWidth: 400 }}>We create spaces where connections, conversations and memories are made.</p>
                <a href="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, color: '#F6D58D', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'gap 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.gap = '0.7rem' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.gap = '0.4rem' }}>
                  Learn More <ArrowRight style={{ width: 12, height: 12 }} />
                </a>
              </div>

              {/* Right image */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <CommunityImage />
                {/* Dark overlay on right image */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(18,9,5,0.45) 0%,rgba(18,9,5,0.10) 100%)', pointerEvents: 'none' }} />
              </div>
            </div>

          </div>
        </section>

        {/* MORE THAN A CAFE */}
        <section style={{ background: '#120905', padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.10),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.8rem' }}>
              <h2 className="font-heading" style={{ fontSize: 'clamp(1.8rem,3vw,2.55rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                We&apos;re More Than Just a Café
              </h2>
              <p style={{ color: '#B8957D', marginTop: '1rem', fontSize: '0.92rem' }}>Discover what makes Big Bean Café a complete experience</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem' }}>
              {EXPERIENCE.map(({ icon: Icon, title, text }) => (
                <div key={title}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '2rem', backdropFilter: 'blur(10px)', transition: 'all 0.3s', cursor: 'default' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.background = 'rgba(201,148,58,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,148,58,0.4)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(201,148,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem' }}>
                    <Icon style={{ width: 24, height: 24, color: '#C9943A' }} />
                  </div>
                  <h3 className="font-heading" style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '0.6rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.84rem', color: '#9A7A65', lineHeight: 1.7 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OUTLETS */}
        <section style={{ background: '#FBF4EC', padding: '5rem 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '4rem', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.22em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>OUR OUTLETS</p>
                <h2 className="font-heading" style={{ fontSize: 'clamp(1.8rem,3vw,2.55rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.1, marginBottom: '1.5rem' }}>
                  Our Cafe Outlets,<br />Across Bengaluru.
                </h2>
                <p style={{ fontSize: '0.93rem', color: '#6B3520', lineHeight: 1.75, marginBottom: '2rem' }}>
                  Visit Big Bean Cafe across Bengaluru, including Koramangala, RR Nagar, HSR Layout, Indiranagar, Electronic City, Jayanagar and Kammanahalli. Every outlet offers the same premium coffee, handcrafted food, warm hospitality and welcoming atmosphere. Fr
                </p>
                <a href="/outlets"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#3D1F0D', color: '#FFF7ED', borderRadius: 100, padding: '0.9rem 2rem', fontSize: '0.74rem', fontWeight: 900, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.25s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.background = '#6B3520' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.background = '#3D1F0D' }}>
                  Explore All Outlets <ArrowRight style={{ width: 14, height: 14 }} />
                </a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {outlets.length === 0 ? (
                  [1,2,3,4].map(i => (
                    <div key={i} style={{ height: 80, borderRadius: 20, background: '#E6C7A8', opacity: 0.4 }} />
                  ))
                ) : outlets.map((outlet: any) => {
                  const img = getImg(outlet.image)
                  return (
                    <div key={outlet.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#fff', borderRadius: 20, padding: '1rem 1.25rem', border: '1px solid #E6C7A8', boxShadow: '0 4px 20px rgba(61,31,13,0.06)', transition: 'all 0.3s', cursor: 'default' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 40px rgba(61,31,13,0.12)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateX(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(61,31,13,0.06)' }}>
                      <div style={{ width: 56, height: 56, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
                        {img ? (
                          <img src={img} alt={outlet.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3D1F0D,#C9943A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin style={{ width: 22, height: 22, color: '#FFF7ED' }} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-heading" style={{ fontWeight: 800, color: '#3D1F0D', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{outlet.name}</div>
                        {outlet.address && <div style={{ fontSize: '0.72rem', color: '#9B6B50', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{outlet.address}</div>}
                      </div>
                      <MapPin style={{ width: 16, height: 16, color: '#C9943A', flexShrink: 0 }} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE */}
        <section style={{ background: '#FFF7ED', padding: '5rem 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.8rem' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.22em', color: '#C9943A', textTransform: 'uppercase', marginBottom: '0.75rem' }}>WHY CHOOSE BIG BEAN CAFÉ?</p>
              <h2 className="font-heading" style={{ fontSize: 'clamp(1.8rem,3vw,2.55rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.1 }}>Because You Deserve the Best</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem' }}>
              {WHY.map(({ icon: Icon, title, text }) => (
                <div key={title}
                  style={{ background: '#fff', borderRadius: 24, padding: '2rem 1.5rem', textAlign: 'center', border: '1px solid #E6C7A8', boxShadow: '0 4px 24px rgba(61,31,13,0.05)', transition: 'all 0.3s', cursor: 'default' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(61,31,13,0.12)'; (e.currentTarget as HTMLElement).style.borderColor = '#C9943A' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(61,31,13,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = '#E6C7A8' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#FFF7ED,#F6E6D1)', border: '2px solid #E6C7A8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
                    <Icon style={{ width: 22, height: 22, color: '#C9943A' }} />
                  </div>
                  <h3 className="font-heading" style={{ fontSize: '0.92rem', fontWeight: 800, color: '#3D1F0D', marginBottom: '0.6rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#6B3520', lineHeight: 1.7 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: '#FBF4EC', padding: '4rem 2rem' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            {/* Heading */}
            <div style={{ textAlign: 'center', marginBottom: '2.8rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,148,58,0.12)', border: '1px solid rgba(201,148,58,0.3)', borderRadius: 100, padding: '0.35rem 0.9rem', marginBottom: '1rem' }}>
                <HelpCircle style={{ width: 13, height: 13, color: '#C9943A' }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.22em', color: '#C9943A', textTransform: 'uppercase' }}>FAQ</span>
              </div>
              <h2 className="font-heading" style={{ fontSize: 'clamp(1.7rem,3vw,2.4rem)', fontWeight: 900, color: '#3D1F0D', lineHeight: 1.1, margin: 0 }}>Frequently Asked Questions</h2>
              <p style={{ marginTop: '0.85rem', fontSize: '0.92rem', color: '#6B3520', lineHeight: 1.7 }}>Everything you need to know about Big Bean Café.</p>
            </div>

            {/* Accordion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i
                return (
                  <div key={i}
                    style={{ background: '#FFF7ED', border: `1px solid ${isOpen ? '#C9943A' : '#E6C7A8'}`, borderRadius: 20, overflow: 'hidden', boxShadow: isOpen ? '0 8px 28px rgba(61,31,13,0.08)' : '0 2px 12px rgba(61,31,13,0.04)', transition: 'all 0.25s' }}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.25rem 1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#3D1F0D', lineHeight: 1.4, flex: 1 }}>{faq.q}</span>
                      <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: isOpen ? '#C9943A' : 'rgba(201,148,58,0.12)', border: `1.5px solid ${isOpen ? '#C9943A' : '#E6C7A8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s' }}>
                        {isOpen
                          ? <Minus style={{ width: 13, height: 13, color: '#fff' }} />
                          : <Plus style={{ width: 13, height: 13, color: '#C9943A' }} />
                        }
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 1.5rem 1.35rem' }}>
                        <div style={{ width: 32, height: 2, background: '#C9943A', borderRadius: 2, marginBottom: '0.85rem' }} />
                        <p style={{ fontSize: '0.88rem', color: '#6B3520', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* APP / FAMILY CTA */}
        {(() => {
          const ap = appPromo
          const features = [ap.feature_1, ap.feature_2, ap.feature_3, ap.feature_4].filter(Boolean) as string[]
          const qrUrl = getImg(ap.qr_image)
          const mockupUrl = getImg(ap.mockup_image)
          const bgUrl = getImg(ap.background_image)
          const orderUrl = ap.order_url || 'https://bigbeancafe.store'
          const gpUrl = ap.google_play_url || '#'
          const asUrl = ap.app_store_url || '#'
          return (
            <section style={{ background: 'linear-gradient(135deg,#FFF7ED 0%,#FDF4E7 50%,#FBF0E0 100%)', padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.10),transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(169,37,23,0.06),transparent 70%)', pointerEvents: 'none' }} />

              <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.5rem' }}>
                {/* Premium dark card */}
                <div style={{ position: 'relative', borderRadius: 42, overflow: 'hidden', background: bgUrl ? 'transparent' : 'linear-gradient(135deg,#120905 0%,#2A120B 45%,#5C2E12 100%)', border: '1px solid rgba(201,148,58,0.25)', boxShadow: '0 40px 100px rgba(18,9,5,0.38)' }}>
                  {/* Optional API background image */}
                  {bgUrl && (
                    <>
                      <img src={bgUrl} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#120905 0%,#2A120B 45%,#5C2E12 100%)', opacity: 0.9 }} />
                    </>
                  )}
                  {/* Glow decorations */}
                  <div style={{ position: 'absolute', top: -80, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.12),transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
                  <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(92,46,18,0.20),transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', padding: '3.5rem' }}>

                    {/* LEFT: content */}
                    <div style={{ flex: '1 1 400px', minWidth: 0 }}>
                      {/* Eyebrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9943A', flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#F3D59B' }}>
                          {ap.eyebrow || 'BIG BEAN CAFÉ APP'}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="font-heading" style={{ fontSize: 'clamp(1.6rem,2.6vw,2.35rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: '1rem' }}>
                        {ap.title}
                      </h2>

                      {/* Subtitle */}
                      {ap.subtitle && (
                        <p style={{ fontSize: '0.92rem', color: '#B8957D', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: 460 }}>
                          {ap.subtitle}
                        </p>
                      )}

                      {/* Features checklist + QR card */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.75rem', alignItems: 'center', marginTop: '1.5rem', marginBottom: '2rem' }}>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: 0, padding: 0, listStyle: 'none' }}>
                          {features.map((f, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(201,148,58,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Check size={11} color="#F6D58D" strokeWidth={3} />
                              </span>
                              <span style={{ fontSize: '0.84rem', color: 'rgba(255,247,237,0.88)', fontWeight: 600 }}>{f}</span>
                            </li>
                          ))}
                        </ul>

                        {/* QR scan card */}
                        <div style={{ width: 200, minHeight: 160, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(201,148,58,0.30)', borderRadius: 24, backdropFilter: 'blur(12px)', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flexShrink: 0 }}>
                          {qrUrl ? (
                            <img src={qrUrl} alt="Scan QR" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, marginBottom: 10 }} />
                          ) : (
                            <div style={{ width: 80, height: 80, background: 'rgba(201,148,58,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, border: '1.5px solid rgba(201,148,58,0.30)' }}>
                              <QrCode size={38} color="#C9943A" />
                            </div>
                          )}
                          <p style={{ fontSize: 13, fontWeight: 900, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>Scan to Order Online</p>
                          <p style={{ fontSize: 11, color: '#B8957D', lineHeight: 1.5, margin: 0 }}>Quick access to menu, offers &amp; rewards</p>
                        </div>
                      </div>

                      {/* Store badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                        <a href={gpUrl} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play"
                          style={{ display: 'inline-flex', transition: 'transform 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                          <Image src="/images/app/google-play-badge.png" alt="Get it on Google Play" width={190} height={58} style={{ height: 56, width: 'auto', objectFit: 'contain' }} />
                        </a>
                        <a href={asUrl} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store"
                          style={{ display: 'inline-flex', transition: 'transform 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                          <Image src="/images/app/app-store-badge.png" alt="Download on the App Store" width={190} height={58} style={{ height: 56, width: 'auto', objectFit: 'contain' }} />
                        </a>
                      </div>

                      {/* Order CTA */}
                      <a href={orderUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#C9943A', color: '#120905', padding: '0.85rem 2rem', borderRadius: 999, textDecoration: 'none', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', boxShadow: '0 12px 28px rgba(201,148,58,0.30)', transition: 'background 0.2s, transform 0.18s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F6D58D'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C9943A'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                        {ap.button_text || 'Order Online Now'} <ArrowRight size={15} />
                      </a>

                      {/* Sub-links */}
                      <div style={{ display: 'flex', gap: '1.2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        <a href="/menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 800, color: '#F3D59B', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.85, transition: 'opacity 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}>
                          Explore Menu <ArrowRight size={11} />
                        </a>
                        <a href="/outlets" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 800, color: '#F3D59B', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.85, transition: 'opacity 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}>
                          <MapPin size={11} /> Find Us
                        </a>
                      </div>
                    </div>

                    {/* RIGHT: phone mockup */}
                    <div style={{ flex: '0 1 480px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,148,58,0.20),transparent 65%)', pointerEvents: 'none' }} />
                      {mockupUrl ? (
                        <img src={mockupUrl} alt="App mockup"
                          style={{ maxHeight: 500, width: '100%', maxWidth: 480, objectFit: 'contain', filter: 'drop-shadow(0 28px 56px rgba(18,9,5,0.55))', position: 'relative', zIndex: 1 }} />
                      ) : (
                        <div style={{ width: 220, height: 400, background: 'linear-gradient(160deg,#3D1F0D,#6B3520,#C9943A)', borderRadius: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.2rem', boxShadow: '0 32px 80px rgba(18,9,5,0.4)', position: 'relative', zIndex: 1 }}>
                          <Smartphone size={72} color="rgba(255,247,237,0.7)" />
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,247,237,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', padding: '0 1.2rem' }}>Big Bean Café App</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Bottom link */}
                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                  <a href="/app" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8B5A3C', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    Learn more about the app <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </section>
          )
        })()}

      </main>
      <Footer />
    </div>
  )
}
