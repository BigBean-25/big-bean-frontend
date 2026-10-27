import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/common/Header'
import Footer from '@/components/common/Footer'
import { ArrowLeft, Coffee, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found | Big Bean Café',
  description: 'The page you are looking for has wandered off. Head back home or explore the Big Bean Café menu.',
  robots: { index: false, follow: false },
}

/* ── Coffee-bean mascot SVG ─────────────────────────────────── */
function BeanMascot() {
  return (
    <svg viewBox="0 0 96 108" width="72" height="81" aria-hidden="true">
      {/* feet */}
      <ellipse className="nf-foot nf-foot-l" cx="38" cy="102" rx="7" ry="3.5" fill="#3D1F0D" />
      <ellipse className="nf-foot nf-foot-r" cx="52" cy="102" rx="7" ry="3.5" fill="#3D1F0D" />
      {/* legs */}
      <rect className="nf-leg nf-leg-l" x="36" y="88" width="4.5" height="14" rx="2.2" fill="#3D1F0D" />
      <rect className="nf-leg nf-leg-r" x="50" y="88" width="4.5" height="14" rx="2.2" fill="#3D1F0D" />

      {/* bean body */}
      <ellipse cx="44" cy="58" rx="26" ry="34" fill="#5A2D1D" />
      <ellipse cx="44" cy="58" rx="26" ry="34" fill="none" stroke="#3B1C12" strokeWidth="3" />
      {/* bean crack */}
      <path d="M44 27 C 36 40, 54 48, 44 58 C 34 68, 52 76, 44 89" fill="none" stroke="#3B1C12" strokeWidth="3.4" strokeLinecap="round" />
      {/* sheen */}
      <ellipse cx="33" cy="42" rx="7" ry="11" fill="#8B4A2F" opacity="0.55" transform="rotate(-18 33 42)" />

      {/* face — subtle, premium */}
      <circle cx="52" cy="52" r="2.4" fill="#FFF7ED" />
      <circle cx="60" cy="52" r="2.4" fill="#FFF7ED" />
      <path d="M52 60 Q 56 63.5 60 60" fill="none" stroke="#FFF7ED" strokeWidth="2" strokeLinecap="round" />

      {/* arm reaching to magnifier */}
      <path d="M64 62 C 72 60, 76 55, 79 48" fill="none" stroke="#3B1C12" strokeWidth="4" strokeLinecap="round" />

      {/* magnifying glass */}
      <g className="nf-mag">
        <line x1="82" y1="44" x2="88" y2="32" stroke="#3D1F0D" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="90" cy="26" r="11" fill="rgba(255,247,237,0.35)" stroke="#C9943A" strokeWidth="4" />
        <path d="M84 22 A 8 8 0 0 1 91 18" fill="none" stroke="#FFF7ED" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      </g>
    </svg>
  )
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FDF8F1]">
      <Header />

      <style>{`
        .nf-stage { position: relative; }

        /* ── mascot walk cycle (12 s loop) ─────────────── */
        @keyframes nf-walk {
          0%   { left: -84px; opacity: 0; }
          4%   { left: -84px; opacity: 1; }
          9%   { left: calc(16.6% - 46px); }
          19%  { left: calc(16.6% - 46px); }   /* inspect first 4  */
          26%  { left: calc(50% - 46px); }
          37%  { left: calc(50% - 46px); }     /* inspect 0        */
          44%  { left: calc(83.3% - 46px); }
          56%  { left: calc(83.3% - 46px); }   /* inspect last 4   */
          70%  { left: calc(100% + 40px); opacity: 1; }
          72%  { left: calc(100% + 40px); opacity: 0; }
          73%  { left: -84px; opacity: 0; }
          82%  { left: -84px; opacity: 1; }
          100% { left: -84px; opacity: 1; }
        }
        .nf-mascot {
          position: absolute;
          bottom: -14px;
          left: -84px;
          width: 72px;
          pointer-events: none;
          animation: nf-walk 12s linear infinite;
          z-index: 2;
        }

        /* walking bob */
        @keyframes nf-bob { from { transform: translateY(0); } to { transform: translateY(-3px); } }
        .nf-bob { animation: nf-bob .42s ease-in-out infinite alternate; }

        /* alternating feet */
        @keyframes nf-step { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
        .nf-foot-l { animation: nf-step .42s ease-in-out infinite; }
        .nf-foot-r { animation: nf-step .42s ease-in-out .21s infinite; }

        /* magnifier tilt */
        @keyframes nf-tilt { from { transform: rotate(-7deg); } to { transform: rotate(9deg); } }
        .nf-mag { transform-origin: 80px 46px; animation: nf-tilt 1.7s ease-in-out infinite alternate; }

        /* steam wisps */
        @keyframes nf-steam {
          0%   { transform: translate(0, 4px) scaleX(1); opacity: 0; }
          35%  { opacity: .55; }
          100% { transform: translate(-3px, -16px) scaleX(1.1); opacity: 0; }
        }
        .nf-steam {
          position: absolute;
          bottom: 88px;
          width: 6px; height: 14px;
          border-radius: 999px;
          background: linear-gradient(to top, rgba(201,148,58,0), rgba(201,148,58,.55));
          animation: nf-steam 2.4s ease-out infinite;
        }
        .nf-steam-1 { left: 34px; }
        .nf-steam-2 { left: 42px; animation-delay: 1.2s; }

        /* digit pulse — synced to magnifier pauses */
        @keyframes nf-pulse {
          0%, 100% { transform: scale(1); color: #3D1F0D; }
          4%       { transform: scale(1.06); color: #C9943A; }
          9%       { transform: scale(1); color: #3D1F0D; }
        }
        .nf-digit { display: inline-block; animation: nf-pulse 12s ease-in-out infinite; transform-origin: center bottom; }
        .nf-d1 { animation-delay: 1.05s; }
        .nf-d2 { animation-delay: 3.0s; }
        .nf-d3 { animation-delay: 5.2s; }

        /* bean footprints */
        @keyframes nf-print {
          0%   { opacity: 0; transform: scale(.6) rotate(var(--r, -14deg)); }
          4%   { opacity: .45; }
          55%  { opacity: .4; }
          88%, 100% { opacity: 0; transform: scale(1) rotate(var(--r, -14deg)); }
        }
        .nf-print {
          position: absolute;
          bottom: -20px;
          width: 9px; height: 13px;
          border-radius: 50%;
          background: #C7A489;
          opacity: 0;
          animation: nf-print 12s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .nf-mascot, .nf-bob, .nf-mag, .nf-foot, .nf-steam,
          .nf-digit, .nf-print { animation: none !important; }
          .nf-mascot { left: calc(50% - 36px); opacity: 1; }
          .nf-steam, .nf-print { display: none; }
        }
      `}</style>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16 sm:py-20">
        {/* soft ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C9943A]/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-2xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E8D3B8] bg-white/70 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#8B4A2F]">
            <Coffee className="h-3.5 w-3.5 text-[#C9943A]" /> Big Bean Café
          </p>

          {/* ── 404 stage ── */}
          <div className="nf-stage mx-auto inline-block" aria-label="Error 404">
            <h1 className="font-heading flex select-none items-end justify-center leading-none">
              <span className="nf-digit nf-d1 text-[clamp(6rem,20vw,11.5rem)] font-black text-[#3D1F0D] [text-shadow:0_10px_30px_rgba(61,31,13,0.12)]">4</span>
              <span className="nf-digit nf-d2 text-[clamp(6rem,20vw,11.5rem)] font-black text-[#3D1F0D] [text-shadow:0_10px_30px_rgba(61,31,13,0.12)]">0</span>
              <span className="nf-digit nf-d3 text-[clamp(6rem,20vw,11.5rem)] font-black text-[#3D1F0D] [text-shadow:0_10px_30px_rgba(61,31,13,0.12)]">4</span>
            </h1>

            {/* footprints along the mascot path */}
            {[
              { left: '12%', delay: '1.4s', r: '-16deg' },
              { left: '28%', delay: '2.4s', r: '12deg'  },
              { left: '44%', delay: '3.5s', r: '-14deg' },
              { left: '60%', delay: '4.6s', r: '14deg'  },
              { left: '76%', delay: '5.9s', r: '-12deg' },
              { left: '90%', delay: '7.4s', r: '10deg'  },
            ].map((p, i) => (
              <span key={i} className="nf-print" style={{ left: p.left, animationDelay: p.delay, '--r': p.r } as React.CSSProperties} />
            ))}

            {/* mascot */}
            <div className="nf-mascot" aria-hidden="true">
              <span className="nf-steam nf-steam-1" />
              <span className="nf-steam nf-steam-2" />
              <div className="nf-bob">
                <BeanMascot />
              </div>
            </div>
          </div>

          {/* ── copy ── */}
          <h2 className="font-heading mt-10 text-2xl font-black text-[#3D1F0D] sm:text-3xl">
            Oops! This page went cold.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#7A5C44] sm:text-base">
            Looks like the page you&apos;re looking for has wandered off. Let&apos;s get you back to something freshly brewed.
          </p>

          {/* ── CTAs ── */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#3D1F0D] px-8 text-xs font-black uppercase tracking-[0.14em] text-[#FFF7ED] shadow-[0_10px_28px_rgba(61,31,13,0.25)] transition hover:-translate-y-0.5 hover:bg-[#5A2D1D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDF8F1] sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <Link
              href="/menu"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#C9943A] bg-white/60 px-8 text-xs font-black uppercase tracking-[0.14em] text-[#8B4A2F] transition hover:-translate-y-0.5 hover:bg-[#C9943A] hover:text-[#3D1F0D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDF8F1] sm:w-auto"
            >
              View Menu
            </Link>
          </div>
          <Link
            href="/outlets"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#8B4A2F] underline decoration-[#C9943A]/50 underline-offset-4 transition hover:text-[#3D1F0D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9943A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDF8F1]"
          >
            <MapPin className="h-3.5 w-3.5 text-[#C9943A]" /> Find an Outlet
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
