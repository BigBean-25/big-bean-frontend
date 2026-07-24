'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { ScrollText, Mail, Calendar, FileText, ShoppingCart, Tag, CreditCard } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace('/api', '')

const getImageUrl = (image?: string | null): string | null => {
  if (!image) return null
  if (image.startsWith('http')) return image
  return `${API_BASE_URL}/${image.replace(/^\/+/, '')}`
}

interface LegalPage {
  id: number; page_type: string; eyebrow: string | null; title: string
  highlight_text: string | null; subtitle: string | null; hero_image: string | null
  content: string | null; effective_date: string | null; status: string; updated_at: string
}

const defaultPage: LegalPage = {
  id: 0, page_type: 'terms_conditions',
  eyebrow: 'TERMS & CONDITIONS',
  title: 'Terms of',
  highlight_text: 'Using Our Services',
  subtitle: 'Please read these terms carefully before using Big Bean Café website, app, offers, ordering services and digital platforms.',
  hero_image: null,
  content: 'Loading content...',
  effective_date: null,
  status: 'active',
  updated_at: new Date().toISOString()
}

export default function TermsAndConditionsPage() {
  const [page, setPage] = useState<LegalPage | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/legal-pages/type/terms_conditions`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data) { setPage(d.data) } else { setPage(defaultPage) } })
      .catch(() => setPage(defaultPage))
      .finally(() => setLoading(false))
  }, [])

  const p = page || defaultPage
  const heroImage = getImageUrl(p.hero_image)
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : null
  const fmtShort = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="min-h-screen" style={{ background: '#FFF7ED' }}>
      <Header />
      <main>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden flex items-end" style={{ minHeight: '500px', background: '#120905', paddingTop: '5.5rem', paddingBottom: '4rem' }}>
          {heroImage ? (
            <div className="absolute inset-0 overflow-hidden">
              <img src={heroImage} alt={p.title} className="absolute inset-0 h-full w-full object-cover animate-slow-zoom" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(18,9,5,0.92),rgba(18,9,5,0.72),rgba(18,9,5,0.38))' }} />
            </div>
          ) : (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#120905 0%,#1A0D07 45%,#3D1F0D 80%,#6B3520 100%)' }} />
          )}

          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 40%,rgba(201,148,58,0.10),transparent 55%)' }} />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
            <div className="animate-fade-up">
              {p.eyebrow && (
                <p className="text-xs font-bold tracking-[0.3em] mb-5 flex items-center gap-2" style={{ color: '#C9943A' }}>
                  <ScrollText className="w-3.5 h-3.5" /> {p.eyebrow}
                </p>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5" style={{ color: '#FFF7ED', fontFamily: 'var(--font-heading)' }}>
                {p.title}
                {p.highlight_text && <><br /><span style={{ color: '#C9943A' }}>{p.highlight_text}</span></>}
              </h1>
              {p.subtitle && (
                <p className="text-base md:text-lg max-w-xl leading-relaxed mb-6" style={{ color: '#E6C7A8' }}>{p.subtitle}</p>
              )}
              {p.effective_date && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold" style={{ background: 'rgba(201,148,58,0.15)', border: '1px solid rgba(201,148,58,0.35)', color: '#C9943A' }}>
                  <Calendar className="w-3.5 h-3.5" /> Effective {fmtDate(p.effective_date)}
                </div>
              )}
            </div>

            <div className="hidden lg:block animate-fade-up-delay">
              <div className="rounded-3xl p-6 animate-float-soft" style={{ background: 'rgba(201,148,58,0.10)', border: '1px solid rgba(201,148,58,0.28)', backdropFilter: 'blur(14px)' }}>
                <p className="text-sm font-bold mb-4" style={{ color: '#C9943A' }}>Please Read Carefully</p>
                {[
                  [ShoppingCart, 'Orders', 'Subject to availability and acceptance'],
                  [CreditCard, 'Payments', 'Full payment required at checkout'],
                  [Tag, 'Offers', 'Valid for specified period only'],
                  [ScrollText, 'Usage Terms', 'For lawful purposes only'],
                ].map(([Icon, title, desc], i) => (
                  <div key={i} className="flex gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(201,148,58,0.15)' }}>
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C9943A' }} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: '#F5E6D3' }}>{title as string}</p>
                      <p className="text-xs" style={{ color: '#E6C7A8' }}>{desc as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <section className="py-16 px-6" style={{ background: '#FBF4EC' }}>
          <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[1fr_300px] gap-10 items-start">

            {/* Main document card */}
            <div className="rounded-[34px] border shadow-xl overflow-hidden" style={{ background: '#fff', borderColor: '#E6C7A8' }}>
              <div className="px-8 py-5 border-b flex items-center gap-3" style={{ borderColor: '#E6C7A8', background: '#FBF4EC' }}>
                <FileText className="w-5 h-5" style={{ color: '#C9943A' }} />
                <p className="text-sm font-bold" style={{ color: '#3D1F0D' }}>Terms & Conditions Document</p>
                {p.effective_date && <span className="ml-auto text-xs" style={{ color: '#8B4A2F' }}>Effective {fmtDate(p.effective_date)}</span>}
              </div>
              <div className="p-8 md:p-10">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-4 rounded-full animate-pulse" style={{ background: '#E6C7A8', width: `${70 + (i * 7) % 30}%` }} />
                    ))}
                  </div>
                ) : (
                  <div className="leading-8 text-sm md:text-base" style={{ color: '#3D1F0D', lineHeight: '2' }}>
                    {(p.content || '').split('\n').map((line, i) => {
                      const trimmed = line.trim()
                      if (!trimmed) return <div key={i} className="h-3" />
                      const isSectionHead = trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.includes('.')
                      if (isSectionHead) return (
                        <h2 key={i} className="text-base font-bold mt-8 mb-2 pb-2 border-b" style={{ color: '#120905', borderColor: '#E6C7A8', fontFamily: 'var(--font-heading)', letterSpacing: '0.01em' }}>{trimmed}</h2>
                      )
                      return <p key={i} className="mb-1" style={{ color: '#4A2E1A' }}>{line}</p>
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Side info card */}
            <div className="mt-8 lg:mt-0 space-y-5">
              <div className="rounded-3xl p-6 border" style={{ background: 'linear-gradient(135deg,#120905,#3D1F0D)', borderColor: 'rgba(201,148,58,0.3)' }}>
                <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#C9943A' }}>PAGE DETAILS</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm border-b py-2.5" style={{ borderColor: 'rgba(201,148,58,0.15)' }}>
                    <span style={{ color: '#E6C7A8' }}>Type</span>
                    <span className="font-semibold" style={{ color: '#F5E6D3' }}>Terms & Conditions</span>
                  </div>
                  {p.effective_date && (
                    <div className="flex justify-between text-sm border-b py-2.5" style={{ borderColor: 'rgba(201,148,58,0.15)' }}>
                      <span style={{ color: '#E6C7A8' }}>Effective</span>
                      <span className="font-semibold" style={{ color: '#F5E6D3' }}>{fmtDate(p.effective_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-b py-2.5" style={{ borderColor: 'rgba(201,148,58,0.15)' }}>
                    <span style={{ color: '#E6C7A8' }}>Last Updated</span>
                    <span className="font-semibold" style={{ color: '#F5E6D3' }}>{fmtShort(p.updated_at)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl p-6 border" style={{ background: '#FFF7ED', borderColor: '#E6C7A8' }}>
                <p className="text-xs font-bold tracking-widest mb-4" style={{ color: '#C9943A' }}>QUESTIONS?</p>
                <p className="text-xs mb-4 leading-relaxed" style={{ color: '#6B3520' }}>
                  If you have questions about our terms of service, please contact us.
                </p>
                <a href="mailto:info@bigbeancafe.in"
                  className="flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color: '#8B4A2F' }}>
                  <Mail className="w-4 h-4" style={{ color: '#C9943A' }} />info@bigbeancafe.in
                </a>
              </div>

              <div className="rounded-3xl p-6 border" style={{ background: '#FBF4EC', borderColor: '#E6C7A8' }}>
                <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#C9943A' }}>RELATED</p>
                <a href="/privacy-policy" className="text-sm font-semibold hover:underline block" style={{ color: '#3D1F0D' }}>
                  Privacy Policy →
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
