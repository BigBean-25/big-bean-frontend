'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { Smartphone, QrCode, ArrowRight, Check, Coffee, MapPin, Gift, Plus } from 'lucide-react'
import s from './AppPage.module.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

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

const FALLBACK: AppPromoData = {
  id: 0,
  eyebrow: 'BIG BEAN CAFÉ APP',
  title: 'The Big Bean Café App Experience',
  subtitle: 'Now faster, easier, and more rewarding.',
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

const HERO_DESC = 'Order your favourites, scan at the café, earn Big Coins, and enjoy seamless dine-in, takeaway, and delivery ordering.'

const BLOCK_FEATURES = [
  {
    icon: MapPin,
    label: 'Discover',
    title: 'Discover',
    desc: 'Find nearby Big Bean Café outlets, offers, and café updates — all in one place.',
  },
  {
    icon: Smartphone,
    label: 'Choose',
    title: 'Choose',
    desc: 'Choose dine-in QR ordering, takeaway pickup, or delivery — however suits you best.',
  },
  {
    icon: Gift,
    label: 'Earn',
    title: 'Earn',
    desc: 'Earn Big Coins, unlock app-only deals, and enjoy rewards with every order.',
  },
]

const HOW_STEPS = [
  { step: '1', title: 'Download & Sign Up', desc: 'Get the app from App Store or Google Play and create your account in minutes.' },
  { step: '2', title: 'Browse & Order', desc: 'Explore our full menu, customise your order, and pay securely in the app.' },
  { step: '3', title: 'Collect & Enjoy', desc: 'Pick up at the counter or use QR ordering right at your café table.' },
]

const FAQS = [
  { q: 'How do I place an order through the app?', a: 'Download the Big Bean Café app, sign up or log in, browse the menu, add items to your cart, and checkout securely. Your order goes straight to the café.' },
  { q: 'Can I use QR ordering inside the café?', a: 'Yes! Scan the QR code at your table or counter to open the menu and place your order without waiting in line.' },
  { q: 'What payment methods are available?', a: 'We support all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway.' },
  { q: 'How do Big Coins rewards work?', a: 'Earn Big Coins on every purchase made through the app. Accumulated coins can be redeemed for discounts, free items, and exclusive app-only offers.' },
  { q: 'Can I order for takeaway or delivery?', a: 'Absolutely. Select takeaway to schedule a pickup from your nearest Big Bean Café, or choose delivery where available.' },
  { q: 'When will my pickup order be ready?', a: 'Estimated prep time is shown at checkout. You\'ll receive a notification when your order is ready to collect.' },
]

export default function AppPage() {
  const [data, setData] = useState<AppPromoData>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/app-promos/active`)
      .then(r => r.json())
      .then(d => {
        const items: AppPromoData[] = d.data || []
        if (items.length > 0) setData(items[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const features = [data.feature_1, data.feature_2, data.feature_3, data.feature_4].filter(Boolean) as string[]
  const qrUrl     = getImageUrl(data.qr_image)
  const mockupUrl = getImageUrl(data.mockup_image)
  const bgUrl     = getImageUrl(data.background_image)
  const orderUrl  = data.order_url || 'https://bigbeancafe.store'
  const gpUrl     = data.google_play_url || '#'
  const asUrl     = data.app_store_url || '#'

  const heroBg = bgUrl
    ? `linear-gradient(135deg,rgba(42,18,11,0.90),rgba(58,28,16,0.86)), url(${bgUrl}) center/cover no-repeat`
    : 'linear-gradient(135deg,#2A120B 0%,#3D1F0D 45%,#5A2C18 100%)'

  const toggleFaq = (i: number) => setOpenFaq(prev => prev === i ? null : i)

  return (
    <div className={s.page}>
      <Header />
      <main>

        {/* ── Hero ── */}
        <section className={s.hero} style={{ background: heroBg }}>
          <div className={s.heroDots} />
          <div className={s.heroGlow} />
          <div className={s.heroInner}>

            {/* Left */}
            <div className={s.heroLeft}>
              <div className={s.heroEyebrow}>
                <span className={s.heroEyebrowDot} />
                <span className={s.heroEyebrowText}>{data.eyebrow || 'BIG BEAN CAFÉ APP'}</span>
              </div>
              <h1 className={`font-heading ${s.heroTitle}`}>
                {loading ? (
                  <>The Big Bean Café <span className={s.heroTitleGold}>App Experience</span></>
                ) : (
                  data.title
                )}
              </h1>
              {data.subtitle && (
                <p className={s.heroSubtitle}>{data.subtitle}</p>
              )}
              <p className={s.heroDesc}>{HERO_DESC}</p>
              <div className={s.heroBadges}>
                <a href={gpUrl} target="_blank" rel="noopener noreferrer"
                  aria-label="Get it on Google Play" className={s.heroBadgeLink}>
                  <Image src="/images/app/google-play-badge.png" alt="Get it on Google Play"
                    width={190} height={58} className="h-[58px] w-[190px] object-contain" />
                </a>
                <a href={asUrl} target="_blank" rel="noopener noreferrer"
                  aria-label="Download on the App Store" className={s.heroBadgeLink}>
                  <Image src="/images/app/app-store-badge.png" alt="Download on the App Store"
                    width={190} height={58} className="h-[58px] w-[190px] object-contain" />
                </a>
                <a href={orderUrl} target="_blank" rel="noopener noreferrer" className={s.heroOrderBtn}>
                  {data.button_text || 'Order Online Now'} <ArrowRight size={15} />
                </a>
              </div>
            </div>

            {/* Right: floating mockup */}
            <div className={s.heroRight}>
              <div className={s.mockupGlow} />
              {mockupUrl ? (
                <img src={mockupUrl} alt="App mockup" className={s.mockupFloat} />
              ) : (
                <div className={s.mockupFallback}>
                  <Smartphone size={80} color="rgba(255,247,237,0.5)" />
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,247,237,0.4)', fontWeight: 700, textTransform: 'uppercase', textAlign: 'center', padding: '0 1.2rem', letterSpacing: '0.1em' }}>
                    App Preview
                  </span>
                </div>
              )}
              <div className={s.mockupRingGlow} />
            </div>

          </div>
        </section>

        {/* ── App Intro Banner ── */}
        <section className={s.introBanner}>
          <div className={s.introInner}>
            <div className={s.introText}>
              <p className={s.eyebrowLabel} style={{ marginBottom: '0.6rem' }}>BIG BEAN CAFÉ APP</p>
              <h2 className={`font-heading ${s.introTitle}`}>
                Your new go-to for<br />all things Big Bean Café
              </h2>
              <p className={s.introSub}>
                With our app, you can order faster, unlock rewards, explore offers, and enjoy a smoother café experience — whether you&apos;re dining in, taking away, or ordering delivery.
              </p>
            </div>
            <div className={s.introVisual}>
              {mockupUrl ? (
                <img src={mockupUrl} alt="Big Bean Café App" className={s.introVisualImg} />
              ) : bgUrl ? (
                <img src={bgUrl} alt="Big Bean Café" className={s.introVisualImg} />
              ) : (
                <div className={s.introVisualFallback}>
                  <Coffee size={52} color="rgba(255,247,237,0.65)" />
                  <span className={s.introBannerFallbackText}>Big Bean Café<br />Order Smarter</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 3 Feature Blocks ── */}
        <section className={s.blockSection}>
          <div className={s.inner}>
            <div className={s.sectionHead}>
              <p className={s.eyebrowLabel}>What You Get</p>
              <h2 className={`font-heading ${s.sectionTitle}`}>Discover. Choose. Earn.</h2>
              <p className={s.sectionSub}>Everything you love about Big Bean Café, now in your pocket.</p>
            </div>
            <div className={s.blockGrid}>
              {BLOCK_FEATURES.map((feat, i) => (
                <div key={i} className={s.blockCard}>
                  <div className={s.blockIconWrap}>
                    <feat.icon size={30} color="#A92517" />
                  </div>
                  <p className={s.blockCardLabel}>{feat.label}</p>
                  <h3 className={`font-heading ${s.blockCardTitle}`}>{feat.title}</h3>
                  <p className={s.blockCardDesc}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Key Features from Admin ── */}
        {features.length > 0 && (
          <section className={s.sectionLight}>
            <div className={s.inner}>
              <div className={s.sectionHead}>
                <p className={s.eyebrowLabel}>App Highlights</p>
                <h2 className={`font-heading ${s.sectionTitle}`}>Key Features</h2>
              </div>
              <div className={s.featureGrid}>
                {features.map((f, i) => (
                  <div key={i} className={s.featureCard}>
                    <span className={s.featureIconCircle}>
                      <Check size={16} color="#A92517" strokeWidth={3} />
                    </span>
                    <span className={s.featureText}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── QR Section ── */}
        <section className={s.qrSection}>
          <div className={s.qrInner}>
            <div className={s.qrCard}>
              {qrUrl ? (
                <img src={qrUrl} alt="QR Code" className={s.qrImg} />
              ) : (
                <div className={s.qrImgFallback}>
                  <QrCode size={80} color="#C9943A" />
                </div>
              )}
              <p className={s.qrBadge}>SCAN TO ORDER ONLINE</p>
              <p className={s.qrMini}>Menu &bull; Offers &bull; Rewards</p>
            </div>
            <div className={s.qrTextBlock}>
              <p className={s.eyebrowLabel} style={{ marginBottom: '0.6rem' }}>QR Ordering</p>
              <h2 className={`font-heading ${s.qrScanTitle}`}>Scan. Order. Enjoy.</h2>
              <p className={s.qrDesc}>
                Scan the QR at your table or counter to open the menu, place your order, and enjoy a smoother café experience — no app download required for in-café ordering.
              </p>
              <a href={orderUrl} target="_blank" rel="noopener noreferrer" className={s.orderBtn}>
                Order Online <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className={s.sectionCream}>
          <div className={s.inner}>
            <div className={s.sectionHead}>
              <p className={s.eyebrowLabel}>Simple Steps</p>
              <h2 className={`font-heading ${s.sectionTitle}`}>How It Works</h2>
              <p className={s.sectionSub}>Get started in three simple steps</p>
            </div>
            <div className={s.howGrid}>
              {HOW_STEPS.map(step => (
                <div key={step.step} className={s.howCard}>
                  <div className={s.howStep}>{step.step}</div>
                  <h3 className={s.howCardTitle}>{step.title}</h3>
                  <p className={s.howCardDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className={s.faqSection}>
          <div className={s.inner}>
            <div className={s.sectionHead}>
              <p className={s.eyebrowLabel}>Got Questions?</p>
              <h2 className={`font-heading ${s.sectionTitle}`}>Frequently Asked Questions</h2>
              <p className={s.sectionSub}>Everything you need to know about the Big Bean Café app.</p>
            </div>
            <div className={s.faqList}>
              {FAQS.map((faq, i) => (
                <div key={i} className={s.faqItem}>
                  <button className={s.faqQuestion} onClick={() => toggleFaq(i)} aria-expanded={openFaq === i}>
                    <span className={s.faqQuestionText}>{faq.q}</span>
                    <span className={`${s.faqIcon} ${openFaq === i ? s.faqIconOpen : ''}`}>
                      <Plus size={14} strokeWidth={3} />
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className={s.faqAnswer}>{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Download CTA ── */}
        <section className={s.ctaSection}>
          <div className={s.ctaDots} />
          <div className={s.ctaGlow} />
          <span className={`${s.ctaBean} ${s.ctaBeanOne}`} />
          <span className={`${s.ctaBean} ${s.ctaBeanTwo}`} />
          <span className={`${s.ctaBean} ${s.ctaBeanThree}`} />

          <div className={s.ctaCard}>
            <div className={s.ctaSteam}>
              <span />
              <span />
              <span />
            </div>

            <p className={s.ctaMiniBadge}>BIG BEAN CAFÉ APP</p>

            <h2 className={`font-heading ${s.ctaTitle}`}>
              Ready to order your Big Bean favourites?
            </h2>

            <p className={s.ctaSubtitle}>
              Download the app or order online now. Big Bean Café — your café, your way.
            </p>

            <div className={s.ctaBadges}>
              <a href={gpUrl} target="_blank" rel="noopener noreferrer"
                aria-label="Get it on Google Play" className={s.ctaBadgeLink}>
                <Image src="/images/app/google-play-badge.png" alt="Get it on Google Play"
                  width={180} height={54} className="h-auto w-[150px] object-contain sm:h-[54px] sm:w-[180px]" />
              </a>
              <a href={asUrl} target="_blank" rel="noopener noreferrer"
                aria-label="Download on the App Store" className={s.ctaBadgeLink}>
                <Image src="/images/app/app-store-badge.png" alt="Download on the App Store"
                  width={180} height={54} className="h-auto w-[150px] object-contain sm:h-[54px] sm:w-[180px]" />
              </a>
              <a href={orderUrl} target="_blank" rel="noopener noreferrer" className={s.ctaOrderBtn}>
                {data.button_text || 'Order Online Now'} <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
