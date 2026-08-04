'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { ScrollText, Mail, Calendar, FileText, ShoppingCart, Tag, CreditCard } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_BASE_URL = API_URL.replace(/\/api$/, '')

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
    <>
      <style>{`
        .legal-terms-page {
          width: 100%;
          overflow-x: clip;
          background: #FFF7ED;
        }

        .legal-terms-page,
        .legal-terms-page * {
          box-sizing: border-box;
        }

        .legal-terms-hero {
          position: relative;
          min-height: 620px;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #120905;
        }

        .legal-terms-hero-inner {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns:
            minmax(0, 1.15fr)
            minmax(320px, 0.85fr);
          align-items: center;
          gap: 3.5rem;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding:
            4rem
            clamp(1.5rem, 5vw, 6rem)
            3.25rem;
        }

        .legal-terms-hero-copy {
          width: 100%;
          max-width: 900px;
          min-width: 0;
        }

        .legal-terms-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: #C9943A;
          font-size: 0.72rem;
          font-weight: 900;
          line-height: 1;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .legal-terms-title {
          margin: 0 0 1rem;
          color: #FFF7ED;
          font-family: var(--font-heading);
          font-size: clamp(2.5rem, 3.8vw, 4.25rem);
          font-weight: 900;
          line-height: 0.98;
          letter-spacing: -0.025em;
          text-wrap: balance;
        }

        .legal-terms-highlight {
          display: block;
          margin-top: 0.15em;
          font-size: clamp(2.25rem, 3.15vw, 3.55rem);
          line-height: 1.05;
          letter-spacing: -0.025em;
          background:
            linear-gradient(90deg,#F6D58D,#C9943A);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .legal-terms-subtitle {
          max-width: 650px;
          margin-bottom: 1.4rem;
          color: #E6C7A8;
          font-size: clamp(0.92rem, 1.1vw, 1.05rem);
          line-height: 1.75;
        }

        .legal-terms-date {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          min-height: 38px;
          padding: 0.5rem 1rem;
          border: 1px solid rgba(201,148,58,0.35);
          border-radius: 999px;
          background: rgba(201,148,58,0.15);
          color: #F6D58D;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .legal-terms-hero-panel {
          padding: 1.5rem;
          border: 1px solid rgba(201,148,58,0.35);
          border-radius: 28px;
          background: rgba(18,9,5,0.72);
          backdrop-filter: blur(18px);
          box-shadow:
            0 22px 65px rgba(18,9,5,0.35);
        }

        .legal-terms-hero-panel-title {
          margin-bottom: 0.8rem;
          color: #F6D58D;
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 900;
          line-height: 1.35;
        }

        .legal-terms-hero-panel-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom:
            1px solid rgba(201,148,58,0.16);
        }

        .legal-terms-hero-panel-item:last-child {
          border-bottom: 0;
        }

        .legal-terms-hero-panel-item-title {
          color: #FFF7ED;
          font-size: 0.82rem;
          font-weight: 800;
          line-height: 1.4;
        }

        .legal-terms-hero-panel-item-text {
          color: #E6C7A8;
          font-size: 0.76rem;
          line-height: 1.55;
        }

        .legal-terms-content-section {
          padding:
            5rem
            clamp(1.25rem, 4vw, 3rem);
          background: #FBF4EC;
        }

        .legal-terms-content-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(260px, 300px);
          align-items: start;
          gap: 2.5rem;
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .legal-terms-document {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #E6C7A8;
          border-radius: 34px;
          background: #FFFFFF;
          box-shadow:
            0 20px 55px rgba(61,31,13,0.1);
        }

        .legal-terms-document-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
          padding: 1.2rem 2rem;
          border-bottom: 1px solid #E6C7A8;
          background: #FBF4EC;
        }

        .legal-terms-document-title {
          min-width: 0;
          color: #3D1F0D;
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 900;
          line-height: 1.4;
        }

        .legal-terms-document-date {
          margin-left: auto;
          flex-shrink: 0;
          color: #8B4A2F;
          font-size: 0.72rem;
          line-height: 1.4;
        }

        .legal-terms-document-body {
          padding: 2.5rem;
          color: #4A2E1A;
          font-size: 0.92rem;
          line-height: 1.9;
          overflow-wrap: anywhere;
        }

        .legal-terms-document-section-title {
          margin:
            2rem
            0
            0.75rem;
          padding-bottom: 0.55rem;
          border-bottom: 1px solid #E6C7A8;
          color: #120905;
          font-family: var(--font-heading);
          font-size: 1.05rem;
          font-weight: 900;
          line-height: 1.4;
          letter-spacing: 0.01em;
        }

        .legal-terms-document-paragraph {
          margin: 0 0 0.45rem;
          color: #4A2E1A;
          font-size: inherit;
          line-height: inherit;
          white-space: pre-wrap;
        }

        .legal-terms-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          min-width: 0;
        }

        .legal-terms-sidebar-card {
          width: 100%;
          padding: 1.5rem;
          border: 1px solid #E6C7A8;
          border-radius: 26px;
        }

        .legal-terms-sidebar-heading {
          margin-bottom: 0.8rem;
          color: #C9943A;
          font-size: 0.68rem;
          font-weight: 900;
          line-height: 1.3;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .legal-terms-sidebar-row {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.75rem 0;
          border-bottom:
            1px solid rgba(201,148,58,0.15);
          font-size: 0.8rem;
          line-height: 1.5;
        }

        .legal-terms-sidebar-row:last-child {
          border-bottom: 0;
        }

        .legal-terms-sidebar-text {
          color: #6B3520;
          font-size: 0.8rem;
          line-height: 1.65;
        }

        .legal-terms-sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          max-width: 100%;
          color: #8B4A2F;
          font-size: 0.85rem;
          font-weight: 800;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        @media (max-width: 1199px) {
          .legal-terms-hero {
            min-height: 560px;
          }

          .legal-terms-hero-inner {
            grid-template-columns:
              minmax(0, 1.1fr)
              minmax(280px, 0.9fr);
            gap: 2.5rem;
            padding:
              3.5rem
              clamp(1.5rem, 4vw, 3rem)
              3rem;
          }

          .legal-terms-title {
            font-size: clamp(2.5rem, 5vw, 3.75rem);
          }

          .legal-terms-highlight {
            font-size: clamp(2.15rem, 4.25vw, 3.15rem);
          }
        }

        @media (max-width: 899px) {
          .legal-terms-hero {
            min-height: auto;
          }

          .legal-terms-hero-inner {
            grid-template-columns: minmax(0, 1fr);
          }

          .legal-terms-hero-panel {
            display: none;
          }

          .legal-terms-content-layout {
            grid-template-columns: minmax(0, 1fr);
          }

          .legal-terms-sidebar {
            display: grid;
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

          .legal-terms-sidebar-card:first-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 640px) {
          .legal-terms-hero-inner {
            padding: 3rem 1.25rem 2.5rem;
          }

          .legal-terms-eyebrow {
            font-size: 0.65rem;
          }

          .legal-terms-title {
            font-size: clamp(2.15rem, 11vw, 3rem);
            line-height: 1;
            letter-spacing: -0.02em;
          }

          .legal-terms-highlight {
            margin-top: 0.22em;
            font-size: clamp(1.9rem, 9.5vw, 2.65rem);
            line-height: 1.06;
          }

          .legal-terms-subtitle {
            max-width: 100%;
            font-size: 0.9rem;
            line-height: 1.7;
          }

          .legal-terms-content-section {
            padding: 3rem 1.25rem;
          }

          .legal-terms-document {
            border-radius: 24px;
          }

          .legal-terms-document-header {
            align-items: flex-start;
            flex-wrap: wrap;
            padding: 1rem 1.25rem;
          }

          .legal-terms-document-date {
            width: 100%;
            margin-left: 0;
          }

          .legal-terms-document-body {
            padding: 1.25rem;
            font-size: 0.86rem;
            line-height: 1.8;
          }

          .legal-terms-document-section-title {
            font-size: 1rem;
          }

          .legal-terms-sidebar {
            grid-template-columns: minmax(0,1fr);
          }

          .legal-terms-sidebar-card:first-child {
            grid-column: auto;
          }

          .legal-terms-sidebar-card {
            padding: 1.25rem;
            border-radius: 22px;
          }

          .legal-terms-sidebar-row {
            align-items: flex-start;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 374px) {
          .legal-terms-hero-inner,
          .legal-terms-content-section {
            padding-left: 1rem;
            padding-right: 1rem;
          }

          .legal-terms-title {
            font-size: 2rem;
          }

          .legal-terms-highlight {
            font-size: 1.75rem;
          }
        }
      `}</style>
      <div className="legal-terms-page min-h-screen">
      <Header />
      <main>

        {/* ── HERO ── */}
        <section className="legal-terms-hero">
          {heroImage ? (
            <div className="absolute inset-0 overflow-hidden">
              <img src={heroImage} alt={p.title} className="absolute inset-0 h-full w-full object-cover animate-slow-zoom" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,rgba(18,9,5,0.92),rgba(18,9,5,0.72),rgba(18,9,5,0.38))' }} />
            </div>
          ) : (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,#120905 0%,#1A0D07 45%,#3D1F0D 80%,#6B3520 100%)' }} />
          )}

          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 40%,rgba(201,148,58,0.10),transparent 55%)' }} />

          <div className="legal-terms-hero-inner">
            <div className="legal-terms-hero-copy animate-fade-up">
              {p.eyebrow && (
                <p className="legal-terms-eyebrow">
                  <ScrollText className="w-3.5 h-3.5" /> {p.eyebrow}
                </p>
              )}
              <h1 className="legal-terms-title">
                {p.title}
                {p.highlight_text && (
                  <span className="legal-terms-highlight">
                    {p.highlight_text}
                  </span>
                )}
              </h1>
              {p.subtitle && (
                <p className="legal-terms-subtitle">{p.subtitle}</p>
              )}
              {p.effective_date && (
                <div className="legal-terms-date">
                  <Calendar className="w-3.5 h-3.5" /> Effective {fmtDate(p.effective_date)}
                </div>
              )}
            </div>

            <div className="hidden lg:block animate-fade-up-delay">
              <div className="legal-terms-hero-panel animate-float-soft">
                <p className="legal-terms-hero-panel-title">Please Read Carefully</p>
                {[
                  [ShoppingCart, 'Orders', 'Subject to availability and acceptance'],
                  [CreditCard, 'Payments', 'Full payment required at checkout'],
                  [Tag, 'Offers', 'Valid for specified period only'],
                  [ScrollText, 'Usage Terms', 'For lawful purposes only'],
                ].map(([Icon, title, desc], i) => (
                  <div key={i} className="legal-terms-hero-panel-item">
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#C9943A' }} />
                    <div>
                      <p className="legal-terms-hero-panel-item-title">{title as string}</p>
                      <p className="legal-terms-hero-panel-item-text">{desc as string}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <section className="legal-terms-content-section">
          <div className="legal-terms-content-layout">

            {/* Main document card */}
            <div className="legal-terms-document">
              <div className="legal-terms-document-header">
                <FileText className="w-5 h-5" style={{ color: '#C9943A' }} />
                <p className="legal-terms-document-title">Terms & Conditions Document</p>
                {p.effective_date && <span className="legal-terms-document-date">Effective {fmtDate(p.effective_date)}</span>}
              </div>
              <div className="legal-terms-document-body">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-4 rounded-full animate-pulse" style={{ background: '#E6C7A8', width: `${70 + (i * 7) % 30}%` }} />
                    ))}
                  </div>
                ) : (
                  <div>
                    {(p.content || '').split('\n').map((line, i) => {
                      const trimmed = line.trim()
                      if (!trimmed) return <div key={i} className="h-3" />
                      const isSectionHead = trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.includes('.')
                      if (isSectionHead) return (
                        <h2 key={i} className="legal-terms-document-section-title">{trimmed}</h2>
                      )
                      return <p key={i} className="legal-terms-document-paragraph">{line}</p>
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Side info card */}
            <div className="legal-terms-sidebar">
              <div className="legal-terms-sidebar-card" style={{ background: 'linear-gradient(135deg,#120905,#3D1F0D)', borderColor: 'rgba(201,148,58,0.3)' }}>
                <p className="legal-terms-sidebar-heading">PAGE DETAILS</p>
                <div className="space-y-3">
                  <div className="legal-terms-sidebar-row">
                    <span style={{ color: '#E6C7A8' }}>Type</span>
                    <span className="font-semibold" style={{ color: '#F5E6D3' }}>Terms & Conditions</span>
                  </div>
                  {p.effective_date && (
                    <div className="legal-terms-sidebar-row">
                      <span style={{ color: '#E6C7A8' }}>Effective</span>
                      <span className="font-semibold" style={{ color: '#F5E6D3' }}>{fmtDate(p.effective_date)}</span>
                    </div>
                  )}
                  <div className="legal-terms-sidebar-row">
                    <span style={{ color: '#E6C7A8' }}>Last Updated</span>
                    <span className="font-semibold" style={{ color: '#F5E6D3' }}>{fmtShort(p.updated_at)}</span>
                  </div>
                </div>
              </div>

              <div className="legal-terms-sidebar-card" style={{ background: '#FFF7ED', borderColor: '#E6C7A8' }}>
                <p className="legal-terms-sidebar-heading">QUESTIONS?</p>
                <p className="legal-terms-sidebar-text">
                  If you have questions about our terms of service, please contact us.
                </p>
                <a href="mailto:info@bigbeancafe.in"
                  className="legal-terms-sidebar-link">
                  <Mail className="w-4 h-4" style={{ color: '#C9943A' }} />info@bigbeancafe.in
                </a>
              </div>

              <div className="legal-terms-sidebar-card" style={{ background: '#FBF4EC', borderColor: '#E6C7A8' }}>
                <p className="legal-terms-sidebar-heading">RELATED</p>
                <a href="/privacy-policy" className="legal-terms-sidebar-link">
                  Privacy Policy →
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
    </>
  )
}
