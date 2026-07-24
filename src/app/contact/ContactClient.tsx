'use client'

import { useEffect, useState } from 'react'
import { getPublicSettings, formatPhoneForTel, CONTACT_DEFAULTS, type PublicContactSettings } from '@/lib/publicSettings'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import {
  Phone, Mail, MapPin, Clock, MessageCircle, CheckCircle, Headphones, Building2, Store,
  Calendar, ChevronDown, ChevronUp, ArrowRight, Send, Navigation, ExternalLink
} from 'lucide-react'

interface ContactHero {
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

interface Outlet {
  id: number
  name: string
  address: string
  phone: string | null
  email: string | null
  opening_hours: string | null
  latitude: string | number | null
  longitude: string | number | null
  image: string | null
  status: string
  sort_order: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

const DEFAULT_HERO: ContactHero = {
  id: 0,
  eyebrow: 'CONTACT BIG BEAN CAFÉ',
  title: "Let’s Brew",
  highlight_text: 'Something Together',
  subtitle: 'Have a question, business enquiry, franchise interest or café feedback? Reach out to Big Bean Café and our team will connect with you.',
  button_primary_text: 'Send Enquiry',
  button_primary_url: '#contact-form',
  button_secondary_text: 'Find Outlet',
  button_secondary_url: '/outlets',
  image: null,
  stat_1_value: '7+',
  stat_1_label: 'Outlets',
  stat_2_value: 'Fast',
  stat_2_label: 'Support',
  stat_3_value: 'Daily',
  stat_3_label: 'Fresh Brews'
}

const contactCards = [
  {
    icon: Headphones,
    title: 'Customer Support',
    text: 'For order support, feedback and café experience',
    btn: 'Call Now',
    href: 'CONTACT_PHONE_PLACEHOLDER'
  },
  {
    icon: Building2,
    title: 'Business Enquiry',
    text: 'For franchise, corporate orders and collaborations',
    btn: 'Send Enquiry',
    href: '#contact-form'
  },
  {
    icon: Store,
    title: 'Visit an Outlet',
    text: 'Find your nearby Big Bean Café location',
    btn: 'View Outlets',
    href: '/outlets'
  },
  {
    icon: Calendar,
    title: 'Events & Workshops',
    text: 'For café events, workshops and brand tie-ups',
    btn: 'Contact Team',
    href: '#contact-form'
  }
]

const faqs = [
  {
    q: 'Where are Big Bean Café outlets located?',
    a: 'Visit our outlets page to find your nearest café with addresses, phone numbers and directions.'
  },
  {
    q: 'Can I place a corporate order?',
    a: 'Yes, share your requirement through the contact form and our corporate team will reach out.'
  },
  {
    q: 'How can I enquire about franchise opportunities?',
    a: 'Use the franchise enquiry option in the form or visit our franchise page for details.'
  },
  {
    q: 'Can I give feedback about an order or outlet?',
    a: 'Yes, choose Feedback in the enquiry form and we will review your message promptly.'
  }
]

export default function ContactPage() {
  const [hero, setHero] = useState<ContactHero>(DEFAULT_HERO)
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [loadingHero, setLoadingHero] = useState(true)
  const [loadingOutlets, setLoadingOutlets] = useState(true)
  const [pubSettings, setPubSettings] = useState<PublicContactSettings>(CONTACT_DEFAULTS)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    enquiryType: 'General Enquiry',
    preferredOutlet: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')
  const [submitError, setSubmitError] = useState(false)

  useEffect(() => {
    const loadHero = async () => {
      try {
        const res = await fetch(`${API_URL}/contact-hero/active`)
        const data = await res.json()
        if (data.success && data.data) setHero(data.data)
      } catch { }
      setLoadingHero(false)
    }
    const loadOutlets = async () => {
      try {
        const res = await fetch(`${API_URL}/outlets?status=active`)
        const data = await res.json()
        const list = (data.data || []).filter((o: Outlet) => o.status !== 'inactive')
        setOutlets(list.slice(0, 6))
      } catch { }
      setLoadingOutlets(false)
    }
    loadHero()
    loadOutlets()
    getPublicSettings().then(setPubSettings).catch(() => {})
  }, [])

  const heroImg = getImageUrl(hero.image)
  const h = hero || DEFAULT_HERO

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitMsg('')
    setSubmitError(false)
    try {
      const res = await fetch(`${API_URL}/contact-enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          enquiry_type: form.enquiryType,
          preferred_outlet: form.preferredOutlet,
          message: form.message
        })
      })
      const data = await res.json().catch(() => ({}))
      if (data.success) {
        setSubmitMsg('Thank you! Our team will contact you shortly.')
        setForm({ name: '', phone: '', email: '', enquiryType: 'General Enquiry', preferredOutlet: '', message: '' })
      } else {
        setSubmitError(true)
        setSubmitMsg(data.message || 'Unable to send right now. Please call us or try again later.')
      }
    } catch {
      setSubmitError(true)
      setSubmitMsg('Unable to send right now. Please call us or try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  const mapsLink = (o: Outlet) => {
    if (o.latitude && o.longitude) {
      return `https://www.google.com/maps?q=${o.latitude},${o.longitude}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`
  }

  return (
    <div className="min-h-screen" style={{ background: '#FBF4EC' }}>
      <Header />

      <main>
        {/* HERO */}
        <section className="relative flex items-center overflow-hidden min-h-[380px] md:min-h-[460px] lg:min-h-[520px]" style={{ padding: '5.5rem 0 4rem' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#120905] via-[#2A120B] to-[#5C2E12]" />
          {heroImg && (
            <img src={heroImg} alt={h.title} className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.9, filter: 'brightness(1.05) contrast(1.08) saturate(1.08)' }} />
          )}
          <div className="absolute inset-0" style={{
            background: `
              linear-gradient(90deg, rgba(18,9,5,0.86) 0%, rgba(18,9,5,0.72) 34%, rgba(18,9,5,0.42) 62%, rgba(18,9,5,0.22) 100%),
              linear-gradient(180deg, rgba(18,9,5,0.20) 0%, rgba(18,9,5,0.32) 55%, rgba(18,9,5,0.58) 100%)
            `
          }} />
          <div className="absolute right-0 top-0 w-[420px] h-[420px] md:w-[600px] md:h-[600px] rounded-full bg-[#C9943A]/15 blur-3xl" />
          <div className="absolute left-0 bottom-0 w-[300px] h-[300px] md:w-[480px] md:h-[480px] rounded-full bg-[#8B4A2F]/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #C9943A 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative z-10 w-full max-w-[1280px] mx-auto px-8" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
            <div style={{ maxWidth: 620 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C9943A]/35 bg-[#C9943A]/12 px-4 py-1.5 mb-6">
                <Mail style={{ width: 13, height: 13, color: '#C9943A' }} />
                <span className="text-[0.6rem] font-black tracking-[0.22em] uppercase" style={{ color: '#F7D891' }}>{h.eyebrow}</span>
              </div>

              <h1 className="font-heading font-black text-white mb-4" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 4.2rem)', lineHeight: 0.98 }}>
                {h.title}
                {h.highlight_text && <span className="block bg-gradient-to-r from-[#F6D58D] to-[#C9943A] bg-clip-text text-transparent">{h.highlight_text}</span>}
              </h1>

              <p className="text-[0.95rem] leading-relaxed mb-6" style={{ color: '#F5D7BF', maxWidth: 620, lineHeight: 1.7 }}>{h.subtitle}</p>

              <div className="flex flex-wrap gap-3 mb-8">
                <a href={h.button_primary_url} className="inline-flex items-center gap-2 rounded-full font-black uppercase tracking-[0.08em] text-[0.8rem] no-underline transition-all"
                  style={{ background: '#C9943A', color: '#120905', padding: '0.75rem 1.5rem', boxShadow: '0 10px 28px rgba(201,148,58,0.32)' }}>
                  <Send style={{ width: 14, height: 14 }} /> {h.button_primary_text}
                </a>
                <a href={h.button_secondary_url} className="inline-flex items-center gap-2 rounded-full font-black uppercase tracking-[0.08em] text-[0.8rem] no-underline transition-all border border-white/25 text-white"
                  style={{ padding: '0.75rem 1.5rem' }}>
                  {h.button_secondary_text} <ArrowRight style={{ width: 14, height: 14 }} />
                </a>
              </div>

              <div className="inline-flex rounded-[22px] border border-white/18 backdrop-blur-md overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
                {[
                  { val: h.stat_1_value, lbl: h.stat_1_label },
                  { val: h.stat_2_value, lbl: h.stat_2_label },
                  { val: h.stat_3_value, lbl: h.stat_3_label },
                ].map((s, i) => (
                  <div key={i} className="text-center px-4 py-2.5" style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
                    <div className="font-heading text-[1.05rem] font-black leading-tight" style={{ color: '#F6D58D' }}>{s.val}</div>
                    <div className="text-[0.58rem] font-bold uppercase tracking-[0.1em] mt-0.5" style={{ color: '#C7A489' }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block absolute right-[5%] bottom-[8%] max-w-[300px]" style={{ background: 'rgba(18,9,5,0.64)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 24, padding: '1.25rem', boxShadow: '0 24px 70px rgba(18,9,5,0.35)' }}>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,148,58,0.18)', border: '1px solid rgba(201,148,58,0.35)' }}>
                  <MessageCircle style={{ width: 18, height: 18, color: '#C9943A' }} />
                </div>
                <div>
                  <div className="font-black text-[0.82rem]" style={{ color: '#F6D58D' }}>We’re here to help</div>
                  <div className="text-[0.7rem] mt-0.5" style={{ color: 'rgba(199,164,137,0.85)' }}>Feedback • Franchise • Orders • Events</div>
                </div>
              </div>
              <p className="text-[0.72rem] leading-relaxed" style={{ color: 'rgba(245,215,191,0.75)' }}>
                Reach out for anything — our team will connect with you quickly.
              </p>
            </div>
          </div>
        </section>

        {/* QUICK CARDS */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 2rem' }}>
          <div className="text-center mb-10">
            <p className="text-[0.65rem] font-black tracking-[0.22em] uppercase mb-3" style={{ color: '#C9943A' }}>Quick Help</p>
            <h2 className="font-heading font-black text-[clamp(1.8rem,3.5vw,2.6rem)]" style={{ color: '#3D1F0D', lineHeight: 1.1 }}>How Can We Help?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((c, i) => {
              const href = c.href === 'CONTACT_PHONE_PLACEHOLDER'
                ? `tel:${formatPhoneForTel(pubSettings.contact_phone)}`
                : c.href
              return (
              <a key={i} href={href} className="group block rounded-[28px] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                style={{ background: '#FFF7ED', border: '1px solid #E6C7A8' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: 'rgba(201,148,58,0.12)', border: '1px solid rgba(201,148,58,0.25)' }}>
                  <c.icon style={{ width: 22, height: 22, color: '#C9943A' }} />
                </div>
                <h3 className="font-black text-[1.05rem] mb-2" style={{ color: '#3D1F0D' }}>{c.title}</h3>
                <p className="text-[0.82rem] leading-relaxed mb-4" style={{ color: '#6B3520' }}>{c.text}</p>
                <span className="inline-flex items-center gap-1 text-[0.7rem] font-black uppercase tracking-[0.08em]" style={{ color: '#C9943A' }}>
                  {c.btn} <ArrowRight style={{ width: 12, height: 12 }} />
                </span>
              </a>
              )
            })}
          </div>
        </section>

        {/* CONTACT FORM */}
        <section id="contact-form" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem 4rem' }}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            <div className="lg:col-span-3 rounded-[32px] p-6 md:p-8" style={{ background: '#FFF7ED', border: '1px solid #E6C7A8', boxShadow: '0 24px 70px rgba(61,31,13,0.08)' }}>
              <div className="mb-6">
                <p className="text-[0.65rem] font-black tracking-[0.22em] uppercase mb-2" style={{ color: '#C9943A' }}>Send a Message</p>
                <h2 className="font-heading font-black text-[clamp(1.6rem,3vw,2.2rem)]" style={{ color: '#3D1F0D', lineHeight: 1.1 }}>Get in Touch</h2>
              </div>

              {submitMsg && (
                <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-semibold ${submitError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {submitMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[0.75rem] font-black uppercase tracking-[0.1em] mb-2" style={{ color: '#3D1F0D' }}>Full Name *</label>
                    <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white border focus:border-[#C9943A] focus:ring-2 focus:ring-[#C9943A]/20"
                      style={{ borderColor: '#E6C7A8', color: '#3D1F0D' }} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-[0.75rem] font-black uppercase tracking-[0.1em] mb-2" style={{ color: '#3D1F0D' }}>Phone Number</label>
                    <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white border focus:border-[#C9943A] focus:ring-2 focus:ring-[#C9943A]/20"
                      style={{ borderColor: '#E6C7A8', color: '#3D1F0D' }} placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.75rem] font-black uppercase tracking-[0.1em] mb-2" style={{ color: '#3D1F0D' }}>Email Address *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white border focus:border-[#C9943A] focus:ring-2 focus:ring-[#C9943A]/20"
                    style={{ borderColor: '#E6C7A8', color: '#3D1F0D' }} placeholder="your@email.com" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[0.75rem] font-black uppercase tracking-[0.1em] mb-2" style={{ color: '#3D1F0D' }}>Enquiry Type</label>
                    <select value={form.enquiryType} onChange={e => setForm(p => ({ ...p, enquiryType: e.target.value }))}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white border focus:border-[#C9943A] focus:ring-2 focus:ring-[#C9943A]/20"
                      style={{ borderColor: '#E6C7A8', color: '#3D1F0D' }}>
                      <option>General Enquiry</option>
                      <option>Order Support</option>
                      <option>Franchise Enquiry</option>
                      <option>Corporate Orders</option>
                      <option>Events & Workshops</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[0.75rem] font-black uppercase tracking-[0.1em] mb-2" style={{ color: '#3D1F0D' }}>Preferred Outlet</label>
                    <select value={form.preferredOutlet} onChange={e => setForm(p => ({ ...p, preferredOutlet: e.target.value }))}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white border focus:border-[#C9943A] focus:ring-2 focus:ring-[#C9943A]/20"
                      style={{ borderColor: '#E6C7A8', color: '#3D1F0D' }}>
                      <option value="">Any outlet</option>
                      {outlets.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[0.75rem] font-black uppercase tracking-[0.1em] mb-2" style={{ color: '#3D1F0D' }}>Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white border focus:border-[#C9943A] focus:ring-2 focus:ring-[#C9943A]/20 resize-none"
                    style={{ borderColor: '#E6C7A8', color: '#3D1F0D' }} placeholder="Tell us more about your enquiry..." />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full rounded-full font-black uppercase tracking-[0.08em] text-[0.8rem] py-3.5 transition-all disabled:opacity-60"
                  style={{ background: '#C9943A', color: '#120905', boxShadow: '0 10px 28px rgba(201,148,58,0.32)' }}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="rounded-[32px] p-6 flex-1 flex flex-col justify-center" style={{ background: '#3D1F0D', color: '#FFF7ED' }}>
                <h3 className="font-heading font-black text-[1.4rem] mb-5">Contact Information</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,148,58,0.18)' }}>
                      <Phone style={{ width: 18, height: 18, color: '#C9943A' }} />
                    </div>
                    <div>
                      <div className="text-[0.65rem] font-black uppercase tracking-[0.12em] opacity-70 mb-0.5">Phone</div>
                      <a href={`tel:${formatPhoneForTel(pubSettings.contact_phone)}`} className="text-sm font-semibold hover:text-[#C9943A] transition-colors">{pubSettings.contact_phone}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,148,58,0.18)' }}>
                      <Mail style={{ width: 18, height: 18, color: '#C9943A' }} />
                    </div>
                    <div>
                      <div className="text-[0.65rem] font-black uppercase tracking-[0.12em] opacity-70 mb-0.5">Email</div>
                      <a href={`mailto:${pubSettings.contact_email}`} className="text-sm font-semibold hover:text-[#C9943A] transition-colors">{pubSettings.contact_email}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,148,58,0.18)' }}>
                      <Clock style={{ width: 18, height: 18, color: '#C9943A' }} />
                    </div>
                    <div>
                      <div className="text-[0.65rem] font-black uppercase tracking-[0.12em] opacity-70 mb-0.5">Hours</div>
                      <div className="text-sm font-semibold">Mon – Sat: 9 AM – 8 PM</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] p-6" style={{ background: 'linear-gradient(135deg, rgba(201,148,58,0.14), rgba(139,74,47,0.18))', border: '1px solid rgba(201,148,58,0.25)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,148,58,0.18)', border: '1px solid rgba(201,148,58,0.3)' }}>
                    <CheckCircle style={{ width: 18, height: 18, color: '#C9943A' }} />
                  </div>
                  <h4 className="font-black text-[0.95rem]" style={{ color: '#3D1F0D' }}>Fast Response</h4>
                </div>
                <p className="text-[0.82rem] leading-relaxed" style={{ color: '#6B3520' }}>
                  Our team typically responds within 24 hours. For urgent orders, call your nearest outlet directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OUTLETS */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem 4rem' }}>
          <div className="text-center mb-10">
            <p className="text-[0.65rem] font-black tracking-[0.22em] uppercase mb-3" style={{ color: '#C9943A' }}>Locations</p>
            <h2 className="font-heading font-black text-[clamp(1.8rem,3.5vw,2.6rem)]" style={{ color: '#3D1F0D', lineHeight: 1.1 }}>Reach Us at Your Nearby Outlet</h2>
          </div>

          {loadingOutlets ? (
            <div className="text-center py-12 text-[#6B3520]">Loading outlets...</div>
          ) : outlets.length === 0 ? (
            <div className="text-center py-12 text-[#6B3520]">No outlets available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outlets.map(o => (
                <div key={o.id} className="rounded-[28px] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  style={{ background: '#FFF7ED', border: '1px solid #E6C7A8' }}>
                  <div className="relative h-44 overflow-hidden">
                    {o.image ? (
                      <img src={getImageUrl(o.image) || undefined} alt={o.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3D1F0D, #6B3520)' }}>
                        <Store style={{ width: 40, height: 40, color: '#C9943A' }} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#120905]/70 to-transparent" />
                    <h3 className="absolute bottom-4 left-4 font-heading font-black text-[1.2rem] text-white">{o.name}</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-[0.82rem] leading-relaxed mb-3" style={{ color: '#6B3520' }}>{o.address}</p>
                    <div className="space-y-2 mb-4">
                      {o.phone && <div className="flex items-center gap-2 text-[0.78rem]" style={{ color: '#6B3520' }}><Phone style={{ width: 14, height: 14, color: '#C9943A' }} /> {o.phone}</div>}
                      {o.opening_hours && <div className="flex items-center gap-2 text-[0.78rem]" style={{ color: '#6B3520' }}><Clock style={{ width: 14, height: 14, color: '#C9943A' }} /> {o.opening_hours}</div>}
                    </div>
                    <div className="flex gap-2">
                      <a href={mapsLink(o)} target="_blank" rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-[0.65rem] font-black uppercase tracking-[0.08em] no-underline transition-all"
                        style={{ background: '#3D1F0D', color: '#FFF7ED' }}>
                        <Navigation style={{ width: 12, height: 12 }} /> Directions
                      </a>
                      {o.phone && (
                        <a href={`tel:${o.phone}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-[0.65rem] font-black uppercase tracking-[0.08em] no-underline transition-all border"
                          style={{ borderColor: '#E6C7A8', color: '#3D1F0D' }}>
                          <Phone style={{ width: 12, height: 12 }} /> Call
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BUSINESS CTA */}
        <section className="relative overflow-hidden" style={{ margin: '0 2rem 4rem', borderRadius: 36, background: 'linear-gradient(135deg, #120905 0%, #2A120B 50%, #3D1F0D 100%)' }}>
          <div className="absolute right-0 top-0 w-[400px] h-[400px] rounded-full bg-[#C9943A]/12 blur-3xl" />
          <div className="absolute left-0 bottom-0 w-[300px] h-[300px] rounded-full bg-[#8B4A2F]/18 blur-3xl" />
          <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-16 md:py-20">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <p className="text-[0.65rem] font-black tracking-[0.22em] uppercase mb-3" style={{ color: '#C9943A' }}>Partnerships</p>
              <h2 className="font-heading font-black text-[clamp(1.8rem,3.5vw,2.6rem)] text-white mb-4" style={{ lineHeight: 1.1 }}>
                Planning a Franchise, Event or Corporate Order?
              </h2>
              <p className="text-[0.95rem] leading-relaxed" style={{ color: '#C7A489' }}>
                Big Bean Café is open for franchise discussions, corporate coffee orders, workshops, events and collaborations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'Franchise', text: 'Join the growing café family', href: '/franchise', btn: 'Enquire' },
                { title: 'Corporate Orders', text: 'Coffee for offices and teams', href: '#contact-form', btn: 'Order' },
                { title: 'Events', text: 'Host workshops and celebrations', href: '#contact-form', btn: 'Plan' },
                { title: 'Brand Collaborations', text: 'Partner on unique campaigns', href: '#contact-form', btn: 'Partner' }
              ].map((c, i) => (
                <div key={i} className="rounded-[28px] p-6 transition-all duration-300 hover:-translate-y-2"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                  <h3 className="font-black text-[1.05rem] text-white mb-2">{c.title}</h3>
                  <p className="text-[0.8rem] leading-relaxed mb-4" style={{ color: 'rgba(199,164,137,0.85)' }}>{c.text}</p>
                  <a href={c.href} className="inline-flex items-center gap-1 text-[0.65rem] font-black uppercase tracking-[0.08em]" style={{ color: '#F6D58D' }}>
                    {c.btn} <ArrowRight style={{ width: 12, height: 12 }} />
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href="/franchise" className="inline-flex items-center gap-2 rounded-full font-black uppercase tracking-[0.08em] text-[0.75rem] no-underline transition-all"
                style={{ background: '#C9943A', color: '#120905', padding: '0.8rem 2rem' }}>
                Franchise Enquiry
              </a>
              <a href="#contact-form" className="inline-flex items-center gap-2 rounded-full font-black uppercase tracking-[0.08em] text-[0.75rem] no-underline transition-all border border-white/25 text-white"
                style={{ padding: '0.8rem 2rem' }}>
                Corporate Orders
              </a>
              <a href="https://bigbeancafe.store" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full font-black uppercase tracking-[0.08em] text-[0.75rem] no-underline transition-all border border-white/25 text-white"
                style={{ padding: '0.8rem 2rem' }}>
                Order Online <ExternalLink style={{ width: 12, height: 12 }} />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem 4rem' }}>
          <div className="text-center mb-10">
            <p className="text-[0.65rem] font-black tracking-[0.22em] uppercase mb-3" style={{ color: '#C9943A' }}>Support</p>
            <h2 className="font-heading font-black text-[clamp(1.8rem,3.5vw,2.6rem)]" style={{ color: '#3D1F0D', lineHeight: 1.1 }}>Quick Help</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-[24px] overflow-hidden" style={{ background: '#FFF7ED', border: '1px solid #E6C7A8' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-black text-[0.92rem] pr-4" style={{ color: '#3D1F0D' }}>{f.q}</span>
                  {openFaq === i ? <ChevronUp style={{ width: 18, height: 18, color: '#C9943A' }} /> : <ChevronDown style={{ width: 18, height: 18, color: '#C9943A' }} />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-[0.85rem] leading-relaxed" style={{ color: '#6B3520' }}>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem 4rem' }}>
          <div className="relative overflow-hidden rounded-[36px]" style={{ background: 'linear-gradient(135deg, #3D1F0D 0%, #6B3520 100%)' }}>
            <div className="absolute right-0 top-0 w-[350px] h-[350px] rounded-full bg-[#C9943A]/15 blur-3xl" />
            <div className="relative z-10 px-6 py-14 md:py-16 text-center">
              <h2 className="font-heading font-black text-[clamp(1.8rem,3.5vw,2.6rem)] text-white mb-4" style={{ lineHeight: 1.1 }}>
                Coffee, Conversations & Good Vibes Await
              </h2>
              <p className="text-[0.95rem] leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: '#C7A489' }}>
                Visit your nearby Big Bean Café or order your favourites online.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="/outlets" className="inline-flex items-center gap-2 rounded-full font-black uppercase tracking-[0.08em] text-[0.75rem] no-underline transition-all"
                  style={{ background: '#C9943A', color: '#120905', padding: '0.8rem 2rem' }}>
                  Find Outlet <MapPin style={{ width: 14, height: 14 }} />
                </a>
                <a href="https://bigbeancafe.store" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full font-black uppercase tracking-[0.08em] text-[0.75rem] no-underline transition-all border border-white/25 text-white"
                  style={{ padding: '0.8rem 2rem' }}>
                  Order Online <ExternalLink style={{ width: 14, height: 14 }} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
