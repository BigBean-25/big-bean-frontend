'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import Link from 'next/link'
import {
  Briefcase, MapPin, Phone, Mail, CheckCircle, TrendingUp, Award,
  Users, BadgeCheck, Store, Sparkles, ChevronRight, ArrowRight, Coffee
} from 'lucide-react'
import { getPublicSettings, formatPhoneForTel, CONTACT_DEFAULTS, type PublicContactSettings } from '@/lib/publicSettings'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE = API_URL.replace(/\/api$/, '')

interface FranchiseHero {
  eyebrow: string; title: string; highlight_text: string | null; subtitle: string | null
  button_primary_text: string; button_primary_url: string
  button_secondary_text: string; button_secondary_url: string
  image: string | null
  stat_1_value: string; stat_1_label: string
  stat_2_value: string; stat_2_label: string
  stat_3_value: string; stat_3_label: string
}

const defaultHero: FranchiseHero = {
  eyebrow: 'FRANCHISE WITH BIG BEAN CAFÉ',
  title: 'Build a Coffee Business',
  highlight_text: 'With a Growing Brand',
  subtitle: 'Partner with Big Bean Café and bring premium coffee, food, events and café culture to high-potential locations.',
  button_primary_text: 'Submit Enquiry', button_primary_url: '#franchise-form',
  button_secondary_text: 'Why Partner With Us', button_secondary_url: '#why-franchise',
  image: null,
  stat_1_value: '7+', stat_1_label: 'Outlets',
  stat_2_value: 'FOCO', stat_2_label: 'Growth Model',
  stat_3_value: '360°', stat_3_label: 'Brand Support',
}

const BENEFITS = [
  { icon: TrendingUp, title: 'Growing Café Brand', desc: 'Join a brand expanding across premium locations with loyal café culture.' },
  { icon: Award, title: 'Proven Café Model', desc: 'Backed by a tested operational framework across multiple outlets.' },
  { icon: Users, title: 'Complete Brand Support', desc: 'End-to-end support from setup, training, operations to marketing.' },
  { icon: Briefcase, title: 'Operations Training', desc: 'Comprehensive SOP-based training for you and your team.' },
  { icon: BadgeCheck, title: 'Marketing Support', desc: 'Launch campaigns, social media, and brand toolkits provided.' },
  { icon: Store, title: 'Menu & Vendor Guidance', desc: 'Access to curated vendors and our full menu framework.' },
]

const TIMELINE = [
  { n: 1, title: 'Submit Enquiry', desc: 'Fill our franchise enquiry form with your location and investment details.' },
  { n: 2, title: 'Initial Discussion', desc: 'Our franchise team will reach out to discuss the opportunity.' },
  { n: 3, title: 'Location & Investment Review', desc: 'We evaluate your proposed location and investment capacity together.' },
  { n: 4, title: 'Agreement & Setup Planning', desc: 'Formalize the partnership and begin outlet setup planning.' },
  { n: 5, title: 'Launch Support', desc: 'We support your outlet launch with training, branding, and operations.' },
  { n: 6, title: 'Ongoing Operations Support', desc: 'Continued guidance on menu, operations, marketing and SOP compliance.' },
]

const SUPPORT = [
  { icon: MapPin, title: 'Site Selection Guidance', desc: 'Expert inputs on location evaluation and footfall assessment.' },
  { icon: Users, title: 'Staff Training Support', desc: 'Structured training programs for baristas and cafe operations staff.' },
  { icon: Sparkles, title: 'Marketing Launch Support', desc: 'Brand assets, social campaigns and launch marketing guidance.' },
  { icon: BadgeCheck, title: 'SOP & Operations Support', desc: 'Detailed operational playbook and ongoing compliance support.' },
  { icon: Coffee, title: 'Menu Support', desc: 'Access to our full menu, recipes, and seasonal product updates.' },
  { icon: Store, title: 'Vendor & Supply Guidance', desc: 'Recommended vendor network for quality sourcing.' },
]

const emptyForm = { name: '', email: '', phone: '', city: '', state: '', investmentRange: '', preferredLocation: '', experience: '', message: '' }

export default function Franchise() {
  const [hero, setHero] = useState<FranchiseHero | null>(null)
  const [formData, setFormData] = useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submittedEnquiry, setSubmittedEnquiry] = useState<{ name: string; city: string; state: string; investmentRange: string } | null>(null)
  const [pubSettings, setPubSettings] = useState<PublicContactSettings>(CONTACT_DEFAULTS)

  useEffect(() => {
    fetch(`${API_URL}/franchise-hero/active`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setHero(d.data) })
      .catch(() => {})
    getPublicSettings().then(setPubSettings).catch(() => {})
  }, [])

  const h = hero || defaultHero
  const heroImageUrl = h.image ? `${API_BASE}/${h.image}` : null

  const ic = 'w-full px-4 py-3 rounded-2xl border border-[#E6C7A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9943A]/40 bg-white'
  const lc = 'block text-sm font-semibold mb-1.5'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (submitError) setSubmitError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.state.trim()) {
      setSubmitError('Name, email, phone, city and state are required.')
      return
    }
    setIsSubmitting(true); setSubmitError('')
    try {
      const res = await fetch(`${API_URL}/franchise-enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          investment_range: formData.investmentRange,
          preferred_location: formData.preferredLocation,
          business_experience: formData.experience,
          message: formData.message,
        })
      })
      const data = await res.json()
      if (data.success) {
        setSubmittedEnquiry({ name: formData.name, city: formData.city, state: formData.state, investmentRange: formData.investmentRange })
        setIsSubmitted(true)
        setFormData(emptyForm)
      } else {
        setSubmitError(data.message || 'Failed to submit enquiry. Please try again.')
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
          <div className="max-w-lg w-full text-center animate-fade-up">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg,#C9943A,#8B4A2F)' }}>
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#120905', fontFamily: 'var(--font-heading)' }}>Enquiry Submitted!</h1>
            <p className="text-sm font-semibold mb-6" style={{ color: '#C9943A' }}>Franchise Enquiry Received</p>
            <div className="rounded-3xl p-6 mb-6 text-left space-y-3 border" style={{ background: '#FBF4EC', borderColor: '#E6C7A8' }}>
              <div className="flex justify-between text-sm"><span className="font-semibold" style={{ color: '#6B3520' }}>Name</span><span style={{ color: '#3D1F0D' }}>{submittedEnquiry.name}</span></div>
              <div className="flex justify-between text-sm"><span className="font-semibold" style={{ color: '#6B3520' }}>Location</span><span style={{ color: '#3D1F0D' }}>{submittedEnquiry.city}, {submittedEnquiry.state}</span></div>
              {submittedEnquiry.investmentRange && <div className="flex justify-between text-sm"><span className="font-semibold" style={{ color: '#6B3520' }}>Investment Range</span><span style={{ color: '#3D1F0D' }}>{submittedEnquiry.investmentRange}</span></div>}
            </div>
            <p className="text-sm mb-8" style={{ color: '#6B3520' }}>Our franchise team will review your enquiry and contact you within 48 hours.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => { setIsSubmitted(false); setSubmittedEnquiry(null) }}
                className="px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                Submit Another Enquiry
              </button>
              <Link href="/franchise" className="px-6 py-3 rounded-2xl text-sm font-bold border transition-all hover:shadow-md"
                style={{ borderColor: '#C9943A', color: '#8B4A2F' }}>
                Back to Franchise Page
              </Link>
            </div>
          </div>
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
        <style>{`
          .franchise-hero{min-height:620px;}
          .franchise-hero-inner{position:relative;z-index:10;width:100%;max-width:1600px;margin:0 auto;padding:4rem clamp(1.5rem,5vw,6rem) 3.25rem;display:grid;grid-template-columns:minmax(0,1.12fr) minmax(340px,0.88fr);gap:3.5rem;align-items:center;}
          .franchise-hero-copy{width:100%;max-width:900px;min-width:0;}
          .franchise-hero-eyebrow{font-size:0.72rem;line-height:1;}
          .franchise-hero-title{margin:0 0 1rem;color:#FFF7ED;font-family:var(--font-heading);font-size:clamp(2.5rem,3.8vw,4.25rem);font-weight:900;line-height:0.98;letter-spacing:-0.025em;text-wrap:balance;}
          .franchise-hero-highlight{display:block;margin-top:0.15em;font-size:clamp(2.25rem,3.15vw,3.55rem);line-height:1.05;background:linear-gradient(90deg,#F6D58D,#C9943A);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
          .franchise-hero-subtitle{max-width:650px;margin-bottom:1.75rem;color:#F5D7BF;font-size:clamp(0.92rem,1.1vw,1.05rem);line-height:1.75;}
          .franchise-hero-actions{display:flex;flex-wrap:wrap;gap:0.75rem;}
          .franchise-hero-actions a{min-height:46px;font-size:0.78rem;}
          .franchise-opportunity-panel{padding:1.6rem;border:1px solid rgba(201,148,58,0.42);border-radius:28px;background:rgba(18,9,5,0.70);backdrop-filter:blur(20px);box-shadow:0 24px 70px rgba(18,9,5,0.38),inset 0 1px 0 rgba(255,255,255,0.08);}
          .franchise-opportunity-title{margin-bottom:0.9rem;color:#F6D58D;font-size:0.95rem;font-weight:900;line-height:1.3;}
          .franchise-opportunity-item{display:flex;align-items:center;gap:0.75rem;min-height:46px;padding:0.7rem 0;border-bottom:1px solid rgba(201,148,58,0.18);color:#FFF7ED;font-size:0.88rem;font-weight:700;line-height:1.5;}
          .franchise-opportunity-item:last-child{border-bottom:0;}
          .franchise-opportunity-item svg{width:18px;height:18px;color:#D9A63D;flex-shrink:0;filter:drop-shadow(0 3px 8px rgba(201,148,58,0.35));}
          .franchise-hero-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0.75rem;}
          .franchise-hero-stat{min-width:0;padding:0.9rem 0.55rem;border:1px solid rgba(201,148,58,0.32);border-radius:18px;background:rgba(18,9,5,0.62);backdrop-filter:blur(14px);text-align:center;}
          .franchise-hero-stat-value{color:#F6D58D;font-size:1.2rem;font-weight:900;}
          .franchise-hero-stat-label{margin-top:0.25rem;color:#F5D7BF;font-size:0.58rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;}
          @media(max-width:1199px){
            .franchise-hero{min-height:560px;}
            .franchise-hero-inner{padding:3.5rem clamp(1.5rem,4vw,3rem) 3rem;}
            .franchise-hero-title{font-size:clamp(2.5rem,5vw,3.75rem);}
            .franchise-hero-highlight{font-size:clamp(2.15rem,4.25vw,3.15rem);}
          }
          @media(max-width:899px){
            .franchise-hero{min-height:auto;}
            .franchise-hero-inner{grid-template-columns:minmax(0,1fr);padding-top:4rem;padding-bottom:3rem;}
            .franchise-opportunity-panel{margin-top:0.75rem;}
          }
          @media(max-width:640px){
            .franchise-hero-inner{padding:3rem 1.25rem 2.5rem;}
            .franchise-hero-eyebrow{font-size:0.65rem;}
            .franchise-hero-title{font-size:clamp(2.15rem,11vw,3rem);line-height:1;}
            .franchise-hero-highlight{margin-top:0.22em;font-size:clamp(1.9rem,9.5vw,2.65rem);line-height:1.06;}
            .franchise-hero-subtitle{max-width:100%;font-size:0.9rem;line-height:1.7;}
            .franchise-hero-actions{flex-direction:column;align-items:stretch;gap:0.65rem;}
            .franchise-hero-actions a{width:100%;justify-content:center;}
            .franchise-opportunity-panel{padding:1.25rem;border-radius:22px;}
            .franchise-opportunity-item{min-height:42px;font-size:0.82rem;}
            .franchise-hero-stat-value{font-size:1.05rem;}
            .franchise-hero-stat-label{font-size:0.52rem;}
          }
          @media(max-width:374px){
            .franchise-hero-inner{padding-left:1rem;padding-right:1rem;}
            .franchise-hero-title{font-size:2rem;}
            .franchise-hero-highlight{font-size:1.75rem;}
          }
        `}</style>
        <section className="franchise-hero relative overflow-hidden flex items-center" style={{ background: '#120905' }}>
          {heroImageUrl && (
            <div className="absolute inset-0 overflow-hidden">
              <img src={heroImageUrl} alt="Franchise hero" className="w-full h-full object-cover" style={{ filter: 'brightness(0.82) contrast(1.08) saturate(1.02)' }} />
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(24,10,4,0.72) 0%, rgba(24,10,4,0.58) 35%, rgba(24,10,4,0.38) 65%, rgba(24,10,4,0.22) 100%)' }} />

          <div className="franchise-hero-inner">
            <div className="franchise-hero-copy animate-fade-up">
              <p className="franchise-hero-eyebrow font-bold tracking-[0.25em] mb-4" style={{ color: '#C9943A' }}>{h.eyebrow}</p>
              <h1 className="franchise-hero-title">
                {h.title}
                {h.highlight_text && <span className="franchise-hero-highlight">{h.highlight_text}</span>}
              </h1>
              {h.subtitle && <p className="franchise-hero-subtitle">{h.subtitle}</p>}
              <div className="franchise-hero-actions">
                <a href={h.button_primary_url}
                  className="inline-flex items-center gap-2 rounded-full font-black uppercase tracking-[0.08em] text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)', padding: '0.78rem 1.65rem' }}>
                  {h.button_primary_text} <ChevronRight className="w-4 h-4" />
                </a>
                <a href={h.button_secondary_url}
                  className="inline-flex items-center gap-2 rounded-full border-2 transition-all hover:-translate-y-0.5"
                  style={{ borderColor: '#C9943A', color: '#C9943A', padding: '0.78rem 1.65rem' }}>
                  {h.button_secondary_text}
                </a>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-4 animate-fade-up-delay">
              <div className="franchise-opportunity-panel animate-float-soft">
                <p className="franchise-opportunity-title">Franchise Opportunity</p>
                {[
                  'Full brand & identity support',
                  'SOP-based training programs',
                  'Operations guidance',
                  'Marketing & launch support',
                ].map((item, i) => (
                  <div key={i} className="franchise-opportunity-item">
                    <CheckCircle />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="franchise-hero-stats">
                {[
                  [h.stat_1_value, h.stat_1_label],
                  [h.stat_2_value, h.stat_2_label],
                  [h.stat_3_value, h.stat_3_label],
                ].map(([val, lbl], i) => (
                  <div key={i} className="franchise-hero-stat">
                    <p className="franchise-hero-stat-value font-heading">{val}</p>
                    <p className="franchise-hero-stat-label">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile stats */}
          <div className="absolute bottom-0 left-0 right-0 lg:hidden grid grid-cols-3 divide-x z-10" style={{ background: 'rgba(24,10,4,0.75)', borderTop: '1px solid rgba(212,160,74,0.22)' }}>
            {[[h.stat_1_value, h.stat_1_label],[h.stat_2_value, h.stat_2_label],[h.stat_3_value, h.stat_3_label]].map(([val, lbl], i) => (
              <div key={i} className="py-4 text-center">
                <p className="text-lg font-bold" style={{ color: '#C9943A' }}>{val}</p>
                <p className="text-xs" style={{ color: '#E6C7A8' }}>{lbl}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY FRANCHISE ── */}
        <section id="why-franchise" className="py-20 px-6" style={{ background: '#FFF7ED' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#C9943A' }}>WHY PARTNER WITH US</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#120905', fontFamily: 'var(--font-heading)' }}>The Big Bean Café Advantage</h2>
              <p className="text-sm max-w-2xl mx-auto" style={{ color: '#6B3520' }}>A partnership built on brand strength, operational discipline and a genuine commitment to your success.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {BENEFITS.map((b, i) => (
                <div key={i} className="group rounded-3xl p-7 border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default"
                  style={{ background: '#FBF4EC', borderColor: '#E6C7A8' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg,#C9943A22,#8B4A2F22)' }}>
                    <b.icon className="w-6 h-6" style={{ color: '#C9943A' }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: '#120905' }}>{b.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B3520' }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FRANCHISE MODEL ── */}
        <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg,#120905,#1A0D07,#3D1F0D)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#C9943A' }}>OUR MODEL</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FFF7ED', fontFamily: 'var(--font-heading)' }}>The Big Bean Franchise Model</h2>
              <p className="text-sm max-w-xl mx-auto" style={{ color: '#E6C7A8' }}>
                A structured, brand-led café model designed for operational consistency and long-term presence.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { t: 'FOCO / Managed Café Model', d: 'Franchise Owned, Company Operated framework with brand-led management.' },
                { t: 'Brand-led Operations', d: 'All outlets operate under standardised Big Bean café procedures and quality norms.' },
                { t: 'Outlet Launch Support', d: 'We assist with setup, interiors, equipment and soft launch coordination.' },
                { t: 'Investor Growth Opportunity', d: 'A structured café business with brand identity and support systems.' },
              ].map((c, i) => (
                <div key={i} className="rounded-3xl p-6 border" style={{ background: 'rgba(255,247,237,0.05)', borderColor: 'rgba(201,148,58,0.2)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4 text-sm font-bold" style={{ background: '#C9943A', color: '#120905' }}>{i + 1}</div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#F5E6D3' }}>{c.t}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#E6C7A8' }}>{c.d}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs mt-10 max-w-2xl mx-auto" style={{ color: '#8B4A2F' }}>
              Business performance depends on location, operations, cost control and market conditions. We do not guarantee specific financial outcomes.
            </p>
          </div>
        </section>

        {/* ── INVESTMENT & SPACE ── */}
        <section className="py-20 px-6" style={{ background: '#FBF4EC' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#C9943A' }}>WHAT YOU NEED</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#120905', fontFamily: 'var(--font-heading)' }}>Investment & Space Requirements</h2>
              <p className="text-xs max-w-xl mx-auto" style={{ color: '#6B3520' }}>Investment and space requirements may vary based on location and format.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: '₹', t: 'Investment Range', d: '₹25–50 Lakhs (indicative, varies by location and format)' },
                { icon: '📐', t: 'Preferred Space', d: '800–1500 sq. ft. in a high-visibility commercial area' },
                { icon: '📍', t: 'Location Type', d: 'High-footfall locations: malls, high streets, office zones, residential hubs' },
                { icon: '✅', t: 'Brand Standards', d: 'Adherence to Big Bean café identity, SOP and customer experience norms' },
                { icon: '🎯', t: 'Operations Discipline', d: 'Commitment to quality, hygiene and consistent service standards' },
                { icon: '☕', t: 'Customer Experience', d: 'Passion for premium café culture and hospitality' },
              ].map((r, i) => (
                <div key={i} className="flex gap-4 rounded-3xl p-6 border" style={{ background: '#FFF7ED', borderColor: '#E6C7A8' }}>
                  <span className="text-2xl flex-shrink-0">{r.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold mb-1" style={{ color: '#120905' }}>{r.t}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#6B3520' }}>{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="py-20 px-6" style={{ background: '#FFF7ED' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#C9943A' }}>HOW IT WORKS</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#120905', fontFamily: 'var(--font-heading)' }}>From Enquiry to Launch</h2>
            </div>
            <div className="space-y-4">
              {TIMELINE.map((step, i) => (
                <div key={i} className="flex gap-5 items-start animate-fade-up rounded-3xl p-6 border transition-all hover:shadow-md"
                  style={{ background: '#FBF4EC', borderColor: '#E6C7A8', animationDelay: `${i * 0.1}s` }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg,#C9943A,#8B4A2F)', color: '#fff' }}>{step.n}</div>
                  <div>
                    <h3 className="text-sm font-bold mb-1" style={{ color: '#120905' }}>{step.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#6B3520' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FRANCHISE FORM ── */}
        <section id="franchise-form" className="py-20 px-6" style={{ background: '#FBF4EC' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#C9943A' }}>GET STARTED</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#120905', fontFamily: 'var(--font-heading)' }}>Franchise Enquiry Form</h2>
              <p className="text-sm max-w-xl mx-auto" style={{ color: '#6B3520' }}>Fill in your details and our franchise team will reach out within 48 hours.</p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-3">
                <div className="rounded-3xl p-8 shadow-xl border" style={{ background: '#fff', borderColor: '#E6C7A8' }}>
                  {submitError && <div className="mb-5 px-4 py-3 rounded-2xl text-sm border border-red-200 bg-red-50 text-red-600">{submitError}</div>}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={lc} style={{ color: '#3D1F0D' }}>Full Name <span className="text-red-500">*</span></label>
                        <input className={ic} name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" required /></div>
                      <div><label className={lc} style={{ color: '#3D1F0D' }}>Email <span className="text-red-500">*</span></label>
                        <input className={ic} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={lc} style={{ color: '#3D1F0D' }}>Phone <span className="text-red-500">*</span></label>
                        <input className={ic} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required /></div>
                      <div><label className={lc} style={{ color: '#3D1F0D' }}>City <span className="text-red-500">*</span></label>
                        <input className={ic} name="city" value={formData.city} onChange={handleChange} placeholder="Your city" required /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className={lc} style={{ color: '#3D1F0D' }}>State <span className="text-red-500">*</span></label>
                        <input className={ic} name="state" value={formData.state} onChange={handleChange} placeholder="Your state" required /></div>
                      <div><label className={lc} style={{ color: '#3D1F0D' }}>Investment Range</label>
                        <select className={ic} name="investmentRange" value={formData.investmentRange} onChange={handleChange}>
                          <option value="">Select range</option>
                          <option>₹25–30 Lakhs</option>
                          <option>₹30–40 Lakhs</option>
                          <option>₹40–50 Lakhs</option>
                          <option>₹50+ Lakhs</option>
                          <option>Need guidance</option>
                        </select>
                      </div>
                    </div>
                    <div><label className={lc} style={{ color: '#3D1F0D' }}>Preferred Location</label>
                      <textarea className={ic} name="preferredLocation" value={formData.preferredLocation} onChange={handleChange} rows={2} placeholder="Area, locality or type of location you have in mind..." /></div>
                    <div><label className={lc} style={{ color: '#3D1F0D' }}>Business Experience</label>
                      <textarea className={ic} name="experience" value={formData.experience} onChange={handleChange} rows={2} placeholder="Any relevant business or food industry background..." /></div>
                    <div><label className={lc} style={{ color: '#3D1F0D' }}>Additional Message</label>
                      <textarea className={ic} name="message" value={formData.message} onChange={handleChange} rows={3} placeholder="Anything else you'd like us to know..." /></div>
                    <button type="submit" disabled={isSubmitting}
                      className="w-full py-4 rounded-2xl text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                      {isSubmitting ? 'Submitting...' : <><span>Submit Franchise Enquiry</span><ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-5">
                <div className="rounded-3xl p-6 border" style={{ background: 'linear-gradient(135deg,#120905,#3D1F0D)', borderColor: 'rgba(201,148,58,0.3)' }}>
                  <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#C9943A' }}>FRANCHISE SNAPSHOT</p>
                  {[
                    ['Investment', '₹25–50 Lakhs (approx.)'],
                    ['Space', '800–1500 sq. ft.'],
                    ['Model', 'FOCO / Brand-led'],
                    ['Brand Support', '360° support'],
                    ['Response Time', 'Within 48 hours'],
                  ].map(([k, v], i) => (
                    <div key={i} className="flex justify-between py-2.5 border-b text-sm last:border-0" style={{ borderColor: 'rgba(201,148,58,0.15)' }}>
                      <span style={{ color: '#E6C7A8' }}>{k}</span>
                      <span className="font-semibold" style={{ color: '#F5E6D3' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-3xl p-6 border" style={{ background: '#FFF7ED', borderColor: '#E6C7A8' }}>
                  <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#C9943A' }}>CONTACT OUR TEAM</p>
                  <div className="space-y-3">
                    <a href={`mailto:${pubSettings.franchise_email}`} className="flex items-center gap-3 text-sm hover:underline" style={{ color: '#3D1F0D' }}>
                      <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#C9943A' }} />{pubSettings.franchise_email}
                    </a>
                    <div className="flex items-center gap-3 text-sm" style={{ color: '#3D1F0D' }}>
                      <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: '#C9943A' }} />Bangalore, India
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SUPPORT ── */}
        <section className="py-20 px-6" style={{ background: '#FFF7ED' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#C9943A' }}>WHAT WE PROVIDE</p>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#120905', fontFamily: 'var(--font-heading)' }}>Complete Franchise Support</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SUPPORT.map((s, i) => (
                <div key={i} className="flex gap-4 rounded-3xl p-6 border hover:-translate-y-1 transition-all hover:shadow-md" style={{ background: '#FBF4EC', borderColor: '#E6C7A8' }}>
                  <div className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#C9943A22,#8B4A2F22)' }}>
                    <s.icon className="w-5 h-5" style={{ color: '#C9943A' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1" style={{ color: '#120905' }}>{s.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: '#6B3520' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg,#120905,#1A0D07,#3D1F0D)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#C9943A' }}>READY TO DISCUSS?</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FFF7ED', fontFamily: 'var(--font-heading)' }}>Ready to Discuss Your Location?</h2>
            <p className="text-sm mb-10 max-w-lg mx-auto" style={{ color: '#E6C7A8' }}>Take the first step toward owning a Big Bean Café. Our franchise team is ready to have a conversation.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#franchise-form" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(to right,#C9943A,#8B4A2F)' }}>
                Submit Enquiry <ArrowRight className="w-4 h-4" />
              </a>
              <a href={`mailto:${pubSettings.franchise_email}`} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-bold border-2 transition-all hover:-translate-y-0.5"
                style={{ borderColor: '#C9943A', color: '#C9943A' }}>
                <Mail className="w-4 h-4" /> {pubSettings.franchise_email}
              </a>
              <Link href="/outlets" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm font-bold border-2 transition-all hover:-translate-y-0.5"
                style={{ borderColor: 'rgba(255,247,237,0.25)', color: '#F5E6D3' }}>
                View Outlets
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
