'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import Link from 'next/link'
import {
  Briefcase, Coffee, Users, CheckCircle, Mail, MapPin,
  Building2, BookOpen, Gift, ChevronRight, ArrowRight,
  Sparkles, BadgeCheck, Store, UtensilsCrossed, Star,
  ChevronDown, ChevronUp, Clock
} from 'lucide-react'
import { getPublicSettings, formatPhoneForTel, CONTACT_DEFAULTS, type PublicContactSettings } from '@/lib/publicSettings'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

interface CorporateHero {
  eyebrow: string; title: string; highlight_text: string | null; subtitle: string | null
  button_primary_text: string; button_primary_url: string
  button_secondary_text: string; button_secondary_url: string
  image: string | null
  stat_1_value: string; stat_1_label: string
  stat_2_value: string; stat_2_label: string
  stat_3_value: string; stat_3_label: string
}

const defaultHero: CorporateHero = {
  eyebrow: 'CORPORATE ORDERS',
  title: 'Premium Coffee Solutions',
  highlight_text: 'for Modern Workplaces',
  subtitle: 'From office coffee requirements to event catering, meetings, bulk orders and custom café solutions — Big Bean Café brings quality, freshness and service to your business.',
  button_primary_text: 'Request Corporate Quote', button_primary_url: '#corporate-form',
  button_secondary_text: 'Explore Solutions', button_secondary_url: '#corporate-solutions',
  image: null,
  stat_1_value: 'Bulk', stat_1_label: 'Orders',
  stat_2_value: 'Events', stat_2_label: 'Catering',
  stat_3_value: 'Custom', stat_3_label: 'Solutions',
}

const SOLUTIONS = [
  { icon: Coffee, title: 'Office Coffee Supply', desc: 'Regular coffee, beverages and snacks for your team and office pantry.' },
  { icon: UtensilsCrossed, title: 'Bulk Beverage Orders', desc: 'Large-quantity orders for corporate events, launches and office requirements.' },
  { icon: Users, title: 'Event Catering', desc: 'Professional catering for corporate events, product launches and conferences.' },
  { icon: Store, title: 'Coffee Beans & Merchandise', desc: 'Curated coffee beans, drip packs and branded Big Bean merchandise.' },
  { icon: Briefcase, title: 'Meeting Refreshments', desc: 'Freshly prepared refreshments for meetings, board sessions and workshops.' },
  { icon: Gift, title: 'Custom Corporate Packages', desc: 'Tailored menu, quantity and packaging based on your exact requirements.' },
]

const USE_CASES = [
  { icon: Building2, title: 'Office Pantry', desc: 'Daily coffee and snack replenishment for a productive workspace.' },
  { icon: Users, title: 'Team Meetings', desc: 'Curated refreshment boxes for huddles, reviews and client meetings.' },
  { icon: Sparkles, title: 'Events & Workshops', desc: 'Live beverage counters and packaged boxes for corporate gatherings.' },
  { icon: Gift, title: 'Gifting / Bulk Coffee', desc: 'Branded coffee hampers, drip packs and festive gift boxes at scale.' },
]

const WHO_WE_SERVE = [
  { icon: Building2, title: 'Offices & IT Companies', desc: 'Daily coffee supplies and pantry management for corporate offices.' },
  { icon: Users, title: 'Co-working Spaces', desc: 'Flexible bulk orders for shared workspaces with changing team sizes.' },
  { icon: BookOpen, title: 'Colleges & Institutions', desc: 'Café-quality beverages for campus events, canteens and faculty lounges.' },
  { icon: Sparkles, title: 'Events & Workshops', desc: 'Live catering and beverage setups for corporate events and workshops.' },
  { icon: Briefcase, title: 'Corporate Meetings', desc: 'Freshly curated refreshment boxes for your important business meetings.' },
  { icon: Gift, title: 'Gifting & Hampers', desc: 'Curated coffee hampers and gift boxes for clients, employees and occasions.' },
]

const WHY_US = [
  { icon: BadgeCheck, title: 'Freshly Prepared Menu', desc: 'Every item freshly prepared by our kitchen team with quality ingredients.' },
  { icon: Store, title: 'Scalable Bulk Orders', desc: 'From 20 to 2000+ servings — we scale to your order size and timeline.' },
  { icon: Sparkles, title: 'Custom Packages', desc: 'Menu curated and quantities planned based on your specific business requirement.' },
  { icon: Users, title: 'Professional Coordination', desc: 'Dedicated team to coordinate, confirm and execute your order seamlessly.' },
  { icon: MapPin, title: 'Multiple Outlet Support', desc: 'Served from our network of café outlets for better reach and fresh preparation.' },
  { icon: CheckCircle, title: 'Reliable Delivery Planning', desc: 'Planned delivery schedule with lead time coordination and delivery confirmation.' },
]

const PACKAGES = [
  {
    name: 'Team Coffee Break',
    tag: 'Office Daily',
    desc: 'For daily office coffee and snack requirements.',
    items: ['Filtered coffee / cold brew selection', 'Snack boxes (cookies, crackers, bites)', 'Custom frequency — daily, weekly', 'Quantity starting from 10 servings'],
    cta: 'Request Quote',
  },
  {
    name: 'Meeting & Event Box',
    tag: 'Most Requested',
    desc: 'For meetings, product launches and workshops.',
    items: ['Hot & cold beverage combo', 'Curated snack and light bite boxes', 'Branded packaging available', 'Coordination for on-site events'],
    cta: 'Request Quote',
    highlight: true,
  },
  {
    name: 'Custom Corporate Plan',
    tag: 'Enterprise',
    desc: 'Tailored menu and quantity based on requirement.',
    items: ['Full menu customisation', 'Dedicated account coordination', 'Repeat order scheduling', 'Special occasion packaging'],
    cta: 'Request Quote',
  },
]

const TIMELINE = [
  { n: 1, title: 'Share Requirement', desc: 'Fill our corporate order form with your needs, quantities and delivery details.' },
  { n: 2, title: 'Team Discussion', desc: 'Our business team reaches out within 24 hours to discuss and clarify.' },
  { n: 3, title: 'Custom Quote', desc: 'We send a tailored quote based on your order type, quantity and location.' },
  { n: 4, title: 'Order Confirmation', desc: 'Confirm the quote and finalise your order with our coordination team.' },
  { n: 5, title: 'Preparation & Delivery', desc: 'Your order is freshly prepared and delivered on your scheduled date.' },
  { n: 6, title: 'Feedback & Repeat Plan', desc: 'We follow up on satisfaction and set up a repeat plan if needed.' },
]

const FAQ = [
  { q: 'What is the minimum order size?', a: 'Corporate orders start from 10 servings or ₹10,000, depending on the menu and delivery location. Larger events can be scaled to thousands of servings.' },
  { q: 'How much lead time is required?', a: 'We recommend at least 3 days from confirmation for standard orders and 7–10 days for large events or custom packaging.' },
  { q: 'Can you customise the menu for dietary needs?', a: 'Yes. We can tailor vegetarian, vegan, sugar-free and allergen-aware options based on your team requirements.' },
  { q: 'Do you deliver to multiple office locations?', a: 'Yes. We support multi-location delivery across Bangalore and can coordinate schedules for all your office sites.' },
  { q: 'Is branded packaging available?', a: 'Yes. Branded boxes, labels and corporate messages can be included for gifting and event orders on request.' },
]

const ORDER_SNAPSHOT = [
  ['Min. Order', '10 servings / ₹10,000'],
  ['Response Time', 'Within 24 hours'],
  ['Delivery Lead Time', '3+ days from confirmation'],
  ['Custom Menu', 'Available on request'],
  ['Multiple Locations', 'Supported'],
]

const ORDER_TYPES = [
  'Office Coffee Supply', 'Bulk Beverage Order', 'Event Catering', 'Meeting Refreshments', 'Corporate Gifting', 'Custom Solution'
]

const BUDGET_RANGES = [
  '₹10,000 – ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', 'Above ₹1,00,000', 'Need guidance'
]

const emptyForm = {
  companyName: '', contactPerson: '', email: '', phone: '',
  orderType: '', quantity: '', deliveryDate: '', deliveryAddress: '',
  budgetRange: '', requirements: ''
}

function getHeroUrl(image?: string | null) {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

function FadeIn({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function CorporateOrders() {
  const [hero, setHero] = useState<CorporateHero | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submittedEnquiry, setSubmittedEnquiry] = useState<{
    companyName: string; contactPerson: string; email: string; phone: string; orderType: string
  } | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [pubSettings, setPubSettings] = useState<PublicContactSettings>(CONTACT_DEFAULTS)

  useEffect(() => {
    fetch(`${API_URL}/corporate-hero/active`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setHero(d.data) })
      .catch(() => {})
    getPublicSettings().then(setPubSettings).catch(() => {})
  }, [])

  const h = hero || defaultHero
  const heroImageUrl = getHeroUrl(h.image)

  const inputClass =
    'w-full rounded-2xl border border-[#E6C7A8] bg-white px-4 py-3.5 text-sm text-[#1E0F09] placeholder:text-[#A9866F] shadow-sm focus:border-[#C9943A] focus:ring-4 focus:ring-[#C9943A]/15 focus:outline-none transition-all appearance-none'
  const labelClass = 'block text-[0.7rem] font-black uppercase tracking-[0.12em] text-[#3D1F0D] mb-2'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (submitError) setSubmitError('')
  }

  const getMinDate = () => {
    const d = new Date(); d.setDate(d.getDate() + 3)
    return d.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.companyName.trim() || !formData.contactPerson.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.orderType) {
      setSubmitError('Company name, contact person, email, phone and order type are required.')
      return
    }
    setIsSubmitting(true); setSubmitError('')
    try {
      const res = await fetch(`${API_URL}/corporate-enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.companyName,
          contact_person: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          order_type: formData.orderType,
          quantity: formData.quantity,
          delivery_date: formData.deliveryDate || null,
          delivery_address: formData.deliveryAddress,
          budget_range: formData.budgetRange,
          requirements: formData.requirements,
        })
      })
      const data = await res.json()
      if (data.success) {
        setSubmittedEnquiry({
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          orderType: formData.orderType,
        })
        setIsSubmitted(true)
        setFormData(emptyForm)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setSubmitError(data.message || 'Failed to submit. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted && submittedEnquiry) {
    return (
      <div className="min-h-screen" style={{ background: '#FFF7ED' }}>
        <Header />
        <main className="flex items-center justify-center min-h-[80vh] px-4 py-20">
          <FadeIn className="w-full max-w-lg">
            <div className="rounded-[32px] border border-[#E6C7A8] bg-white p-8 md:p-10 text-center shadow-2xl">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg,#C9943A,#8B4A2F)' }}>
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="font-heading text-3xl font-black text-[#120905] mb-2">Corporate Enquiry Submitted!</h1>
              <p className="text-sm font-bold text-[#C9943A] mb-6">Corporate Order Enquiry Received</p>
              <div className="rounded-2xl border border-[#E6C7A8] bg-[#FBF4EC] p-5 mb-6 text-left space-y-3">
                <div className="flex justify-between text-sm"><span className="font-semibold text-[#6B3520]">Company</span><span className="text-[#3D1F0D]">{submittedEnquiry.companyName}</span></div>
                <div className="flex justify-between text-sm"><span className="font-semibold text-[#6B3520]">Contact Person</span><span className="text-[#3D1F0D]">{submittedEnquiry.contactPerson}</span></div>
                <div className="flex justify-between text-sm"><span className="font-semibold text-[#6B3520]">Order Type</span><span className="text-[#3D1F0D]">{submittedEnquiry.orderType}</span></div>
                <div className="flex justify-between text-sm"><span className="font-semibold text-[#6B3520]">Email</span><span className="text-[#3D1F0D]">{submittedEnquiry.email}</span></div>
              </div>
              <p className="text-sm text-[#6B3520] mb-8">Our business team will review your requirement and contact you within 24 hours.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => { setIsSubmitted(false); setSubmittedEnquiry(null) }}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                  Submit Another Enquiry
                </button>
                <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#C9943A] px-6 py-3 text-sm font-black text-[#8B4A2F] transition-all hover:bg-[#C9943A]/10">
                  Back to Home
                </Link>
              </div>
            </div>
          </FadeIn>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#FFF7ED' }}>
      <Header />
      <main>

        {/* ── HERO ── */}
        <section className="relative flex h-[480px] overflow-hidden md:h-[520px] lg:h-[560px] xl:h-[600px]" style={{ background: '#0A0503' }}>
          {heroImageUrl && (
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={heroImageUrl}
                alt={h.title}
                className="h-full w-full object-cover object-center"
                style={{ filter: 'brightness(1.03) contrast(1.05) saturate(1.04)' }}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#180A04]/70 via-[#180A04]/45 to-[#180A04]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#180A04]/40 to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-[520px] w-[520px] rounded-full bg-[#C9943A]/12 blur-[140px]" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-[420px] w-[420px] rounded-full bg-[#8B4A2F]/14 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, #C9943A 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center px-5 sm:px-6 lg:px-8">
            <div className="grid w-full items-center gap-8 lg:grid-cols-2">
              <div className="animate-fade-up">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C9943A]/25 bg-[#C9943A]/10 px-3.5 py-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#C9943A]" />
                  <span className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-[#F6D58D]">{h.eyebrow}</span>
                </div>
                <h1 className="font-heading text-[38px] font-black leading-[0.95] text-[#FFF7ED] mb-5 md:text-[52px] lg:text-[60px]">
                  {h.title}
                  {h.highlight_text && <span className="block text-[#C9943A]">{h.highlight_text}</span>}
                </h1>
                {h.subtitle && <p className="mb-4 max-w-[600px] text-sm leading-relaxed text-[#F5D7BF] md:text-base">{h.subtitle}</p>}
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={h.button_primary_url}
                    className="inline-flex items-center gap-2 rounded-full font-black uppercase tracking-[0.08em] text-[0.8rem] text-[#120905] shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                    style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)', padding: '0.85rem 1.75rem' }}>
                    {h.button_primary_text} <ChevronRight className="h-4 w-4" />
                  </a>
                  <a href={h.button_secondary_url}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 font-black uppercase tracking-[0.08em] text-[0.8rem] text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
                    style={{ padding: '0.85rem 1.75rem' }}>
                    {h.button_secondary_text} <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="hidden animate-fade-up-delay lg:flex lg:flex-col lg:gap-3">
                <div className="animate-float-soft rounded-[24px] border border-[#C9943A]/20 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-[#C9943A]">Corporate Coffee Desk</p>
                  {['Office coffee supplies', 'Bulk beverage orders', 'Event catering', 'Custom menu planning'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 border-b py-2 last:border-0" style={{ borderColor: 'rgba(201,148,58,0.12)' }}>
                      <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-[#C9943A]" />
                      <span className="text-xs text-[#F5E6D3]">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[[h.stat_1_value, h.stat_1_label], [h.stat_2_value, h.stat_2_label], [h.stat_3_value, h.stat_3_label]].map(([val, lbl], i) => (
                    <div key={i} className="h-auto min-h-0 rounded-xl border border-[#C9943A]/20 bg-white/[0.05] py-3 px-2 text-center backdrop-blur-md">
                      <p className="text-lg font-black text-[#C9943A]">{val}</p>
                      <p className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-[#E6C7A8]">{lbl}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 grid grid-cols-3 border-t border-[#C9943A]/15 lg:hidden" style={{ background: 'rgba(12,6,3,0.9)' }}>
            {[[h.stat_1_value, h.stat_1_label], [h.stat_2_value, h.stat_2_label], [h.stat_3_value, h.stat_3_label]].map(([val, lbl], i) => (
              <div key={i} className="border-r border-[#C9943A]/10 py-3 text-center last:border-0">
                <p className="text-base font-black text-[#C9943A]">{val}</p>
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-[#E6C7A8]">{lbl}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CORPORATE SOLUTIONS ── */}
        <section id="corporate-solutions" className="py-20 px-5 sm:px-6 lg:px-8" style={{ background: '#FFF7ED' }}>
          <div className="mx-auto max-w-7xl">
            <FadeIn className="mb-14 text-center">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#C9943A]">What We Offer</p>
              <h2 className="font-heading text-3xl font-black text-[#120905] md:text-4xl mb-4">Corporate Solutions</h2>
              <p className="mx-auto max-w-2xl text-sm text-[#6B3520]">From daily office coffee to large-scale event catering — we have a solution for every corporate requirement.</p>
            </FadeIn>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SOLUTIONS.map((s, i) => (
                <FadeIn key={i} delay={i * 80}>
                  <div className="group h-full rounded-3xl border border-[#E6C7A8] bg-[#FBF4EC] p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C9943A]/20 bg-gradient-to-br from-[#C9943A]/15 to-[#8B4A2F]/15 transition-transform group-hover:scale-110">
                      <s.icon className="h-6 w-6 text-[#C9943A]" />
                    </div>
                    <h3 className="mb-2 text-lg font-black text-[#120905]">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-[#6B3520]">{s.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── USE CASES ── */}
        <section className="py-20 px-5 sm:px-6 lg:px-8" style={{ background: '#FBF4EC' }}>
          <div className="mx-auto max-w-7xl">
            <FadeIn className="mb-14 text-center">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#C9943A]">Use Cases</p>
              <h2 className="font-heading text-3xl font-black text-[#120905] md:text-4xl mb-4">Perfect For Every Workplace Moment</h2>
              <p className="mx-auto max-w-2xl text-sm text-[#6B3520]">Office pantry, team meetings, workshops or corporate gifting — we make every coffee moment count.</p>
            </FadeIn>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {USE_CASES.map((u, i) => (
                <FadeIn key={i} delay={i * 80}>
                  <div className="h-full rounded-3xl border border-[#E6C7A8] bg-[#FFF7ED] p-7 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C9943A]/20 bg-gradient-to-br from-[#C9943A]/15 to-[#8B4A2F]/15">
                      <u.icon className="h-6 w-6 text-[#C9943A]" />
                    </div>
                    <h3 className="mb-2 text-base font-black text-[#120905]">{u.title}</h3>
                    <p className="text-sm leading-relaxed text-[#6B3520]">{u.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHO WE SERVE ── */}
        <section className="py-20 px-5 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg,#120905,#1A0D07,#3D1F0D)' }}>
          <div className="mx-auto max-w-7xl">
            <FadeIn className="mb-14 text-center">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#C9943A]">Who We Serve</p>
              <h2 className="font-heading text-3xl font-black text-[#FFF7ED] md:text-4xl mb-4">Trusted by Businesses of All Sizes</h2>
              <p className="mx-auto max-w-xl text-sm text-[#E6C7A8]">We partner with businesses across industries to deliver quality café experiences at scale.</p>
            </FadeIn>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {WHO_WE_SERVE.map((w, i) => (
                <FadeIn key={i} delay={i * 70}>
                  <div className="flex gap-4 rounded-3xl border border-[#C9943A]/15 bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:bg-white/[0.05]">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9943A]/15 to-[#8B4A2F]/15">
                      <w.icon className="h-5 w-5 text-[#C9943A]" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-black text-[#F5E6D3]">{w.title}</h3>
                      <p className="text-xs leading-relaxed text-[#E6C7A8]">{w.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY BIG BEAN ── */}
        <section className="py-20 px-5 sm:px-6 lg:px-8" style={{ background: '#FBF4EC' }}>
          <div className="mx-auto max-w-7xl">
            <FadeIn className="mb-14 text-center">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#C9943A]">Why Big Bean Café</p>
              <h2 className="font-heading text-3xl font-black text-[#120905] md:text-4xl">Why Choose Us for Your Business</h2>
            </FadeIn>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_US.map((w, i) => (
                <FadeIn key={i} delay={i * 70}>
                  <div className="flex gap-4 rounded-3xl border border-[#E6C7A8] bg-[#FFF7ED] p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9943A]/15 to-[#8B4A2F]/15">
                      <w.icon className="h-5 w-5 text-[#C9943A]" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-black text-[#120905]">{w.title}</h3>
                      <p className="text-xs leading-relaxed text-[#6B3520]">{w.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── PACKAGES ── */}
        <section className="py-20 px-5 sm:px-6 lg:px-8" style={{ background: '#FFF7ED' }}>
          <div className="mx-auto max-w-7xl">
            <FadeIn className="mb-14 text-center">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#C9943A]">Our Packages</p>
              <h2 className="font-heading text-3xl font-black text-[#120905] md:text-4xl mb-4">Corporate Package Options</h2>
              <p className="mx-auto max-w-xl text-sm text-[#6B3520]">Custom quote based on quantity, menu and delivery location.</p>
            </FadeIn>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PACKAGES.map((pkg, i) => (
                <FadeIn key={i} delay={i * 90}>
                  <div className={`relative flex h-full flex-col rounded-3xl border p-7 transition-all hover:-translate-y-1 hover:shadow-xl ${pkg.highlight ? 'shadow-lg' : ''}`}
                    style={{ background: pkg.highlight ? 'linear-gradient(135deg,#120905,#3D1F0D)' : '#FBF4EC', borderColor: pkg.highlight ? 'rgba(201,148,58,0.35)' : '#E6C7A8' }}>
                    {pkg.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black text-white" style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                          <Star className="h-3 w-3" /> {pkg.tag}
                        </span>
                      </div>
                    )}
                    {!pkg.highlight && <span className="mb-4 text-xs font-black text-[#C9943A]">{pkg.tag}</span>}
                    <h3 className="mb-2 font-heading text-xl font-black" style={{ color: pkg.highlight ? '#FFF7ED' : '#120905' }}>{pkg.name}</h3>
                    <p className="mb-5 text-sm leading-relaxed" style={{ color: pkg.highlight ? '#E6C7A8' : '#6B3520' }}>{pkg.desc}</p>
                    <ul className="mb-6 flex-1 space-y-2">
                      {pkg.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs" style={{ color: pkg.highlight ? '#F5E6D3' : '#6B3520' }}>
                          <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#C9943A]" />{item}
                        </li>
                      ))}
                    </ul>
                    <p className="mb-5 text-xs italic" style={{ color: pkg.highlight ? '#E6C7A8' : '#8B4A2F' }}>Custom quote based on quantity and location.</p>
                    <a href="#corporate-form"
                      className="mt-auto block rounded-2xl py-3 text-center text-sm font-black transition-all hover:-translate-y-0.5"
                      style={{ background: pkg.highlight ? 'linear-gradient(to right,#C9943A,#8B4A2F)' : 'transparent', color: pkg.highlight ? '#fff' : '#C9943A', border: pkg.highlight ? 'none' : '2px solid #C9943A' }}>
                      {pkg.cta}
                    </a>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="py-20 px-5 sm:px-6 lg:px-8" style={{ background: '#FBF4EC' }}>
          <div className="mx-auto max-w-5xl">
            <FadeIn className="mb-14 text-center">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#C9943A]">How It Works</p>
              <h2 className="font-heading text-3xl font-black text-[#120905] md:text-4xl">From Enquiry to Delivery</h2>
            </FadeIn>
            <div className="space-y-4">
              {TIMELINE.map((step, i) => (
                <FadeIn key={i} delay={i * 70}>
                  <div className="flex items-start gap-5 rounded-3xl border border-[#E6C7A8] bg-[#FFF7ED] p-6 transition-all hover:shadow-md">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#C9943A,#8B4A2F)' }}>
                      {step.n}
                    </div>
                    <div>
                      <h3 className="mb-1 text-sm font-black text-[#120905]">{step.title}</h3>
                      <p className="text-xs leading-relaxed text-[#6B3520]">{step.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 px-5 sm:px-6 lg:px-8" style={{ background: '#FFF7ED' }}>
          <div className="mx-auto max-w-3xl">
            <FadeIn className="mb-14 text-center">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#C9943A]">FAQ</p>
              <h2 className="font-heading text-3xl font-black text-[#120905] md:text-4xl">Common Questions</h2>
            </FadeIn>
            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <FadeIn key={i} delay={i * 60}>
                  <div className="rounded-3xl border border-[#E6C7A8] bg-[#FBF4EC] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-[#FFF7ED]"
                    >
                      <span className="pr-4 text-sm font-black text-[#120905]">{item.q}</span>
                      {openFaq === i ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-[#C9943A]" /> : <ChevronDown className="h-4 w-4 flex-shrink-0 text-[#C9943A]" />}
                    </button>
                    {openFaq === i && (
                      <div className="border-t border-[#E6C7A8] px-5 py-4">
                        <p className="text-sm leading-relaxed text-[#6B3520]">{item.a}</p>
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORM ── */}
        <section id="corporate-form" className="py-20 px-5 sm:px-6 lg:px-8" style={{ background: '#FBF4EC' }}>
          <div className="mx-auto max-w-7xl">
            <FadeIn className="mb-14 text-center">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#C9943A]">Get Started</p>
              <h2 className="font-heading text-3xl font-black text-[#120905] md:text-4xl mb-4">Request Corporate Quote</h2>
              <p className="mx-auto max-w-xl text-sm text-[#6B3520]">Fill in your business details and our team will reach out within 24 hours with a tailored quote.</p>
            </FadeIn>

            <div className="grid items-start gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <FadeIn>
                  <div className="rounded-[32px] border border-[#E6C7A8] bg-white p-6 shadow-2xl md:p-8">
                    {submitError && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{submitError}</div>}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Company Name <span className="text-red-500">*</span></label>
                          <input className={inputClass} name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Your company name" required />
                        </div>
                        <div>
                          <label className={labelClass}>Contact Person <span className="text-red-500">*</span></label>
                          <input className={inputClass} name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Your name" required />
                        </div>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                          <input className={inputClass} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@company.com" required />
                        </div>
                        <div>
                          <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
                          <input className={inputClass} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required />
                        </div>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Order Type <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <select className={`${inputClass} pr-10`} name="orderType" value={formData.orderType} onChange={handleChange} required>
                              <option value="">Select order type</option>
                              {ORDER_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9866F]" />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Quantity / Servings</label>
                          <input className={inputClass} name="quantity" value={formData.quantity} onChange={handleChange} placeholder="e.g. 50 coffee and snacks" />
                        </div>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Delivery Date</label>
                          <input className={inputClass} type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} min={getMinDate()} />
                        </div>
                        <div>
                          <label className={labelClass}>Budget Range</label>
                          <div className="relative">
                            <select className={`${inputClass} pr-10`} name="budgetRange" value={formData.budgetRange} onChange={handleChange}>
                              <option value="">Select budget range</option>
                              {BUDGET_RANGES.map(r => <option key={r}>{r}</option>)}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A9866F]" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Delivery Address</label>
                        <textarea className={`${inputClass} resize-none`} name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} rows={2} placeholder="Delivery location or address..." />
                      </div>
                      <div>
                        <label className={labelClass}>Additional Requirements</label>
                        <textarea className={`${inputClass} resize-none`} name="requirements" value={formData.requirements} onChange={handleChange} rows={3} placeholder="Menu preferences, dietary requirements, special requests..." />
                      </div>
                      <button type="submit" disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                        {isSubmitting ? 'Submitting...' : <><span>Submit Corporate Enquiry</span><ArrowRight className="h-4 w-4" /></>}
                      </button>
                    </form>
                  </div>
                </FadeIn>
              </div>

              <div className="space-y-6 lg:col-span-2">
                <FadeIn delay={150}>
                  <div className="rounded-[28px] border border-[#C9943A]/25 p-6 shadow-xl" style={{ background: 'linear-gradient(135deg,#120905,#3D1F0D)' }}>
                    <div className="mb-5 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#C9943A]" />
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C9943A]">Order Snapshot</p>
                    </div>
                    {ORDER_SNAPSHOT.map(([k, v], i) => (
                      <div key={i} className="flex justify-between border-b py-3 text-sm last:border-0" style={{ borderColor: 'rgba(201,148,58,0.12)' }}>
                        <span className="text-[#E6C7A8]">{k}</span>
                        <span className="text-right font-semibold text-[#F5E6D3]">{v}</span>
                      </div>
                    ))}
                  </div>
                </FadeIn>
                <FadeIn delay={250}>
                  <div className="rounded-[28px] border border-[#E6C7A8] bg-[#FFF7ED] p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#C9943A]" />
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C9943A]">Contact Our Team</p>
                    </div>
                    <div className="space-y-4">
                      <a href={`mailto:${pubSettings.corporate_email}`} className="flex items-center gap-3 text-sm text-[#3D1F0D] transition-colors hover:text-[#C9943A]">
                        <Mail className="h-4 w-4 flex-shrink-0 text-[#C9943A]" />{pubSettings.corporate_email}
                      </a>
                      <div className="flex items-center gap-3 text-sm text-[#3D1F0D]">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-[#C9943A]" />Bangalore, India
                      </div>
                    </div>
                  </div>
                </FadeIn>
                <FadeIn delay={350}>
                  <div className="rounded-[28px] border border-[#E6C7A8] bg-white p-6">
                    <p className="mb-3 text-sm font-black text-[#120905]">Need a quick quote?</p>
                    <p className="mb-4 text-xs leading-relaxed text-[#6B3520]">Share the basics and our corporate team will call you back the same business day.</p>
                    <a href={`tel:${formatPhoneForTel(pubSettings.corporate_phone)}`} className="inline-flex items-center gap-2 rounded-full border-2 border-[#C9943A] px-5 py-2.5 text-xs font-black text-[#8B4A2F] transition-all hover:bg-[#C9943A]/10">
                      <PhoneIcon /> Call Us
                    </a>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 px-5 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg,#120905,#1A0D07,#3D1F0D)' }}>
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#C9943A]">Let&apos;s Brew Better Business</p>
              <h2 className="font-heading text-3xl font-black text-[#FFF7ED] md:text-4xl mb-4">Ready to Brew Better Business Moments?</h2>
              <p className="mb-10 text-sm text-[#E6C7A8]">Share your requirement with us and let our corporate team craft the perfect coffee experience for your business.</p>
              <div className="flex flex-col flex-wrap justify-center gap-4 sm:flex-row">
                <a href="#corporate-form" className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-black text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
                  style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                  Request Quote <ArrowRight className="h-4 w-4" />
                </a>
                <a href={`mailto:${pubSettings.corporate_email}`} className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#C9943A] px-8 py-4 text-sm font-black text-[#C9943A] transition-all hover:-translate-y-0.5 hover:bg-[#C9943A]/10">
                  <Mail className="h-4 w-4" /> {pubSettings.corporate_email}
                </a>
                <Link href="/outlets" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 text-sm font-black text-[#F5E6D3] transition-all hover:-translate-y-0.5 hover:bg-white/10">
                  Visit Outlets
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B4A2F]">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
